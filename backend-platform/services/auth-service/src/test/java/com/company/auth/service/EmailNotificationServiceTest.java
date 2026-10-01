package com.company.auth.service;

import com.company.auth.dto.OrderItemRequest;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.User;
import jakarta.mail.BodyPart;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.Test;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailNotificationServiceTest {

    @Test
    void sendsOrderStatusEmailFromConfiguredSenderToUser() {
        CapturingMailSender mailSender = new CapturingMailSender();
        EmailNotificationService service = new EmailNotificationService(mailSender, "gitsachin720@gmail.com", new InvoicePdfGenerator());

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

    @Test
    void sendsOrderConfirmationWithPdfInvoiceAttachment() throws Exception {
        CapturingMailSender mailSender = new CapturingMailSender();
        EmailNotificationService service = new EmailNotificationService(mailSender, "orders@pawmart.example", new InvoicePdfGenerator());
        User recipient = new User();
        recipient.setUsername("Customer");
        recipient.setEmail("customer@example.com");
        OrderEntity order = new OrderEntity();
        order.setOrderNumber("ORD-COD-123");
        order.setStatus("PENDING");
        order.setTotalAmount(new BigDecimal("598.00"));
        OrderItemRequest item = new OrderItemRequest();
        item.setName("Everyday Pet Food");
        item.setQuantity(1);
        item.setUnitPrice(new BigDecimal("499.00"));

        service.sendOrderCreated(order, recipient, List.of(item), "COD");

        assertEquals("PawMart Order Confirmed - ORD-COD-123", mailSender.mimeMessage.getSubject());
        assertArrayEquals(new String[]{"customer@example.com"}, Arrays.stream(mailSender.mimeMessage.getAllRecipients())
                .map(Object::toString).toArray(String[]::new));
        Multipart multipart = (Multipart) mailSender.mimeMessage.getContent();
        BodyPart invoice = multipart.getBodyPart(1);
        assertEquals("PawMart-invoice-ORD-COD-123.pdf", invoice.getFileName());
        byte[] pdf = invoice.getInputStream().readAllBytes();
        assertArrayEquals("%PDF".getBytes(StandardCharsets.US_ASCII), Arrays.copyOf(pdf, 4));
    }

    private static final class CapturingMailSender implements JavaMailSender {
        private SimpleMailMessage message;
        private MimeMessage mimeMessage;

        @Override
        public void send(SimpleMailMessage simpleMessage) {
            message = simpleMessage;
        }

        @Override
        public void send(SimpleMailMessage... simpleMessages) {
            message = simpleMessages[0];
        }

        @Override
        public MimeMessage createMimeMessage() {
            return new MimeMessage(Session.getInstance(new Properties()));
        }

        @Override
        public MimeMessage createMimeMessage(java.io.InputStream contentStream) {
            throw new UnsupportedOperationException();
        }

        @Override
        public void send(MimeMessage mimeMessage) {
            this.mimeMessage = mimeMessage;
        }

        @Override
        public void send(MimeMessage... mimeMessages) {
            mimeMessage = mimeMessages[0];
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