package com.company.auth.service;

import com.company.auth.dto.OrderItemRequest;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.User;
import jakarta.mail.internet.MimeMessage;
import org.springframework.core.io.ByteArrayResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final String senderEmail;
    private final InvoicePdfGenerator invoicePdfGenerator;

    public EmailNotificationService(JavaMailSender mailSender,
                                    @Value("${spring.mail.username:}") String senderEmail,
                                    InvoicePdfGenerator invoicePdfGenerator) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
        this.invoicePdfGenerator = invoicePdfGenerator;
    }

    public void sendOrderCreated(OrderEntity order, User recipient) {
        sendOrderCreated(order, recipient, List.of(), "COD");
    }

    public void sendOrderCreated(OrderEntity order, User recipient, List<OrderItemRequest> items, String paymentMethod) {
        if (!canSendTo(recipient)) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(senderEmail);
            helper.setTo(recipient.getEmail());
            helper.setSubject("PawMart Order Confirmed - " + order.getOrderNumber());
            helper.setText("Your PawMart order has been created.\n\n"
                    + orderSummary(order)
                    + "\nPayment method: " + paymentMethod
                    + "\n\nYour invoice is attached. We will email you when the order status changes.");
            byte[] invoice = invoicePdfGenerator.generate(order, recipient, paymentMethod, items);
            helper.addAttachment("PawMart-invoice-" + order.getOrderNumber() + ".pdf",
                    new ByteArrayResource(invoice), "application/pdf");
            mailSender.send(message);
        } catch (Exception exception) {
            logger.error("Unable to send order email to {}", recipient.getEmail(), exception);
        }
    }

    public void sendOrderStatusChanged(OrderEntity order, User recipient) {
        String status = order.getStatus() == null ? "updated" : order.getStatus().toLowerCase();
        sendOrderEmail(
                recipient,
                "PawMart Order Status - " + order.getOrderNumber(),
            "Dear Customer,\n\n"
                + "Your order is " + status + ".\n\n"
                + orderSummary(order)
        );
    }

    private void sendOrderEmail(User recipient, String subject, String body) {
        if (!canSendTo(recipient)) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(recipient.getEmail());
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (RuntimeException exception) {
            logger.error("Unable to send order email to {}", recipient.getEmail(), exception);
        }
    }

    private boolean canSendTo(User recipient) {
        if (recipient == null || recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            logger.warn("Skipping order email because the recipient email is missing");
            return false;
        }
        if (senderEmail == null || senderEmail.isBlank()) {
            logger.warn("Skipping order email because MAIL_USERNAME is not configured");
            return false;
        }
        return true;
    }

    private String orderSummary(OrderEntity order) {
        return "Order: #" + order.getOrderNumber()
                + "\nStatus: " + (order.getStatus() == null ? "PENDING" : order.getStatus())
                + "\nTotal: ₹" + (order.getTotalAmount() == null ? "0" : order.getTotalAmount())
                + "\nCreated: " + order.getCreatedAt();
    }
}