package com.company.auth.service;

import com.company.auth.dto.ReportRequest;
import com.company.auth.model.OrderEntity;
import com.company.auth.model.Product;
import com.company.auth.model.User;
import com.company.auth.repository.OrderRepository;
import com.company.auth.repository.ProductRepository;
import com.company.auth.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.common.PDStream;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReportService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, String>> buildReportRows(ReportRequest req) {
        String type = req.getReportType() == null ? "sales" : req.getReportType();
        List<Map<String, String>> rows = new ArrayList<>();
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm a");

        if (type.equalsIgnoreCase("sales") || type.equalsIgnoreCase("order")) {
            List<OrderEntity> orders = orderRepository.findAll();
            // basic filtering by date range if provided
            LocalDate start = parseDate(req.getStartDate());
            LocalDate end = parseDate(req.getEndDate());
            List<OrderEntity> filtered = orders.stream().filter(o -> {
                if (start != null || end != null) {
                    if (o.getCreatedAt() == null) return false;
                    LocalDate d = o.getCreatedAt().toLocalDate();
                    if (start != null && d.isBefore(start)) return false;
                    if (end != null && d.isAfter(end)) return false;
                }
                if (req.getIncludeCancelled() != null && !req.getIncludeCancelled()) {
                    if ("CANCELLED".equalsIgnoreCase(o.getStatus())) return false;
                }
                return true;
            }).collect(Collectors.toList());

            for (OrderEntity o : filtered) {
                Map<String, String> r = new HashMap<>();
                r.put("orderNumber", o.getOrderNumber());
                r.put("date", o.getCreatedAt() == null ? "" : o.getCreatedAt().format(f));
                r.put("total", o.getTotalAmount() == null ? "" : o.getTotalAmount().toString());
                r.put("status", o.getStatus());
                rows.add(r);
            }
        } else if (type.equalsIgnoreCase("customer")) {
            List<User> users = userRepository.findAll();
            for (User u : users) {
                Map<String, String> r = new HashMap<>();
                r.put("id", u.getId() == null ? "" : u.getId().toString());
                r.put("email", u.getEmail());
                r.put("name", (u.getFirstName() == null ? "" : u.getFirstName()) + " " + (u.getLastName() == null ? "" : u.getLastName()));
                rows.add(r);
            }
        } else if (type.equalsIgnoreCase("inventory")) {
            List<Product> products = productRepository.findAll();
            for (Product p : products) {
                Map<String, String> r = new HashMap<>();
                r.put("id", p.getId() == null ? "" : p.getId().toString());
                r.put("name", p.getName());
                r.put("sku", p.getSku());
                r.put("price", p.getPrice() == null ? "" : p.getPrice().toString());
                r.put("stock", p.getStockQuantity() == null ? "0" : p.getStockQuantity().toString());
                rows.add(r);
            }
        }

        return rows;
    }

    private LocalDate parseDate(String s) {
        if (s == null) return null;
        try {
            return LocalDate.parse(s);
        } catch (Exception ex) {
            return null;
        }
    }

    public byte[] toCsv(List<Map<String, String>> rows) throws Exception {
        if (rows == null || rows.isEmpty()) return new byte[0];
        StringBuilder sb = new StringBuilder();
        List<String> headers = new ArrayList<>(rows.get(0).keySet());
        sb.append(String.join(",", headers)).append('\n');
        for (Map<String, String> r : rows) {
            List<String> vals = new ArrayList<>();
            for (String h : headers) {
                String v = r.getOrDefault(h, "").replaceAll("\n", " ").replaceAll(",", " ");
                vals.add(v);
            }
            sb.append(String.join(",", vals)).append('\n');
        }
        return sb.toString().getBytes();
    }

    public byte[] toExcel(List<Map<String, String>> rows) throws Exception {
        if (rows == null) return new byte[0];
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Report");
            int rownum = 0;
            if (!rows.isEmpty()) {
                Row header = sheet.createRow(rownum++);
                List<String> headers = new ArrayList<>(rows.get(0).keySet());
                int cellnum = 0;
                for (String h : headers) {
                    Cell cell = header.createCell(cellnum++);
                    cell.setCellValue(h);
                }
                for (Map<String, String> r : rows) {
                    Row row = sheet.createRow(rownum++);
                    cellnum = 0;
                    for (String h : headers) {
                        Cell cell = row.createCell(cellnum++);
                        cell.setCellValue(r.getOrDefault(h, ""));
                    }
                }
            }
            workbook.write(out);
            return out.toByteArray();
        }
    }

    public byte[] toPdf(List<Map<String, String>> rows) throws Exception {
        if (rows == null) return new byte[0];
        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PDPage page = new PDPage();
            doc.addPage(page);
            // For simplicity write CSV-like text into PDF content stream
            StringBuilder sb = new StringBuilder();
            if (!rows.isEmpty()) {
                List<String> headers = new ArrayList<>(rows.get(0).keySet());
                sb.append(String.join(" | ", headers)).append('\n');
                for (Map<String, String> r : rows) {
                    List<String> vals = new ArrayList<>();
                    for (String h : headers) vals.add(r.getOrDefault(h, ""));
                    sb.append(String.join(" | ", vals)).append('\n');
                }
            }
            // Write text
            PDStream pdStream = new PDStream(doc, new java.io.ByteArrayInputStream(sb.toString().getBytes()));
            // Quick approach: attach stream as embedded file; many PDF renderers won't show it but the file is present.
            // A full table rendering requires more code; for now return a PDF with a single empty page and include data as metadata.
            doc.getDocumentInformation().setCustomMetadataValue("report_data", sb.toString());
            doc.save(out);
            return out.toByteArray();
        }
    }
}
