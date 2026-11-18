import { expect, test } from '@playwright/test';

const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL;
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD;

async function openFinanceModule(page, module) {
  await page.goto('/#/admin/dashboard');
  await page.locator('.admin-sidebar-account-trigger').click();
  if (module !== 'dashboard') {
    await page.locator(`.admin-sidebar-finance-link-${module}`).click();
  }
  await expect(page.locator('.finance-page > .finance-header h1')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  if (process.env.PLAYWRIGHT_STORAGE_STATE) {
    await openFinanceModule(page, 'dashboard');
    return;
  }

  if (!adminEmail || !adminPassword) {
    throw new Error('Set PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD, or provide PLAYWRIGHT_STORAGE_STATE.');
  }

  await page.goto('/#/login');
  await page.getByLabel(/Email Address/).fill(adminEmail);
  await page.getByLabel(/Password/).fill(adminPassword);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await expect(page).toHaveURL(/#\/admin\/dashboard/);
});

test('1. Open Accounts & Finance dashboard and review key balances', async ({ page }) => {
  await openFinanceModule(page, 'dashboard');

  await expect(page.getByRole('heading', { name: 'Accounts & Finance', exact: true, level: 1 })).toBeVisible();
  await expect(page.getByText('Total Sales')).toBeVisible();
  await expect(page.getByText('Total Purchases')).toBeVisible();
  await expect(page.getByText('Vendor Payables')).toBeVisible();
});

test('2. Review the vendor master entry form', async ({ page }) => {
  await openFinanceModule(page, 'vendor-master');

  await expect(page.getByRole('heading', { name: 'Vendor Master', exact: true, level: 1 })).toBeVisible();
  await expect(page.getByPlaceholder('Vendor legal name')).toBeVisible();
  await expect(page.getByLabel('GSTIN')).toBeVisible();
  await expect(page.getByLabel('PAN')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save record' })).toBeVisible();
});

test('3. Check ledger-account creation fields and account classifications', async ({ page }) => {
  await openFinanceModule(page, 'group-ledger');

  await expect(page.getByLabel('Account code')).toBeVisible();
  await expect(page.getByLabel('Account name')).toBeVisible();
  await expect(page.getByLabel('Group')).toHaveValue('ASSET');
  await expect(page.getByLabel('Account type')).toHaveValue('GENERAL');
  await page.getByLabel('Account name').fill('Demo account entry');
  await expect(page.getByLabel('Account name')).toHaveValue('Demo account entry');
});

test('4. Review bank-account ledger selection and required details', async ({ page }) => {
  await openFinanceModule(page, 'bank-accounts');

  await expect(page.getByLabel('Ledger account')).toBeVisible();
  await expect(page.getByLabel('Bank name')).toBeVisible();
  await expect(page.getByLabel('Account holder')).toBeVisible();
  await expect(page.getByLabel('Account number')).toBeVisible();
  await expect(page.getByLabel('IFSC')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Save record' })).toBeEnabled();
});

test('5. Open a purchase invoice and inspect voucher lines', async ({ page }) => {
  await openFinanceModule(page, 'purchase-invoice');

  await expect(page.getByRole('heading', { name: 'Create voucher' })).toBeVisible();
  await expect(page.getByLabel('Voucher date')).toBeVisible();
  await expect(page.getByLabel('Party')).toBeVisible();
  await expect(page.getByLabel('Reference')).toBeVisible();
  await expect(page.getByLabel('Account for line 1')).toBeVisible();
  await expect(page.getByLabel('Account for line 2')).toBeVisible();
});

test('6. Configure a vendor payment before posting it', async ({ page }) => {
  await openFinanceModule(page, 'vendor-payment');

  await expect(page.getByRole('heading', { name: 'Create voucher' })).toBeVisible();
  await expect(page.getByLabel('Party')).toBeVisible();
  await expect(page.locator('.finance-entry-form .finance-form-grid label').filter({ hasText: /^Basis/ }).locator('select')).toBeVisible();
  await expect(page.getByLabel('Status')).toHaveValue('DRAFT');
  await expect(page.getByLabel('Narration')).toBeVisible();
  await expect(page.getByLabel('Invoice documents (PDF or image, up to 10 files)')).toBeVisible();
});

test('7. Add and remove a voucher line in the editor', async ({ page }) => {
  await openFinanceModule(page, 'vendor-payment');

  await expect(page.getByLabel('Account for line 3')).toHaveCount(0);
  await page.getByRole('button', { name: '+ Add line' }).click();
  await expect(page.getByLabel('Account for line 3')).toBeVisible();
  await page.getByRole('button', { name: 'Remove line 3' }).click();
  await expect(page.getByLabel('Account for line 3')).toHaveCount(0);
});

test('8. Attach multiple invoice documents and remove an incorrect selection', async ({ page }) => {
  await openFinanceModule(page, 'vendor-payment');

  await page.getByLabel('Invoice documents (PDF or image, up to 10 files)').setInputFiles([
    { name: 'invoice-demo.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\nDemo invoice') },
    { name: 'invoice-support.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\nSupporting invoice') },
  ]);

  await expect(page.getByText('invoice-demo.pdf')).toBeVisible();
  await expect(page.getByText('invoice-support.pdf')).toBeVisible();
  await page.getByRole('button', { name: 'Remove invoice-demo.pdf', exact: true }).click();
  await expect(page.getByText('invoice-demo.pdf')).toHaveCount(0);
  await expect(page.getByText('invoice-support.pdf')).toBeVisible();
});

test('9. Switch to the Books report and inspect the report workspace', async ({ page }) => {
  await openFinanceModule(page, 'books');

  await expect(page.getByRole('heading', { name: 'Books', exact: true, level: 1 })).toBeVisible();
  await expect(page.locator('.finance-panel-heading').getByRole('heading', { name: 'Books', exact: true })).toBeVisible();
});

test('10. Open bank reconciliation and review the transaction workflow', async ({ page }) => {
  await openFinanceModule(page, 'bank-reconciliation');

  await expect(page.getByRole('heading', { name: 'Bank Reconciliation', exact: true, level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Unreconciled bank transactions' })).toBeVisible();
});
