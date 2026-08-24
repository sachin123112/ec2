package com.company.auth.service;

import com.company.auth.model.OrderEntity;
import com.company.auth.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger logger = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;
    private final String senderEmail;

    public EmailNotificationService(JavaMailSender mailSender,
                                    @Value("${spring.mail.username}") String senderEmail) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    public void sendOrderCreated(OrderEntity order, User recipient) {
        sendOrderEmail(
                recipient,
                "PawMart Order Confirmed - " + order.getOrderNumber(),
                "Your PawMart order has been created.\n\n"
                        + orderSummary(order)
                        + "\n\nWe will send another email when the order status changes."
        );
    }

    public void sendOrderStatusChanged(OrderEntity order, User recipient) {
        sendOrderEmail(
                recipient,
                "PawMart Order Status - " + order.getOrderNumber(),
                "Your PawMart order status has been updated.\n\n" + orderSummary(order)
        );
    }

    private void sendOrderEmail(User recipient, String subject, String body) {
        if (recipient == null || recipient.getEmail() == null || recipient.getEmail().isBlank()) {
            logger.warn("Skipping order email because the recipient email is missing");
            return;
        }

        if (senderEmail == null || senderEmail.isBlank()) {
            logger.warn("Skipping order email because MAIL_USERNAME is not configured");
            return;
        }

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

    private String orderSummary(OrderEntity order) {
        return "Order: #" + order.getOrderNumber()
                + "\nStatus: " + (order.getStatus() == null ? "PENDING" : order.getStatus())
                + "\nTotal: ₹" + (order.getTotalAmount() == null ? "0" : order.getTotalAmount())
                + "\nCreated: " + order.getCreatedAt();
    }
}