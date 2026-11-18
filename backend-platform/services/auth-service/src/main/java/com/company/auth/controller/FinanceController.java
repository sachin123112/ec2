package com.company.auth.controller;

import com.company.auth.service.FinanceService;
import com.company.auth.service.FinanceService.AccountInput;
import com.company.auth.service.FinanceService.BankAccountInput;
import com.company.auth.service.FinanceService.PartyInput;
import com.company.auth.service.FinanceService.ProductMappingInput;
import com.company.auth.service.FinanceService.ReconciliationInput;
import com.company.auth.service.FinanceService.SettingsInput;
import com.company.auth.service.FinanceService.TaxCodeInput;
import com.company.auth.service.FinanceService.VoucherInput;
import com.company.auth.repository.UserRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/finance")
public class FinanceController {

    private final FinanceService financeService;
    private final UserRepository userRepository;

    public FinanceController(FinanceService financeService, UserRepository userRepository) {
        this.financeService = financeService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String basis) {
        return financeService.getDashboard(from, to, basis);
    }

    @GetMapping("/accounts")
    public List<Map<String, Object>> accounts() {
        return financeService.listAccounts();
    }

    @PostMapping("/accounts")
    public Map<String, Object> createAccount(@RequestBody AccountInput input) {
        return financeService.saveAccount(input);
    }

    @GetMapping("/parties")
    public List<Map<String, Object>> parties(@RequestParam(required = false) String type) {
        return financeService.listParties(type);
    }

    @PostMapping("/parties")
    public Map<String, Object> createParty(@RequestBody PartyInput input) {
        return financeService.saveParty(input);
    }

    @GetMapping("/tax-codes")
    public List<Map<String, Object>> taxCodes(@RequestParam(required = false) String type) {
        return financeService.listTaxCodes(type);
    }

    @PostMapping("/tax-codes")
    public Map<String, Object> createTaxCode(@RequestBody TaxCodeInput input) {
        return financeService.saveTaxCode(input);
    }

    @GetMapping("/bank-accounts")
    public List<Map<String, Object>> bankAccounts() {
        return financeService.listBankAccounts();
    }

    @PostMapping("/bank-accounts")
    public Map<String, Object> createBankAccount(@RequestBody BankAccountInput input) {
        return financeService.saveBankAccount(input);
    }

    @GetMapping("/product-mappings")
    public List<Map<String, Object>> productMappings() {
        return financeService.listProductMappings();
    }

    @PutMapping("/product-mappings/{productId}")
    public Map<String, Object> updateProductMapping(@PathVariable Long productId, @RequestBody ProductMappingInput input) {
        return financeService.saveProductMapping(productId, input);
    }

    @GetMapping("/vouchers")
    public List<Map<String, Object>> vouchers(@RequestParam(required = false) String type) {
        return financeService.listVouchers(type);
    }

    @PostMapping(value = "/vouchers", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> createVoucher(
            Principal principal,
            @RequestPart("voucher") VoucherInput input,
            @RequestPart(value = "documents", required = false) List<MultipartFile> documents) {
        Long userId = principal == null ? null : userRepository.findByEmail(principal.getName()).map(user -> user.getId()).orElse(null);
        return financeService.createVoucher(input, userId, documents);
    }

    @GetMapping("/vouchers/{voucherId}/documents/{documentId}")
    public ResponseEntity<byte[]> downloadVoucherDocument(@PathVariable Long voucherId, @PathVariable Long documentId) {
        Map<String, Object> document = financeService.getVoucherDocument(voucherId, documentId);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType((String) document.get("contentType")));
        headers.setContentLength((Long) document.get("fileSize"));
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename((String) document.get("fileName"), StandardCharsets.UTF_8)
                .build());
        headers.set("X-Content-Type-Options", "nosniff");
        return ResponseEntity.ok().headers(headers).body((byte[]) document.get("content"));
    }

    @GetMapping("/ledger/{accountId}")
    public Map<String, Object> ledger(
            @PathVariable Long accountId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return financeService.getLedger(accountId, from, to);
    }

    @GetMapping("/trial-balance")
    public Map<String, Object> trialBalance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String basis) {
        return financeService.getTrialBalance(to, basis);
    }

    @GetMapping("/reports/{reportType}")
    public Map<String, Object> report(
            @PathVariable String reportType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String basis) {
        return financeService.getReport(reportType, from, to, basis);
    }

    @GetMapping("/reconciliation")
    public List<Map<String, Object>> unreconciledBankTransactions(@RequestParam(required = false) Long accountId) {
        return financeService.listUnreconciledLines(accountId);
    }

    @PutMapping("/reconciliation/{lineId}")
    public Map<String, Object> reconcileBankTransaction(@PathVariable Long lineId, @RequestBody ReconciliationInput input) {
        return financeService.reconcileLine(lineId, input.reference());
    }

    @GetMapping("/settings")
    public Map<String, Object> settings() {
        return financeService.getSettings();
    }

    @PutMapping("/settings")
    public Map<String, Object> updateSettings(@RequestBody SettingsInput input) {
        return financeService.saveSettings(input);
    }
}