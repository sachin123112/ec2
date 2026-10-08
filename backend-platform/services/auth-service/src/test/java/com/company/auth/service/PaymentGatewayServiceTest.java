package com.company.auth.service;

import com.company.auth.model.OrderEntity;
import com.company.auth.model.Payment;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentGatewayServiceTest {
    private static final String PAYU_KEY = "test-key";
    private static final String PAYU_SALT = "test-salt";

    private PaymentGatewayService gatewayService;
    private PaymentRepository paymentRepository;
    private OrderRepository orderRepository;
    private FinanceService financeService;
    private SearchService searchService;
    private Payment payment;
    private OrderEntity order;

    @BeforeEach
    void setUp() {
        paymentRepository = mock(PaymentRepository.class);
        orderRepository = mock(OrderRepository.class);
        financeService = mock(FinanceService.class);
        searchService = mock(SearchService.class);
        gatewayService = new PaymentGatewayService(paymentRepository, orderRepository, financeService, searchService);
        ReflectionTestUtils.setField(gatewayService, "payuKey", PAYU_KEY);
        ReflectionTestUtils.setField(gatewayService, "payuSalt", PAYU_SALT);

        payment = new Payment();
        payment.setOrderId(14L);
        payment.setPaymentGateway("PAYU");
        payment.setPaymentMethod("UPI");
        payment.setGatewayOrderId("T14ABC123456789");
        payment.setPaymentStatus("PENDING");

        order = new OrderEntity();
        order.setId(14L);
        order.setOrderNumber("ORD-TEST001");
        order.setTotalAmount(new java.math.BigDecimal("125.00"));
        order.setStatus("PENDING");

        when(paymentRepository.findByGatewayOrderId(payment.getGatewayOrderId())).thenReturn(Optional.of(payment));
        when(orderRepository.findById(order.getId())).thenReturn(Optional.of(order));
    }

    @Test
    void capturedPayUPaymentCompletesOrderAndPostsFinance() {
        Map<String, String> response = payUResponse("success", "captured");

        Map<String, Object> result = gatewayService.handlePayUResponse(response);

        assertEquals("COMPLETED", result.get("paymentStatus"));
        assertEquals("PROCESSING", result.get("orderStatus"));
        verify(paymentRepository).save(payment);
        verify(orderRepository).save(order);
        verify(financeService).postOnlineOrder(order);
    }

    @Test
    void pendingPayUTransactionRemainsPending() {
        Map<String, String> response = payUResponse("success", "pending");

        Map<String, Object> result = gatewayService.handlePayUResponse(response);

        assertEquals("PENDING", result.get("paymentStatus"));
        assertEquals("PENDING", result.get("orderStatus"));
        verify(paymentRepository, never()).save(any(Payment.class));
        verify(orderRepository, never()).save(any(OrderEntity.class));
        verify(financeService, never()).postOnlineOrder(any(OrderEntity.class));
    }

    @Test
    void alteredPayUAmountIsRejected() {
        Map<String, String> response = payUResponse("success", "captured");
        response.put("amount", "1.00");

        assertThrows(ResponseStatusException.class, () -> gatewayService.handlePayUResponse(response));

        assertEquals("PENDING", payment.getPaymentStatus());
        assertEquals("PENDING", order.getStatus());
        verify(financeService, never()).postOnlineOrder(any(OrderEntity.class));
    }

    @Test
    void cashOnDeliveryRemainsPending() {
        payment.setPaymentGateway(null);
        payment.setPaymentMethod("COD");
        when(paymentRepository.findByOrderId(order.getId())).thenReturn(Optional.of(payment));

        Map<String, Object> result = gatewayService.refreshPaymentStatus(order.getId());

        assertEquals("PENDING", result.get("paymentStatus"));
        assertEquals("PENDING", result.get("orderStatus"));
        verify(financeService, never()).postOnlineOrder(any(OrderEntity.class));
    }

    private Map<String, String> payUResponse(String status, String unmappedStatus) {
        Map<String, String> response = new HashMap<>();
        response.put("key", PAYU_KEY);
        response.put("txnid", payment.getGatewayOrderId());
        response.put("amount", "125.00");
        response.put("productinfo", "PawMart Order " + order.getOrderNumber());
        response.put("firstname", "Test Customer");
        response.put("email", "customer@example.test");
        response.put("udf1", String.valueOf(order.getId()));
        response.put("status", status);
        response.put("unmappedstatus", unmappedStatus);
        response.put("mihpayid", "PAYU-TXN-001");
        response.put("mode", "UPI");
        String hashInput = PAYU_SALT + "|" + status + "||||||" + response.getOrDefault("udf5", "") + "|"
            + response.getOrDefault("udf4", "") + "|" + response.getOrDefault("udf3", "") + "|"
            + response.getOrDefault("udf2", "") + "|"
            + response.get("udf1") + "|" + response.get("email") + "|" + response.get("firstname") + "|"
            + response.get("productinfo") + "|" + response.get("amount") + "|" + response.get("txnid") + "|" + PAYU_KEY;
        response.put("hash", sha512(hashInput));
        return response;
    }

    private static String sha512(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-512").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte item : digest) hex.append(String.format("%02x", item));
            return hex.toString();
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }
}