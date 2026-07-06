package com.company.auth.controller;

import com.company.auth.dto.ReportRequest;
import com.company.auth.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/admin")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/reports")
    public ResponseEntity<byte[]> generateReport(@RequestBody ReportRequest req,
                                                 @RequestParam(required = false, defaultValue = "csv") String format) {
        try {
            List<Map<String, String>> rows = reportService.buildReportRows(req);
            String fname = (req.getReportType() == null ? "report" : req.getReportType()) + "." + format;
            byte[] payload;
            String contentType = "text/csv";
            if (format.equalsIgnoreCase("csv")) {
                payload = reportService.toCsv(rows);
                contentType = "text/csv";
            } else if (format.equalsIgnoreCase("excel") || format.equalsIgnoreCase("xlsx")) {
                payload = reportService.toExcel(rows);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            } else if (format.equalsIgnoreCase("pdf")) {
                payload = reportService.toPdf(rows);
                contentType = "application/pdf";
            } else { // default to csv
                payload = reportService.toCsv(rows);
                contentType = "text/csv";
            }

            String encoded = URLEncoder.encode(fname, StandardCharsets.UTF_8.toString()).replaceAll("\\+", "%20");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encoded)
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(payload);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
