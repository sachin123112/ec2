package com.company.auth.service;

import com.company.auth.dto.OrderItemRequest;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.User;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class InvoicePdfGenerator {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getCurrencyInstance(new Locale("en", "IN"));

    public byte[] generate(OrderEntity order, User customer, String paymentMethod, List<OrderItemRequest> items) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 42, 42, 42, 42);
            PdfWriter.getInstance(document, output);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Font headingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font mutedFont = FontFactory.getFont(FontFactory.HELVETICA, 9);

            document.add(new Paragraph("PawMart", titleFont));
            Paragraph invoiceHeading = new Paragraph("INVOICE", headingFont);
            invoiceHeading.setAlignment(Element.ALIGN_RIGHT);
            document.add(invoiceHeading);
            document.add(new Paragraph(" "));

            PdfPTable details = new PdfPTable(2);
            details.setWidthPercentage(100);
            addDetail(details, "Invoice / Order", order.getOrderNumber(), bodyFont);
            addDetail(details, "Order date", order.getCreatedAt() == null ? "Pending" : order.getCreatedAt().format(DATE_FORMAT), bodyFont);
            addDetail(details, "Customer", customer.getUsername(), bodyFont);
            addDetail(details, "Email", customer.getEmail(), bodyFont);
            addDetail(details, "Payment method", paymentMethod, bodyFont);
            addDetail(details, "Payment status", "Pending collection", bodyFont);
            document.add(details);
            document.add(new Paragraph(" "));

            PdfPTable lineItems = new PdfPTable(new float[]{5, 1, 2, 2});
            lineItems.setWidthPercentage(100);
            addHeader(lineItems, "Item", headingFont);
            addHeader(lineItems, "Qty", headingFont);
            addHeader(lineItems, "Unit price", headingFont);
            addHeader(lineItems, "Amount", headingFont);

            BigDecimal subtotal = BigDecimal.ZERO;
            int itemCount = 0;
            if (items != null) {
                for (OrderItemRequest item : items) {
                    if (item == null || item.getQuantity() <= 0) continue;
                    BigDecimal unitPrice = item.getUnitPrice() == null ? BigDecimal.ZERO : item.getUnitPrice();
                    BigDecimal amount = unitPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                    subtotal = subtotal.add(amount);
                    lineItems.addCell(cell(item.getName() == null ? "Product" : item.getName(), bodyFont));
                    lineItems.addCell(cell(String.valueOf(item.getQuantity()), bodyFont));
                    lineItems.addCell(cell(formatCurrency(unitPrice), bodyFont));
                    lineItems.addCell(cell(formatCurrency(amount), bodyFont));
                    itemCount++;
                }
            }

            BigDecimal total = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
            if (itemCount == 0) {
                lineItems.addCell(cell("Order total", bodyFont));
                lineItems.addCell(cell("1", bodyFont));
                lineItems.addCell(cell(formatCurrency(total), bodyFont));
                lineItems.addCell(cell(formatCurrency(total), bodyFont));
                subtotal = total;
            }
            document.add(lineItems);

            BigDecimal delivery = total.subtract(subtotal).max(BigDecimal.ZERO);
            PdfPTable totals = new PdfPTable(2);
            totals.setWidthPercentage(45);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
            addTotal(totals, "Items", formatCurrency(subtotal), bodyFont);
            addTotal(totals, "Delivery", formatCurrency(delivery), bodyFont);
            addTotal(totals, "Total", formatCurrency(total), headingFont);
            document.add(totals);
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Thank you for shopping with PawMart.", mutedFont));
            document.close();
            return output.toByteArray();
        } catch (DocumentException exception) {
            throw new IllegalStateException("Unable to generate order invoice", exception);
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Unable to create order invoice", exception);
        }
    }

    private void addDetail(PdfPTable table, String label, String value, Font font) {
        table.addCell(cell(label, font));
        table.addCell(cell(value == null || value.isBlank() ? "-" : value, font));
    }

    private void addHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = cell(text, font);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    private void addTotal(PdfPTable table, String label, String amount, Font font) {
        table.addCell(cell(label, font));
        table.addCell(cell(amount, font));
    }

    private PdfPCell cell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(7);
        return cell;
    }

    private String formatCurrency(BigDecimal amount) {
        return CURRENCY_FORMAT.format(amount);
    }
}