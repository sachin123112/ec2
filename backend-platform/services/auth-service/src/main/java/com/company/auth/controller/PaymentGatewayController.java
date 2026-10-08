package com.company.auth.controller;

import com.company.auth.service.PaymentGatewayService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentGatewayController {
    private final PaymentGatewayService paymentGatewayService;
    private final String frontendUrl;

    public PaymentGatewayController(PaymentGatewayService paymentGatewayService,
                                    @Value("${APP_FRONTEND_URL:http://localhost:5173}") String frontendUrl) {
        this.paymentGatewayService = paymentGatewayService;
        this.frontendUrl = frontendUrl.endsWith("/")
            ? frontendUrl.substring(0, frontendUrl.length() - 1)
            : frontendUrl;
    }

    @PostMapping(value = "/payu/return", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<Void> payUReturn(@RequestParam Map<String, String> response) {
        Map<String, Object> payment = paymentGatewayService.handlePayUResponse(response);
        String redirectUrl = frontendUrl + "/#/checkout/success?orderId=" + payment.get("orderId");
        return ResponseEntity.status(HttpStatus.SEE_OTHER).location(URI.create(redirectUrl)).build();
    }
}