package com.company.auth.service;

import com.company.auth.model.OrderEntity;
import com.company.auth.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailNotificationServiceTest {

    @Test
    void sendsOrderStatusEmailFromConfiguredSenderToUser() {
        CapturingMailSender mailSender = new CapturingMailSender();
        EmailNotificationService service = new EmailNotificationService(mailSender, "gitsachin720@gmail.com");

        User recipient = new User();
        recipient.setEmail("customer@example.com");
        OrderEntity order = new OrderEntity();
        order.setOrderNumber("ORD-DEMO");
        order.setStatus("SHIPPED");
        order.setTotalAmount(new BigDecimal("139.00"));

        service.sendOrderStatusChanged(order, recipient);

        assertEquals("gitsachin720@gmail.com", mailSender.message.getFrom());
        assertArrayEquals(new String[]{"customer@example.com"}, mailSender.message.getTo());
        assertEquals("PawMart Order Status - ORD-DEMO", mailSender.message.getSubject());
        assertTrue(mailSender.message.getText().contains("Status: SHIPPED"));
        assertTrue(mailSender.message.getText().contains("Order: #ORD-DEMO"));
    }

    private static final class CapturingMailSender implements JavaMailSender {
        private SimpleMailMessage message;

        @Override
        public void send(SimpleMailMessage simpleMessage) {
            message = simpleMessage;
        }

        @Override
        public void send(SimpleMailMessage... simpleMessages) {
            message = simpleMessages[0];
        }

        @Override
        public jakarta.mail.internet.MimeMessage createMimeMessage() {
            throw new UnsupportedOperationException();
        }

        @Override
        public jakarta.mail.internet.MimeMessage createMimeMessage(java.io.InputStream contentStream) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(jakarta.mail.internet.MimeMessage mimeMessage) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(jakarta.mail.internet.MimeMessage... mimeMessages) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(org.springframework.mail.javamail.MimeMessagePreparator mimeMessagePreparator) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(org.springframework.mail.javamail.MimeMessagePreparator... mimeMessagePreparators) {
            throw new UnsupportedOperationException();
        }
    }
}