package com.company.auth.service;

import com.company.auth.model.OrderEntity;
import com.company.auth.model.Payment;
import com.company.auth.model.User;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.PaymentRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentGatewayService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final FinanceService financeService;
    private final SearchService searchService;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${PAYU_KEY:}")
    private String payuKey;

    @Value("${PAYU_SALT:}")
    private String payuSalt;

    @Value("${PAYU_TEST_MODE:true}")
    private boolean payuTestMode;

    @Value("${PHONEPE_CLIENT_ID:}")
    private String phonePeClientId;

    @Value("${PHONEPE_CLIENT_SECRET:}")
    private String phonePeClientSecret;

    @Value("${PHONEPE_CLIENT_VERSION:1}")
    private String phonePeClientVersion;

    @Value("${PHONEPE_TEST_MODE:true}")
    private boolean phonePeTestMode;

    @Value("${APP_PUBLIC_BASE_URL:http://localhost:8080}")
    private String publicBaseUrl;

    @Value("${APP_FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    public PaymentGatewayService(PaymentRepository paymentRepository, OrderRepository orderRepository,
                                 FinanceService financeService, SearchService searchService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.financeService = financeService;
        this.searchService = searchService;
    }

    public boolean isPayUConfigured() {
        return payuKey != null && !payuKey.isBlank() && payuSalt != null && !payuSalt.isBlank();
    }

    public boolean isPhonePeConfigured() {
        return phonePeClientId != null && !phonePeClientId.isBlank()
            && phonePeClientSecret != null && !phonePeClientSecret.isBlank();
    }

    public Map<String, Object> initiate(Payment payment, OrderEntity order, User user,
                                        String selectedMethod, String customerPhone) {
        String gatewayOrderId = "T" + order.getId() + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        payment.setGatewayOrderId(gatewayOrderId);
        paymentRepository.save(payment);

        return switch (payment.getPaymentGateway()) {
            case "PAYU" -> initiatePayU(payment, order, user, selectedMethod, customerPhone);
            case "PHONEPE" -> initiatePhonePe(payment, order, selectedMethod);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported payment provider");
        };
    }

    private Map<String, Object> initiatePayU(Payment payment, OrderEntity order, User user,
                                             String selectedMethod, String customerPhone) {
        requireConfigured(payuKey, payuSalt, "PayU");
        Map<String, String> form = new LinkedHashMap<>();
        form.put("key", payuKey);
        form.put("txnid", payment.getGatewayOrderId());
        form.put("amount", order.getTotalAmount().setScale(2, RoundingMode.HALF_UP).toPlainString());
        form.put("productinfo", "PawMart Order " + order.getOrderNumber());
        form.put("firstname", nonBlank(user.getFirstName(), user.getUsername()));
        form.put("email", user.getEmail());
        form.put("phone", normalizePhone(customerPhone));
        form.put("surl", payuReturnUrl());
        form.put("furl", payuReturnUrl());
        form.put("udf1", String.valueOf(order.getId()));
        if (selectedMethod != null && !selectedMethod.isBlank()) {
            form.put("enforced_payment", payuPaymentMode(selectedMethod));
        }
        form.put("hash", payuRequestHash(form));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("gateway", "PAYU");
        result.put("checkoutUrl", payuTestMode ? "https://test.payu.in/_payment" : "https://secure.payu.in/_payment");
        result.put("formData", form);
        result.put("orderId", order.getId());
        return result;
    }

    private Map<String, Object> initiatePhonePe(Payment payment, OrderEntity order, String selectedMethod) {
        requireConfigured(phonePeClientId, phonePeClientSecret, "PhonePe");
        String token = getPhonePeToken();
        Map<String, Object> paymentFlow = new LinkedHashMap<>();
        paymentFlow.put("type", "PG_CHECKOUT");
        paymentFlow.put("merchantUrls", Map.of("redirectUrl", paymentReturnUrl(order.getId())));
        paymentFlow.put("paymentModeConfig", Map.of(
            "version", "V2",
            "enabledPaymentModes", phonePePaymentModes(selectedMethod)
        ));

        Map<String, Object> requestBody = Map.of(
            "merchantOrderId", payment.getGatewayOrderId(),
            "amount", order.getTotalAmount().movePointRight(2).longValueExact(),
            "expireAfter", 1200,
            "paymentFlow", paymentFlow
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "O-Bearer " + token);

        Map<String, Object> response = postJson(phonePeBaseUrl() + "/checkout/v2/pay", requestBody, headers);
        Object redirectUrl = response.get("redirectUrl");
        if (!(redirectUrl instanceof String url) || url.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PhonePe did not return a checkout URL");
        }
        return Map.of("gateway", "PHONEPE", "checkoutUrl", url, "orderId", order.getId());
    }

    @Transactional
    public Map<String, Object> handlePayUResponse(Map<String, String> response) {
        requireConfigured(payuKey, payuSalt, "PayU");
        String gatewayOrderId = response.get("txnid");
        Payment payment = paymentRepository.findByGatewayOrderId(gatewayOrderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment transaction not found"));
        OrderEntity order = orderRepository.findById(payment.getOrderId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!"PAYU".equals(payment.getPaymentGateway())
                || !payuKey.equals(response.get("key"))
                || !sameAmount(order.getTotalAmount(), response.get("amount"))
                || !validPayUResponseHash(response)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PayU payment response could not be verified");
        }

        String status = payuPaymentState(response.get("status"), response.get("unmappedstatus"));
        updatePayment(payment, order, status, response.get("mihpayid"), payuPaymentMethod(response.get("mode")));
        return paymentResult(order, payment);
    }

    @Transactional
    public Map<String, Object> refreshPaymentStatus(Long orderId) {
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        Payment payment = paymentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
        if ("PHONEPE".equals(payment.getPaymentGateway()) && "PENDING".equals(payment.getPaymentStatus())) {
            requireConfigured(phonePeClientId, phonePeClientSecret, "PhonePe");
            String token = getPhonePeToken();
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "O-Bearer " + token);
            headers.setContentType(MediaType.APPLICATION_JSON);
            String url = phonePeBaseUrl() + "/checkout/v2/order/" + payment.getGatewayOrderId() + "/status?details=true";
            Map<String, Object> response = getJson(url, headers);
            String state = String.valueOf(response.getOrDefault("state", "PENDING"));
            Object amount = response.get("amount");
            long expectedAmount = order.getTotalAmount().movePointRight(2).longValueExact();
            if ("COMPLETED".equalsIgnoreCase(state) && amount instanceof Number number
                    && number.longValue() == expectedAmount) {
                updatePayment(payment, order, "COMPLETED", phonePeTransactionId(response), phonePePaymentMethod(response));
            } else if ("FAILED".equalsIgnoreCase(state)) {
                updatePayment(payment, order, "FAILED", phonePeTransactionId(response), payment.getPaymentMethod());
            }
        } else if ("PAYU".equals(payment.getPaymentGateway()) && "PENDING".equals(payment.getPaymentStatus())) {
            reconcilePayU(payment, order);
        }
        return paymentResult(order, payment);
    }

    private void updatePayment(Payment payment, OrderEntity order, String status,
                               String transactionId, String method) {
        if (!"PENDING".equals(payment.getPaymentStatus()) || "PENDING".equals(status)) return;
        payment.setPaymentStatus(status);
        if (transactionId != null && !transactionId.isBlank()) payment.setGatewayTransactionId(transactionId);
        if (method != null && !method.isBlank()) payment.setPaymentMethod(method);
        if ("COMPLETED".equals(status)) {
            order.setStatus("PROCESSING");
            financeService.postOnlineOrder(order);
        }
        else if ("FAILED".equals(status)) order.setStatus("CANCELED");
        paymentRepository.save(payment);
        orderRepository.save(order);
        searchService.indexOrder(order);
    }

    private Map<String, Object> paymentResult(OrderEntity order, Payment payment) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderId", order.getId());
        result.put("orderNumber", order.getOrderNumber());
        result.put("orderStatus", order.getStatus());
        result.put("paymentStatus", payment.getPaymentStatus());
        result.put("paymentMethod", payment.getPaymentMethod());
        return result;
    }

    private String getPhonePeToken() {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", phonePeClientId);
        form.add("client_version", phonePeClientVersion);
        form.add("client_secret", phonePeClientSecret);
        form.add("grant_type", "client_credentials");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        try {
            Map<String, Object> response = restTemplate.exchange(
                phonePeAuthorizationBaseUrl() + "/v1/oauth/token", HttpMethod.POST,
                new HttpEntity<>(form, headers), new TypeReferenceResponse()
            ).getBody();
            Object token = response == null ? null : response.get("access_token");
            if (token instanceof String value && !value.isBlank()) return value;
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to authenticate with PhonePe", exception);
        }
        throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "PhonePe did not return an access token");
    }

    private void reconcilePayU(Payment payment, OrderEntity order) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("key", payuKey);
        form.add("command", "verify_payment");
        form.add("var1", payment.getGatewayOrderId());
        form.add("hash", sha512(payuKey + "|verify_payment|" + payment.getGatewayOrderId() + "|" + payuSalt));
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        try {
            Map<String, Object> response = restTemplate.exchange(
                payuBaseUrl() + "/merchant/postservice.php?form=2", HttpMethod.POST,
                new HttpEntity<>(form, headers), new TypeReferenceResponse()
            ).getBody();
            Object detailsValue = response == null ? null : response.get("transaction_details");
            if (!(detailsValue instanceof Map<?, ?> details)) return;
            Object transactionValue = details.get(payment.getGatewayOrderId());
            if (!(transactionValue instanceof Map<?, ?> transaction)) return;

            String statusValue = String.valueOf(transaction.get("status"));
            String unmappedStatusValue = String.valueOf(transaction.get("unmappedstatus"));
            String status = payuPaymentState(
                "null".equals(statusValue) ? "" : statusValue,
                "null".equals(unmappedStatusValue) ? "" : unmappedStatusValue
            );
            if ("COMPLETED".equals(status)
                    && sameAmount(order.getTotalAmount(), String.valueOf(transaction.get("amt")))) {
                updatePayment(payment, order, status,
                    String.valueOf(transaction.get("mihpayid")),
                    payuPaymentMethod(String.valueOf(transaction.get("mode"))));
            } else if ("FAILED".equals(status)) {
                updatePayment(payment, order, status,
                    String.valueOf(transaction.get("mihpayid")), payment.getPaymentMethod());
            }
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to check PayU payment status", exception);
        }
    }

    private Map<String, Object> postJson(String url, Object body, HttpHeaders headers) {
        try {
            return restTemplate.exchange(url, HttpMethod.POST, new HttpEntity<>(body, headers), new TypeReferenceResponse()).getBody();
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to start PhonePe checkout", exception);
        }
    }

    private Map<String, Object> getJson(String url, HttpHeaders headers) {
        try {
            return restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), new TypeReferenceResponse()).getBody();
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Unable to check PhonePe payment status", exception);
        }
    }

    private String payuRequestHash(Map<String, String> fields) {
        String raw = fields.get("key") + "|" + fields.get("txnid") + "|" + fields.get("amount") + "|"
            + fields.get("productinfo") + "|" + fields.get("firstname") + "|" + fields.get("email") + "|"
            + fields.getOrDefault("udf1", "") + "|" + fields.getOrDefault("udf2", "") + "|"
            + fields.getOrDefault("udf3", "") + "|" + fields.getOrDefault("udf4", "") + "|"
            + fields.getOrDefault("udf5", "") + "||||||" + payuSalt;
        return sha512(raw);
    }

    private String payuReturnUrl() {
        return trimSlash(publicBaseUrl) + "/api/v1/payments/payu/return";
    }

    private String paymentReturnUrl(Long orderId) {
        return trimSlash(frontendUrl) + "/#/checkout/success?orderId=" + orderId;
    }

    private String phonePeBaseUrl() {
        return phonePeTestMode
            ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
            : "https://api.phonepe.com/apis/pg";
    }

    private String phonePeAuthorizationBaseUrl() {
        return phonePeTestMode
            ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
            : "https://api.phonepe.com/apis/identity-manager";
    }

    private String payuBaseUrl() {
        return payuTestMode ? "https://test.payu.in" : "https://info.payu.in";
    }

    private List<Map<String, Object>> phonePePaymentModes(String method) {
        String normalized = normalizeMethod(method);
        if (normalized.equals("UPI")) return List.of(Map.of("type", "UPI"));
        if (normalized.equals("NET_BANKING")) return List.of(Map.of("type", "NET_BANKING"));
        if (normalized.equals("CREDIT_CARD")) return List.of(Map.of("type", "CARD", "types", List.of("CREDIT_CARD")));
        if (normalized.equals("DEBIT_CARD")) return List.of(Map.of("type", "CARD", "types", List.of("DEBIT_CARD")));
        if (normalized.equals("CARD")) return List.of(Map.of("type", "CARD", "types", List.of("CREDIT_CARD", "DEBIT_CARD")));
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose UPI, net banking, or a card payment");
    }

    private String payuPaymentMode(String method) {
        return switch (normalizeMethod(method)) {
            case "UPI" -> "upi";
            case "NET_BANKING" -> "netbanking";
            case "CREDIT_CARD" -> "creditcard";
            case "DEBIT_CARD" -> "debitcard";
            case "CARD" -> "creditcard|debitcard";
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose UPI, net banking, or a card payment");
        };
    }

    private String normalizeMethod(String method) {
        if (method == null) return "";
        String normalized = method.trim().toUpperCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        if ("QR_CODE".equals(normalized)) return "UPI";
        return normalized;
    }

    private String payuPaymentMethod(String mode) {
        if (mode == null) return "ONLINE";
        return switch (mode.toUpperCase(Locale.ROOT)) {
            case "UPI" -> "UPI";
            case "NB" -> "NET_BANKING";
            case "CC" -> "CREDIT_CARD";
            case "DC" -> "DEBIT_CARD";
            default -> "ONLINE";
        };
    }

    private String payuPaymentState(String status, String unmappedStatus) {
        if ("success".equalsIgnoreCase(status)
                && List.of("captured", "settled").contains(String.valueOf(unmappedStatus).toLowerCase(Locale.ROOT))) {
            return "COMPLETED";
        }
        if ("pending".equalsIgnoreCase(status)
                || "pending".equalsIgnoreCase(unmappedStatus)
                || "success".equalsIgnoreCase(status) && (unmappedStatus == null || unmappedStatus.isBlank())) {
            return "PENDING";
        }
        return "FAILED";
    }

    private String phonePePaymentMethod(Map<String, Object> response) {
        Object detailsValue = response.get("paymentDetails");
        if (!(detailsValue instanceof List<?> details) || details.isEmpty() || !(details.get(0) instanceof Map<?, ?> detail)) return "ONLINE";
        Object instrumentValue = detail.get("instrument");
        if (instrumentValue instanceof Map<?, ?> instrument && instrument.get("type") instanceof String type) {
            if ("CREDIT_CARD".equals(type) || "DEBIT_CARD".equals(type)) return type;
            if ("NET_BANKING".equals(type)) return type;
        }
        Object mode = detail.get("paymentMode");
        return mode instanceof String value && value.startsWith("UPI") ? "UPI" : "ONLINE";
    }

    private String phonePeTransactionId(Map<String, Object> response) {
        Object detailsValue = response.get("paymentDetails");
        if (detailsValue instanceof List<?> details && !details.isEmpty() && details.get(0) instanceof Map<?, ?> detail) {
            Object transactionId = detail.get("transactionId");
            return transactionId instanceof String value ? value : null;
        }
        return null;
    }

    private boolean validPayUResponseHash(Map<String, String> response) {
        String receivedHash = response.get("hash");
        if (receivedHash == null) return false;
        String raw = payuSalt + "|" + response.getOrDefault("status", "") + "||||||"
            + response.getOrDefault("udf5", "") + "|" + response.getOrDefault("udf4", "") + "|"
            + response.getOrDefault("udf3", "") + "|" + response.getOrDefault("udf2", "") + "|"
            + response.getOrDefault("udf1", "") + "|" + response.getOrDefault("email", "") + "|"
            + response.getOrDefault("firstname", "") + "|" + response.getOrDefault("productinfo", "") + "|"
            + response.getOrDefault("amount", "") + "|" + response.getOrDefault("txnid", "") + "|"
            + response.getOrDefault("key", "");
        return MessageDigest.isEqual(sha512(raw).getBytes(StandardCharsets.UTF_8), receivedHash.toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
    }

    private static boolean sameAmount(BigDecimal expected, String actual) {
        try {
            return expected.compareTo(new BigDecimal(actual)) == 0;
        } catch (NumberFormatException | NullPointerException exception) {
            return false;
        }
    }

    private static String normalizePhone(String value) {
        String digits = value == null ? "" : value.replaceAll("\\D", "");
        if (digits.length() > 10) digits = digits.substring(digits.length() - 10);
        if (digits.length() != 10) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid customer phone number is required for payment");
        return digits;
    }

    private static String nonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private static void requireConfigured(String first, String second, String provider) {
        if (first == null || first.isBlank() || second == null || second.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, provider + " checkout is not configured");
        }
    }

    private static String trimSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private static String sha512(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-512").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte item : digest) hex.append(String.format("%02x", item));
            return hex.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-512 is unavailable", exception);
        }
    }

    private final class TypeReferenceResponse extends org.springframework.core.ParameterizedTypeReference<Map<String, Object>> {
    }
}