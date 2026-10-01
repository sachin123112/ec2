package com.company.auth.service;

import com.company.auth.model.OrderEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
public class FinanceService {

    private final JdbcTemplate jdbc;

    public FinanceService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(LocalDate from, LocalDate to, String basis) {
        LocalDate startDate = from == null ? LocalDate.now().withMonth(1).withDayOfMonth(1) : from;
        LocalDate endDate = to == null ? LocalDate.now() : to;
        String selectedBasis = basis == null || basis.isBlank() ? "ACCRUAL" : requiredChoice(basis, "Accounting basis", List.of("CASH", "ACCRUAL"));
        BigDecimal sales = groupBalance("INCOME", "CREDIT", startDate, endDate, selectedBasis);
        BigDecimal purchases = accountTypeBalance("PURCHASE", "DEBIT", startDate, endDate, selectedBasis);
        BigDecimal expenses = groupBalance("EXPENSE", "DEBIT", startDate, endDate, selectedBasis);
        BigDecimal receivables = accountTypeBalance("RECEIVABLE", "DEBIT", null, endDate, selectedBasis);
        BigDecimal payables = accountTypeBalance("PAYABLE", "CREDIT", null, endDate, selectedBasis);
        BigDecimal cash = accountTypesBalance(List.of("CASH", "BANK"), "DEBIT", null, endDate, selectedBasis);
        BigDecimal gstPayable = accountTypeBalance("GST_PAYABLE", "CREDIT", null, endDate, selectedBasis);
        BigDecimal tdsPayable = accountTypeBalance("TDS_PAYABLE", "CREDIT", null, endDate, selectedBasis);
        Integer posted = jdbc.queryForObject("SELECT COUNT(*) FROM finance_vouchers WHERE status = 'POSTED' AND voucher_date BETWEEN ? AND ? AND accounting_basis = ?", Integer.class, startDate, endDate, selectedBasis);
        Integer drafts = jdbc.queryForObject("SELECT COUNT(*) FROM finance_vouchers WHERE status = 'DRAFT'", Integer.class);

        return Map.ofEntries(
            Map.entry("from", startDate),
            Map.entry("to", endDate),
            Map.entry("accountingBasis", selectedBasis),
            Map.entry("totalSales", sales),
            Map.entry("totalPurchases", purchases),
            Map.entry("receivables", receivables),
            Map.entry("vendorPayables", payables),
            Map.entry("cashBankBalance", cash),
            Map.entry("gstPayable", gstPayable),
            Map.entry("tdsPayable", tdsPayable),
            Map.entry("profitLoss", sales.subtract(expenses)),
            Map.entry("postedVouchers", posted == null ? 0 : posted),
            Map.entry("draftVouchers", drafts == null ? 0 : drafts)
        );
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAccounts() {
        return jdbc.queryForList("SELECT id, code, name, account_group AS \"accountGroup\", account_type AS \"accountType\", opening_balance AS \"openingBalance\", opening_balance_side AS \"openingBalanceSide\", active FROM finance_accounts ORDER BY code");
    }

    @Transactional
    public Map<String, Object> saveAccount(AccountInput input) {
        requireText(input.code(), "Account code");
        requireText(input.name(), "Account name");
        String group = requiredChoice(input.accountGroup(), "Account group", List.of("ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"));
        String type = input.accountType() == null || input.accountType().isBlank() ? "GENERAL" : input.accountType().trim().toUpperCase();
        BigDecimal opening = nonNegative(input.openingBalance(), "Opening balance");
        String side = input.openingBalanceSide() == null ? "DEBIT" : requiredChoice(input.openingBalanceSide(), "Opening balance side", List.of("DEBIT", "CREDIT"));
        Long id = jdbc.queryForObject("INSERT INTO finance_accounts (code, name, account_group, account_type, opening_balance, opening_balance_side) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, input.code().trim(), input.name().trim(), group, type, opening, side);
        if (opening.signum() > 0) {
            if ("OPENING_BALANCE".equals(type)) throw new ResponseStatusException(BAD_REQUEST, "Opening Balance Equity cannot have an opening balance");
            postOpeningBalance(id, null, input.name().trim(), opening, side, "ACCOUNT-" + id);
        }
        return jdbc.queryForMap("SELECT id, code, name, account_group AS \"accountGroup\", account_type AS \"accountType\", opening_balance AS \"openingBalance\", opening_balance_side AS \"openingBalanceSide\", active FROM finance_accounts WHERE id = ?", id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listParties(String type) {
        String partySql = "SELECT p.id, p.party_type AS \"partyType\", p.name, p.gstin, p.pan, p.email, p.phone, p.address, p.opening_balance AS \"openingBalance\", p.opening_balance_side AS \"openingBalanceSide\", p.active, COALESCE(SUM(CASE WHEN a.id IS NULL THEN 0 WHEN p.party_type = 'CUSTOMER' THEN l.debit - l.credit ELSE l.credit - l.debit END), 0) AS \"outstandingBalance\" FROM finance_parties p LEFT JOIN finance_vouchers v ON v.party_id = p.id AND v.status = 'POSTED' LEFT JOIN finance_voucher_lines l ON l.voucher_id = v.id LEFT JOIN finance_accounts a ON a.id = l.account_id AND a.account_type = CASE WHEN p.party_type = 'CUSTOMER' THEN 'RECEIVABLE' ELSE 'PAYABLE' END";
        if (type == null || type.isBlank()) {
            return jdbc.queryForList(partySql + " GROUP BY p.id ORDER BY p.name");
        }
        String normalizedType = requiredChoice(type, "Party type", List.of("CUSTOMER", "VENDOR"));
        return jdbc.queryForList(partySql + " WHERE p.party_type = ? GROUP BY p.id ORDER BY p.name", normalizedType);
    }

    @Transactional
    public Map<String, Object> saveParty(PartyInput input) {
        String type = requiredChoice(input.partyType(), "Party type", List.of("CUSTOMER", "VENDOR"));
        requireText(input.name(), "Party name");
        BigDecimal opening = nonNegative(input.openingBalance(), "Opening balance");
        String side = input.openingBalanceSide() == null ? "DEBIT" : requiredChoice(input.openingBalanceSide(), "Opening balance side", List.of("DEBIT", "CREDIT"));
        Long id = jdbc.queryForObject("INSERT INTO finance_parties (party_type, name, gstin, pan, email, phone, address, opening_balance, opening_balance_side) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, type, input.name().trim(), blankToNull(input.gstin()), blankToNull(input.pan()), blankToNull(input.email()), blankToNull(input.phone()), blankToNull(input.address()), opening, side);
        if (opening.signum() > 0) {
            Long controlAccountId = getRequiredAccountId("CUSTOMER".equals(type) ? "RECEIVABLE" : "PAYABLE");
            postOpeningBalance(controlAccountId, id, input.name().trim(), opening, side, type + "-" + id);
        }
        return jdbc.queryForMap("SELECT id, party_type AS \"partyType\", name, gstin, pan, email, phone, address, opening_balance AS \"openingBalance\", opening_balance_side AS \"openingBalanceSide\", active FROM finance_parties WHERE id = ?", id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listTaxCodes(String type) {
        if (type == null || type.isBlank()) {
            return jdbc.queryForList("SELECT id, tax_type AS \"taxType\", code, description, rate, component, effective_from AS \"effectiveFrom\", effective_to AS \"effectiveTo\", active FROM finance_tax_codes ORDER BY tax_type, code, effective_from");
        }
        String normalizedType = requiredChoice(type, "Tax type", List.of("GST", "TDS"));
        return jdbc.queryForList("SELECT id, tax_type AS \"taxType\", code, description, rate, component, effective_from AS \"effectiveFrom\", effective_to AS \"effectiveTo\", active FROM finance_tax_codes WHERE tax_type = ? ORDER BY code, effective_from", normalizedType);
    }

    @Transactional
    public Map<String, Object> saveTaxCode(TaxCodeInput input) {
        String type = requiredChoice(input.taxType(), "Tax type", List.of("GST", "TDS"));
        requireText(input.code(), "Tax code");
        requireText(input.description(), "Tax description");
        BigDecimal rate = input.rate();
        if (rate == null || rate.signum() < 0 || rate.compareTo(new BigDecimal("100")) > 0) {
            throw new ResponseStatusException(BAD_REQUEST, "Tax rate must be between 0 and 100 percent");
        }
        String component = input.component() == null ? "TOTAL" : requiredChoice(input.component(), "Tax component", List.of("TOTAL", "CGST", "SGST", "IGST", "TDS"));
        Long id = jdbc.queryForObject("INSERT INTO finance_tax_codes (tax_type, code, description, rate, component, effective_from, effective_to) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, type, input.code().trim(), input.description().trim(), rate, component, input.effectiveFrom(), input.effectiveTo());
        return jdbc.queryForMap("SELECT id, tax_type AS \"taxType\", code, description, rate, component, effective_from AS \"effectiveFrom\", effective_to AS \"effectiveTo\", active FROM finance_tax_codes WHERE id = ?", id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listBankAccounts() {
        return jdbc.queryForList("SELECT b.id, b.account_id AS \"accountId\", a.code AS \"accountCode\", a.name AS \"accountName\", b.bank_name AS \"bankName\", b.account_holder AS \"accountHolder\", b.account_number AS \"accountNumber\", b.ifsc, b.opening_balance AS \"openingBalance\", b.active FROM finance_bank_accounts b JOIN finance_accounts a ON a.id = b.account_id ORDER BY b.bank_name");
    }

    @Transactional
    public Map<String, Object> saveBankAccount(BankAccountInput input) {
        requireText(input.bankName(), "Bank name");
        if (input.accountId() == null || !exists("SELECT EXISTS (SELECT 1 FROM finance_accounts WHERE id = ? AND account_type = 'BANK' AND active = TRUE)", input.accountId())) {
            throw new ResponseStatusException(BAD_REQUEST, "Select an active BANK ledger account");
        }
        BigDecimal opening = nonNegative(input.openingBalance(), "Opening balance");
        if (opening.signum() > 0 && jdbc.queryForObject("SELECT opening_balance FROM finance_accounts WHERE id = ?", BigDecimal.class, input.accountId()).signum() > 0) {
            throw new ResponseStatusException(BAD_REQUEST, "This bank ledger already has an opening balance");
        }
        Long id = jdbc.queryForObject("INSERT INTO finance_bank_accounts (account_id, bank_name, account_holder, account_number, ifsc, opening_balance) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
                Long.class, input.accountId(), input.bankName().trim(), blankToNull(input.accountHolder()), blankToNull(input.accountNumber()), blankToNull(input.ifsc()), opening);
        if (opening.signum() > 0) {
            jdbc.update("UPDATE finance_accounts SET opening_balance = ?, opening_balance_side = 'DEBIT' WHERE id = ?", opening, input.accountId());
            postOpeningBalance(input.accountId(), null, input.bankName().trim(), opening, "DEBIT", "BANK-" + id);
        }
        return jdbc.queryForMap("SELECT id, account_id AS \"accountId\", bank_name AS \"bankName\", account_holder AS \"accountHolder\", account_number AS \"accountNumber\", ifsc, opening_balance AS \"openingBalance\", active FROM finance_bank_accounts WHERE id = ?", id);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listProductMappings() {
        return jdbc.queryForList("SELECT m.id, m.product_id AS \"productId\", p.name AS \"productName\", m.sales_account_id AS \"salesAccountId\", m.purchase_account_id AS \"purchaseAccountId\", m.inventory_account_id AS \"inventoryAccountId\", m.hsn_sac_code AS \"hsnSacCode\", m.tax_code_id AS \"taxCodeId\" FROM finance_product_mappings m JOIN products p ON p.id = m.product_id ORDER BY p.name");
    }

    @Transactional
    public Map<String, Object> saveProductMapping(Long productId, ProductMappingInput input) {
        if (!exists("SELECT EXISTS (SELECT 1 FROM products WHERE id = ?)", productId)) {
            throw new ResponseStatusException(NOT_FOUND, "Product not found");
        }
        jdbc.update("INSERT INTO finance_product_mappings (product_id, sales_account_id, purchase_account_id, inventory_account_id, hsn_sac_code, tax_code_id) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (product_id) DO UPDATE SET sales_account_id = EXCLUDED.sales_account_id, purchase_account_id = EXCLUDED.purchase_account_id, inventory_account_id = EXCLUDED.inventory_account_id, hsn_sac_code = EXCLUDED.hsn_sac_code, tax_code_id = EXCLUDED.tax_code_id",
                productId, input.salesAccountId(), input.purchaseAccountId(), input.inventoryAccountId(), blankToNull(input.hsnSacCode()), input.taxCodeId());
        return jdbc.queryForMap("SELECT m.id, m.product_id AS \"productId\", p.name AS \"productName\", m.sales_account_id AS \"salesAccountId\", m.purchase_account_id AS \"purchaseAccountId\", m.inventory_account_id AS \"inventoryAccountId\", m.hsn_sac_code AS \"hsnSacCode\", m.tax_code_id AS \"taxCodeId\" FROM finance_product_mappings m JOIN products p ON p.id = m.product_id WHERE m.product_id = ?", productId);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listVouchers(String type) {
        List<String> types = type == null || type.isBlank() ? List.of() : List.of(type.trim().toUpperCase());
        return listVouchers(types, null, null);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReport(String reportType, LocalDate from, LocalDate to, String basis) {
        String normalizedReport = reportType == null ? "" : reportType.trim().replace('-', '_').replace(' ', '_').toUpperCase();
        String selectedReport = requiredChoice(normalizedReport, "Report type", List.of(
                "LEDGERS", "BOOKS", "PURCHASE_SALES", "OUTSTANDING", "GST", "TDS", "FINANCIAL_STATEMENTS"));
        LocalDate endDate = to == null ? LocalDate.now() : to;
        LocalDate startDate = from == null ? endDate.withDayOfYear(1) : from;
        if (startDate.isAfter(endDate)) throw new ResponseStatusException(BAD_REQUEST, "Report start date must be on or before the end date");
        String selectedBasis = basis == null || basis.isBlank() ? "ACCRUAL" : requiredChoice(basis, "Accounting basis", List.of("CASH", "ACCRUAL"));

        Object rows;
        Map<String, Object> summary = Map.of();
        switch (selectedReport) {
            case "LEDGERS", "FINANCIAL_STATEMENTS" -> {
                Map<String, Object> balances = getTrialBalance(endDate, selectedBasis);
                rows = balances.get("rows");
                summary = Map.of("debitTotal", balances.get("debitTotal"), "creditTotal", balances.get("creditTotal"), "balanced", balances.get("balanced"));
            }
            case "BOOKS" -> rows = listVouchers(List.of(), startDate, endDate);
            case "PURCHASE_SALES" -> rows = listVouchers(List.of(
                    "PURCHASE_INVOICE", "GRN", "PURCHASE_RETURN", "DEBIT_NOTE",
                    "SALES_INVOICE", "SALES_RETURN", "REFUND", "CREDIT_NOTE"), startDate, endDate);
            case "OUTSTANDING" -> rows = listParties(null);
            case "GST" -> rows = listTaxReport("GST", startDate, endDate, selectedBasis);
            case "TDS" -> rows = listTaxReport("TDS", startDate, endDate, selectedBasis);
            default -> throw new ResponseStatusException(BAD_REQUEST, "Unsupported finance report");
        }
        return Map.of("reportType", selectedReport, "from", startDate, "to", endDate, "accountingBasis", selectedBasis, "rows", rows, "summary", summary);
    }

    private List<Map<String, Object>> listVouchers(List<String> types, LocalDate from, LocalDate to) {
        StringBuilder sql = new StringBuilder("SELECT v.id, v.voucher_number AS \"voucherNumber\", v.voucher_type AS \"voucherType\", v.voucher_date AS \"voucherDate\", v.party_id AS \"partyId\", p.name AS \"partyName\", v.reference_number AS \"referenceNumber\", v.narration, v.status, v.accounting_basis AS \"accountingBasis\", v.total_amount AS \"totalAmount\", COALESCE(SUM(l.debit), 0) AS \"totalDebit\", COALESCE(SUM(l.credit), 0) AS \"totalCredit\" FROM finance_vouchers v LEFT JOIN finance_parties p ON p.id = v.party_id LEFT JOIN finance_voucher_lines l ON l.voucher_id = v.id WHERE 1 = 1");
        List<Object> parameters = new ArrayList<>();
        if (!types.isEmpty()) {
            sql.append(" AND v.voucher_type IN (").append(String.join(", ", types.stream().map(type -> "?").toList())).append(')');
            parameters.addAll(types);
        }
        if (from != null) {
            sql.append(" AND v.voucher_date >= ?");
            parameters.add(from);
        }
        if (to != null) {
            sql.append(" AND v.voucher_date <= ?");
            parameters.add(to);
        }
        sql.append(" GROUP BY v.id, p.name ORDER BY v.voucher_date DESC, v.id DESC");
        return jdbc.queryForList(sql.toString(), parameters.toArray());
    }

    private List<Map<String, Object>> listTaxReport(String taxType, LocalDate from, LocalDate to, String basis) {
        return jdbc.queryForList("SELECT t.id, t.code, t.description, t.rate, t.component, t.effective_from AS \"effectiveFrom\", t.effective_to AS \"effectiveTo\", COUNT(DISTINCT v.id) AS \"postedVoucherCount\", COALESCE(SUM(CASE WHEN v.id IS NOT NULL THEN l.debit + l.credit ELSE 0 END), 0) AS \"postedAmount\" FROM finance_tax_codes t LEFT JOIN finance_voucher_lines l ON l.tax_code_id = t.id LEFT JOIN finance_vouchers v ON v.id = l.voucher_id AND v.status = 'POSTED' AND v.voucher_date >= ? AND v.voucher_date <= ? AND v.accounting_basis = ? WHERE t.tax_type = ? AND t.active = TRUE GROUP BY t.id ORDER BY t.code, t.component", from, to, basis, taxType);
    }

    @Transactional
    public Map<String, Object> createVoucher(VoucherInput input, Long userId) {
        String voucherType = requiredChoice(input.voucherType(), "Voucher type", List.of(
                "PURCHASE_ORDER", "GRN", "PURCHASE_INVOICE", "PURCHASE_VOUCHER", "PURCHASE_RETURN", "DEBIT_NOTE",
                "SALES_INVOICE", "SALES_VOUCHER", "DISPATCH", "SALES_RETURN", "REFUND", "CREDIT_NOTE",
                "GENERAL_PAYMENT", "VENDOR_PAYMENT", "GENERAL_RECEIPT", "CUSTOMER_RECEIPT", "PETTY_CASH_PAYMENT",
                "JOURNAL", "CONTRA", "EXPENSE", "BANK_DEPOSIT", "BANK_WITHDRAWAL", "BANK_TRANSFER",
                "GATEWAY_SETTLEMENT", "COD_SETTLEMENT", "ONLINE_ORDER", "OPENING_BALANCE"));
        if (input.voucherDate() == null) throw new ResponseStatusException(BAD_REQUEST, "Voucher date is required");
        String status = input.status() == null ? "DRAFT" : requiredChoice(input.status(), "Voucher status", List.of("DRAFT", "POSTED"));
        String basis = input.accountingBasis() == null ? "ACCRUAL" : requiredChoice(input.accountingBasis(), "Accounting basis", List.of("CASH", "ACCRUAL"));
        List<VoucherLineInput> lines = input.lines() == null ? List.of() : input.lines();
        if (lines.isEmpty()) throw new ResponseStatusException(BAD_REQUEST, "Add at least one voucher line");

        BigDecimal debitTotal = BigDecimal.ZERO;
        BigDecimal creditTotal = BigDecimal.ZERO;
        for (VoucherLineInput line : lines) {
            if (line.accountId() == null || !exists("SELECT EXISTS (SELECT 1 FROM finance_accounts WHERE id = ? AND active = TRUE)", line.accountId())) {
                throw new ResponseStatusException(BAD_REQUEST, "Every voucher line needs an active account");
            }
            BigDecimal debit = nonNegative(line.debit(), "Debit");
            BigDecimal credit = nonNegative(line.credit(), "Credit");
            if ((debit.signum() == 0) == (credit.signum() == 0)) {
                throw new ResponseStatusException(BAD_REQUEST, "Each line must contain either a debit or a credit");
            }
            debitTotal = debitTotal.add(debit);
            creditTotal = creditTotal.add(credit);
        }
        if (status.equals("POSTED") && (lines.size() < 2 || debitTotal.compareTo(creditTotal) != 0 || debitTotal.signum() == 0)) {
            throw new ResponseStatusException(BAD_REQUEST, "Posted vouchers must have at least two lines and equal non-zero debit and credit totals");
        }

        Integer year = input.voucherDate().getYear();
        Long sequence = jdbc.queryForObject("SELECT nextval('finance_voucher_number_seq')", Long.class);
        String voucherNumber = String.format("FIN-%d-%06d", year, sequence);
        BigDecimal total = debitTotal.max(creditTotal);
        Long voucherId = jdbc.queryForObject("INSERT INTO finance_vouchers (voucher_number, voucher_type, voucher_date, party_id, reference_number, narration, status, accounting_basis, total_amount, created_by, posted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'POSTED' THEN CURRENT_TIMESTAMP ELSE NULL END) RETURNING id",
                Long.class, voucherNumber, voucherType, input.voucherDate(), input.partyId(), blankToNull(input.referenceNumber()), blankToNull(input.narration()), status, basis, total, userId, status);

        for (int index = 0; index < lines.size(); index++) {
            VoucherLineInput line = lines.get(index);
            jdbc.update("INSERT INTO finance_voucher_lines (voucher_id, line_number, account_id, description, debit, credit, tax_code_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    voucherId, index + 1, line.accountId(), blankToNull(line.description()), nonNegative(line.debit(), "Debit"), nonNegative(line.credit(), "Credit"), line.taxCodeId());
        }
        return jdbc.queryForMap("SELECT id, voucher_number AS \"voucherNumber\", voucher_type AS \"voucherType\", voucher_date AS \"voucherDate\", party_id AS \"partyId\", reference_number AS \"referenceNumber\", narration, status, accounting_basis AS \"accountingBasis\", total_amount AS \"totalAmount\", created_at AS \"createdAt\" FROM finance_vouchers WHERE id = ?", voucherId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLedger(Long accountId, LocalDate from, LocalDate to) {
        Map<String, Object> account;
        try {
            account = jdbc.queryForMap("SELECT id, code, name, account_group AS \"accountGroup\", account_type AS \"accountType\", opening_balance AS \"openingBalance\", opening_balance_side AS \"openingBalanceSide\" FROM finance_accounts WHERE id = ?", accountId);
        } catch (org.springframework.dao.EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(NOT_FOUND, "Finance account not found");
        }
        List<Map<String, Object>> lines;
        if (from == null && to == null) {
            lines = jdbc.queryForList("SELECT v.voucher_date AS \"voucherDate\", v.voucher_number AS \"voucherNumber\", v.voucher_type AS \"voucherType\", v.narration, l.description, l.debit, l.credit FROM finance_voucher_lines l JOIN finance_vouchers v ON v.id = l.voucher_id WHERE l.account_id = ? AND v.status = 'POSTED' ORDER BY v.voucher_date, v.id, l.line_number", accountId);
        } else {
            lines = jdbc.queryForList("SELECT v.voucher_date AS \"voucherDate\", v.voucher_number AS \"voucherNumber\", v.voucher_type AS \"voucherType\", v.narration, l.description, l.debit, l.credit FROM finance_voucher_lines l JOIN finance_vouchers v ON v.id = l.voucher_id WHERE l.account_id = ? AND v.status = 'POSTED' AND (CAST(? AS DATE) IS NULL OR v.voucher_date >= ?) AND (CAST(? AS DATE) IS NULL OR v.voucher_date <= ?) ORDER BY v.voucher_date, v.id, l.line_number", accountId, from, from, to, to);
        }
        return Map.of("account", account, "lines", lines);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getTrialBalance(LocalDate to, String basis) {
        LocalDate endDate = to == null ? LocalDate.now() : to;
        String selectedBasis = basis == null || basis.isBlank() ? "ACCRUAL" : requiredChoice(basis, "Accounting basis", List.of("CASH", "ACCRUAL"));
        List<Map<String, Object>> rows = jdbc.queryForList("SELECT a.id, a.code, a.name, a.account_group AS \"accountGroup\", GREATEST(COALESCE(b.net_debit, 0), 0) AS debit, GREATEST(-COALESCE(b.net_debit, 0), 0) AS credit FROM finance_accounts a LEFT JOIN (SELECT l.account_id, SUM(l.debit - l.credit) AS net_debit FROM finance_voucher_lines l JOIN finance_vouchers v ON v.id = l.voucher_id WHERE v.status = 'POSTED' AND v.voucher_date <= ? AND v.accounting_basis = ? GROUP BY l.account_id) b ON b.account_id = a.id WHERE a.active = TRUE ORDER BY a.code", endDate, selectedBasis);
        BigDecimal debitTotal = BigDecimal.ZERO;
        BigDecimal creditTotal = BigDecimal.ZERO;
        for (Map<String, Object> row : rows) {
            Object debit = row.get("debit");
            Object credit = row.get("credit");
            if (debit instanceof BigDecimal amount) debitTotal = debitTotal.add(amount);
            if (credit instanceof BigDecimal amount) creditTotal = creditTotal.add(amount);
        }
        return Map.of("to", endDate, "accountingBasis", selectedBasis, "rows", rows, "debitTotal", debitTotal, "creditTotal", creditTotal, "balanced", debitTotal.compareTo(creditTotal) == 0);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listUnreconciledLines(Long accountId) {
        if (accountId == null) {
            return jdbc.queryForList("SELECT l.id, l.account_id AS \"accountId\", a.name AS \"accountName\", v.voucher_number AS \"voucherNumber\", v.voucher_date AS \"voucherDate\", v.voucher_type AS \"voucherType\", l.description, l.debit, l.credit FROM finance_voucher_lines l JOIN finance_accounts a ON a.id = l.account_id AND a.account_type = 'BANK' JOIN finance_vouchers v ON v.id = l.voucher_id AND v.status = 'POSTED' WHERE l.reconciled_at IS NULL ORDER BY v.voucher_date, v.id");
        }
        return jdbc.queryForList("SELECT l.id, l.account_id AS \"accountId\", a.name AS \"accountName\", v.voucher_number AS \"voucherNumber\", v.voucher_date AS \"voucherDate\", v.voucher_type AS \"voucherType\", l.description, l.debit, l.credit FROM finance_voucher_lines l JOIN finance_accounts a ON a.id = l.account_id AND a.account_type = 'BANK' JOIN finance_vouchers v ON v.id = l.voucher_id AND v.status = 'POSTED' WHERE l.reconciled_at IS NULL AND l.account_id = ? ORDER BY v.voucher_date, v.id", accountId);
    }

    @Transactional
    public Map<String, Object> reconcileLine(Long lineId, String reference) {
        if (reference == null || reference.isBlank()) throw new ResponseStatusException(BAD_REQUEST, "Bank statement reference is required");
        int updated = jdbc.update("UPDATE finance_voucher_lines SET reconciled_at = CURRENT_TIMESTAMP, reconciliation_reference = ? WHERE id = ? AND reconciled_at IS NULL AND account_id IN (SELECT id FROM finance_accounts WHERE account_type = 'BANK')", reference.trim(), lineId);
        if (updated == 0) throw new ResponseStatusException(NOT_FOUND, "Unreconciled bank transaction not found");
        return jdbc.queryForMap("SELECT id, reconciled_at AS \"reconciledAt\", reconciliation_reference AS \"reconciliationReference\" FROM finance_voucher_lines WHERE id = ?", lineId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSettings() {
        return jdbc.queryForMap("SELECT accounting_basis AS \"accountingBasis\", financial_year_start_month AS \"financialYearStartMonth\", currency_code AS \"currencyCode\" FROM finance_settings WHERE id = 1");
    }

    @Transactional
    public Map<String, Object> saveSettings(SettingsInput input) {
        String basis = requiredChoice(input.accountingBasis(), "Accounting basis", List.of("CASH", "ACCRUAL", "BOTH"));
        int yearStart = input.financialYearStartMonth() == null ? 4 : input.financialYearStartMonth();
        if (yearStart < 1 || yearStart > 12) throw new ResponseStatusException(BAD_REQUEST, "Financial year start month must be between 1 and 12");
        String currency = input.currencyCode() == null ? "INR" : input.currencyCode().trim().toUpperCase();
        if (!currency.matches("[A-Z]{3}")) throw new ResponseStatusException(BAD_REQUEST, "Currency must be a three-letter ISO code");
        jdbc.update("UPDATE finance_settings SET accounting_basis = ?, financial_year_start_month = ?, currency_code = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1", basis, yearStart, currency);
        return getSettings();
    }

    @Transactional
    public void postOnlineOrder(OrderEntity order) {
        String reference = String.valueOf(order.getId());
        if (exists("SELECT EXISTS (SELECT 1 FROM finance_vouchers WHERE voucher_type = 'ONLINE_ORDER' AND reference_number = ?)", reference)) return;
        Long receivableId = getRequiredAccountId("RECEIVABLE");
        Long salesId = getRequiredAccountId("SALES");
        BigDecimal total = order.getTotalAmount() == null ? BigDecimal.ZERO : order.getTotalAmount();
        if (total.signum() <= 0) throw new ResponseStatusException(BAD_REQUEST, "Online order total must be greater than zero");
        VoucherInput input = new VoucherInput("ONLINE_ORDER", order.getCreatedAt() == null ? LocalDate.now() : order.getCreatedAt().toLocalDate(), null,
                reference, "Online order " + order.getOrderNumber(), "POSTED", "ACCRUAL", List.of(
                new VoucherLineInput(receivableId, "Order receivable", total, BigDecimal.ZERO, null),
                new VoucherLineInput(salesId, "Online sales", BigDecimal.ZERO, total, null)));
        createVoucher(input, null);
    }

    private Long getRequiredAccountId(String type) {
        try {
            return jdbc.queryForObject("SELECT id FROM finance_accounts WHERE account_type = ? AND active = TRUE ORDER BY code LIMIT 1", Long.class, type);
        } catch (org.springframework.dao.EmptyResultDataAccessException exception) {
            throw new ResponseStatusException(BAD_REQUEST, "Configure an active " + type + " account before posting online orders");
        }
    }

    private void postOpeningBalance(Long ledgerAccountId, Long partyId, String description, BigDecimal amount, String side, String reference) {
        if (amount.signum() <= 0) return;
        Long offsetAccountId = getRequiredAccountId("OPENING_BALANCE");
        if (ledgerAccountId.equals(offsetAccountId)) throw new ResponseStatusException(BAD_REQUEST, "Opening Balance Equity cannot offset itself");
        List<VoucherLineInput> lines = "DEBIT".equals(side)
                ? List.of(new VoucherLineInput(ledgerAccountId, description + " opening balance", amount, BigDecimal.ZERO, null),
                    new VoucherLineInput(offsetAccountId, "Opening balance offset", BigDecimal.ZERO, amount, null))
                : List.of(new VoucherLineInput(offsetAccountId, "Opening balance offset", amount, BigDecimal.ZERO, null),
                    new VoucherLineInput(ledgerAccountId, description + " opening balance", BigDecimal.ZERO, amount, null));
        createVoucher(new VoucherInput("OPENING_BALANCE", LocalDate.now(), partyId, "OPENING-" + reference,
                "Opening balance - " + description, "POSTED", "ACCRUAL", lines), null);
    }

    private BigDecimal groupBalance(String group, String normalSide, LocalDate from, LocalDate to, String basis) {
        return jdbc.queryForObject("SELECT COALESCE(SUM(CASE WHEN ? = 'DEBIT' THEN l.debit - l.credit ELSE l.credit - l.debit END), 0) FROM finance_voucher_lines l JOIN finance_vouchers v ON v.id = l.voucher_id JOIN finance_accounts a ON a.id = l.account_id WHERE v.status = 'POSTED' AND a.account_group = ? AND (CAST(? AS DATE) IS NULL OR v.voucher_date >= ?) AND (CAST(? AS DATE) IS NULL OR v.voucher_date <= ?) AND v.accounting_basis = ?",
                BigDecimal.class, normalSide, group, from, from, to, to, basis);
    }

    private BigDecimal accountTypeBalance(String type, String normalSide, LocalDate from, LocalDate to, String basis) {
        return accountTypesBalance(List.of(type), normalSide, from, to, basis);
    }

    private BigDecimal accountTypesBalance(List<String> types, String normalSide, LocalDate from, LocalDate to, String basis) {
        String placeholders = String.join(",", types.stream().map(type -> "?").toList());
        String sql = "SELECT COALESCE(SUM(COALESCE((SELECT SUM(CASE WHEN ? = 'DEBIT' THEN l.debit - l.credit ELSE l.credit - l.debit END) FROM finance_voucher_lines l JOIN finance_vouchers v ON v.id = l.voucher_id WHERE l.account_id = a.id AND v.status = 'POSTED' AND (CAST(? AS DATE) IS NULL OR v.voucher_date >= ?) AND (CAST(? AS DATE) IS NULL OR v.voucher_date <= ?) AND v.accounting_basis = ?), 0)), 0) FROM finance_accounts a WHERE a.account_type IN (" + placeholders + ") AND a.active = TRUE";
        Object[] parameters = new Object[6 + types.size()];
        parameters[0] = normalSide;
        parameters[1] = from;
        parameters[2] = from;
        parameters[3] = to;
        parameters[4] = to;
        parameters[5] = basis;
        for (int index = 0; index < types.size(); index++) parameters[6 + index] = types.get(index);
        return jdbc.queryForObject(sql, BigDecimal.class, parameters);
    }

    private boolean exists(String sql, Object... args) {
        Boolean result = jdbc.queryForObject(sql, Boolean.class, args);
        return Boolean.TRUE.equals(result);
    }

    private BigDecimal nonNegative(BigDecimal value, String label) {
        BigDecimal amount = value == null ? BigDecimal.ZERO : value;
        if (amount.signum() < 0) throw new ResponseStatusException(BAD_REQUEST, label + " cannot be negative");
        return amount;
    }

    private String requiredChoice(String value, String label, List<String> choices) {
        if (value == null) throw new ResponseStatusException(BAD_REQUEST, label + " is required");
        String normalized = value.trim().toUpperCase();
        if (!choices.contains(normalized)) throw new ResponseStatusException(BAD_REQUEST, "Unsupported " + label.toLowerCase());
        return normalized;
    }

    private void requireText(String value, String label) {
        if (value == null || value.isBlank()) throw new ResponseStatusException(BAD_REQUEST, label + " is required");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record AccountInput(String code, String name, String accountGroup, String accountType, BigDecimal openingBalance, String openingBalanceSide) {}
    public record PartyInput(String partyType, String name, String gstin, String pan, String email, String phone, String address, BigDecimal openingBalance, String openingBalanceSide) {}
    public record TaxCodeInput(String taxType, String code, String description, BigDecimal rate, String component, LocalDate effectiveFrom, LocalDate effectiveTo) {}
    public record BankAccountInput(Long accountId, String bankName, String accountHolder, String accountNumber, String ifsc, BigDecimal openingBalance) {}
    public record ProductMappingInput(Long salesAccountId, Long purchaseAccountId, Long inventoryAccountId, String hsnSacCode, Long taxCodeId) {}
    public record VoucherInput(String voucherType, LocalDate voucherDate, Long partyId, String referenceNumber, String narration, String status, String accountingBasis, List<VoucherLineInput> lines) {}
    public record VoucherLineInput(Long accountId, String description, BigDecimal debit, BigDecimal credit, Long taxCodeId) {}
    public record SettingsInput(String accountingBasis, Integer financialYearStartMonth, String currencyCode) {}
    public record ReconciliationInput(String reference) {}
}