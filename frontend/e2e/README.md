# Accounts & Finance UI demo

This Playwright suite runs ten non-destructive browser flows through the admin Accounts navigation. It checks finance pages, form controls, voucher-line editing, and selecting/removing multiple invoice attachments. The invoice test uses in-memory sample PDFs and does not submit a voucher or write test data.

## Prerequisites

- Start the backend auth service with its finance database configured.
- Ensure the frontend can reach the backend through the Vite `/api` proxy.
- Set admin credentials in the shell, or provide a Playwright storage-state JSON file for an already authenticated admin.
- Install Chromium once with `npx playwright install chromium`.

PowerShell example:

```powershell
$env:PLAYWRIGHT_ADMIN_EMAIL = "admin@example.com"
$env:PLAYWRIGHT_ADMIN_PASSWORD = "your-admin-password"
npm run test:e2e
```

To use an existing authenticated browser state instead:

```powershell
$env:PLAYWRIGHT_STORAGE_STATE = "C:\path\to\admin-storage-state.json"
npm run test:e2e
```

`PLAYWRIGHT_BASE_URL` can override the default `http://127.0.0.1:5173`. The Playwright config starts Vite when it is not already running.

## Test flow

1. Open the Accounts dashboard and inspect sales, purchases, and vendor payables.
2. Review Vendor Master fields and save action.
3. Check ledger account fields and classification defaults.
4. Review bank-account details and linked ledger control.
5. Open Purchase Invoice and inspect voucher metadata and line entries.
6. Configure the vendor-payment details and verify its invoice-upload control.
7. Add a voucher line, then remove it.
8. Select two invoice documents and remove one of the selected files.
9. Open the Books report workspace.
10. Open Bank Reconciliation and inspect the transaction workflow.

Run just this suite from `frontend/` with `npm run test:e2e`; test artifacts are ignored by Git.
