package com.company.auth.service;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FinanceServiceTest {

    @Test
    void postsVoucherWhenDebitAndCreditTotalsBalance() {
        FinanceJdbcTemplate jdbc = new FinanceJdbcTemplate();
        FinanceService service = new FinanceService(jdbc);

        FinanceService.VoucherInput input = new FinanceService.VoucherInput(
                "JOURNAL", LocalDate.of(2026, 10, 1), null, "REF-1", "Balanced test", "POSTED", "ACCRUAL",
                List.of(
                        new FinanceService.VoucherLineInput(1L, "Debit line", new BigDecimal("120.00"), BigDecimal.ZERO, null),
                        new FinanceService.VoucherLineInput(2L, "Credit line", BigDecimal.ZERO, new BigDecimal("120.00"), null)));

        Map<String, Object> result = service.createVoucher(input, 7L);

        org.junit.jupiter.api.Assertions.assertEquals("FIN-2026-000012", result.get("voucherNumber"));
        org.junit.jupiter.api.Assertions.assertEquals(2, jdbc.lineWrites);
    }

    @Test
    void rejectsPostedVoucherWhenDebitsAndCreditsDoNotBalance() {
        FinanceJdbcTemplate jdbc = new FinanceJdbcTemplate();
        FinanceService service = new FinanceService(jdbc);
        FinanceService.VoucherInput input = new FinanceService.VoucherInput(
                "JOURNAL", LocalDate.of(2026, 10, 1), null, null, "Unbalanced test", "POSTED", "ACCRUAL",
                List.of(
                        new FinanceService.VoucherLineInput(1L, "Debit line", new BigDecimal("120.00"), BigDecimal.ZERO, null),
                        new FinanceService.VoucherLineInput(2L, "Credit line", BigDecimal.ZERO, new BigDecimal("119.00"), null)));

        assertThrows(ResponseStatusException.class, () -> service.createVoucher(input, 7L));
        org.junit.jupiter.api.Assertions.assertEquals(0, jdbc.lineWrites);
    }

    @Test
    void purchaseAndSalesReportFiltersVoucherTypesAndDates() {
        FinanceJdbcTemplate jdbc = new FinanceJdbcTemplate();
        FinanceService service = new FinanceService(jdbc);
        LocalDate from = LocalDate.of(2026, 9, 1);
        LocalDate to = LocalDate.of(2026, 9, 30);

        Map<String, Object> result = service.getReport("purchase-sales", from, to, "CASH");

        assertEquals("PURCHASE_SALES", result.get("reportType"));
        assertEquals(from, result.get("from"));
        assertEquals(to, result.get("to"));
        assertEquals("CASH", result.get("accountingBasis"));
        assertTrue(jdbc.lastSql.contains("v.voucher_type IN (?, ?, ?, ?, ?, ?, ?, ?)"));
        assertTrue(jdbc.lastSql.contains("v.voucher_date >= ?"));
        assertTrue(jdbc.lastSql.contains("v.voucher_date <= ?"));
        assertEquals(10, jdbc.lastArguments.length);
    }

    @Test
    void rejectsUnsupportedFinanceReport() {
        FinanceService service = new FinanceService(new FinanceJdbcTemplate());

        assertThrows(ResponseStatusException.class, () -> service.getReport("unknown", null, null, null));
    }

    @Test
    void dashboardCastsOptionalDateParametersForPostgres() {
        FinanceJdbcTemplate jdbc = new FinanceJdbcTemplate();

        new FinanceService(jdbc).getDashboard(null, null, "ACCRUAL");

        assertTrue(jdbc.optionalDateFilters > 0);
        assertTrue(jdbc.lastOptionalDateSql.contains("CAST(? AS DATE) IS NULL"));
    }

    private static final class FinanceJdbcTemplate extends JdbcTemplate {
        private int lineWrites;
        private int optionalDateFilters;
        private String lastOptionalDateSql = "";
        private String lastSql;
        private Object[] lastArguments = new Object[0];

        @Override
        public <T> T queryForObject(String sql, Class<T> requiredType, Object... args) {
            if (sql.startsWith("SELECT EXISTS")) return requiredType.cast(Boolean.TRUE);
            if (sql.startsWith("SELECT COALESCE(SUM(COALESCE(")) {
                optionalDateFilters++;
                lastOptionalDateSql = sql;
                return requiredType.cast(BigDecimal.ZERO);
            }
            if (sql.startsWith("SELECT COALESCE(SUM(CASE")) return requiredType.cast(BigDecimal.ZERO);
            if (sql.startsWith("SELECT COUNT(*)")) return requiredType.cast(1);
            if (sql.startsWith("INSERT INTO finance_vouchers")) return requiredType.cast(31L);
            throw new AssertionError("Unexpected finance query: " + sql);
        }

        @Override
        public <T> T queryForObject(String sql, Class<T> requiredType) {
            if (sql.startsWith("SELECT nextval")) return requiredType.cast(12L);
            if (sql.startsWith("SELECT COUNT(*)")) return requiredType.cast(1);
            throw new AssertionError("Unexpected finance query: " + sql);
        }

        @Override
        public int update(String sql, Object... args) {
            if (sql.startsWith("INSERT INTO finance_voucher_lines")) lineWrites++;
            return 1;
        }

        @Override
        public Map<String, Object> queryForMap(String sql, Object... args) {
            return Map.of("voucherNumber", "FIN-2026-000012");
        }

        @Override
        public List<Map<String, Object>> queryForList(String sql, Object... args) {
            lastSql = sql;
            lastArguments = args;
            return List.of();
        }
    }
}