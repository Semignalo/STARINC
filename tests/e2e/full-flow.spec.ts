import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER = {
  name: 'Center Jabar',
  email: 'centerjabar@starinc.id',
  password: 'password',
  phone: '085612345678',
  address: 'Jl. Dago No. 32 Coblong',
  city: 'Bandung',
  postalCode: '40135',
};

const ADMIN = {
  email: 'admin@starinc.id',
  password: 'password',
};

// Written by test 5, read by test 7 & 8
let createdOrderNumber = '';

// Saved auth state path — written after test 3, reused by tests 4-6
const USER_AUTH_FILE = path.join(__dirname, '../fixtures/user-auth.json');

// For login/register: SweetAlert has timer + showConfirmButton: false — auto-dismisses
async function waitForAutoSwal(page: Page, timeout = 8000) {
  await page.waitForSelector('.swal2-popup', { timeout }).catch(() => {});
  await page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 }).catch(() => {});
}

// For manual Swal.fire('Title', 'msg', 'success') — has visible OK button
async function dismissSwal(page: Page, timeout = 8000) {
  await page.waitForSelector('.swal2-popup', { timeout });
  const confirmBtn = page.locator('.swal2-confirm');
  const isVisible = await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false);
  if (isVisible) {
    await confirmBtn.click();
  }
  await page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('kamu@email.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Masuk Sekarang' }).click();
  // Login success swal: timer: 1500, showConfirmButton: false → auto-dismisses
  await waitForAutoSwal(page);
}

test.describe.serial('Full E2E: Register → Order → Admin Approve → Shipped', () => {

  test('1. Register new user', async ({ page }) => {
    await page.goto('/login');

    // Switch to register mode
    await page.getByRole('button', { name: 'Daftar di sini' }).click();

    await page.getByPlaceholder('John Doe').fill(USER.name);
    await page.getByPlaceholder('08xxxxxxxxxx').fill(USER.phone);
    await page.getByPlaceholder('kamu@email.com').fill(USER.email);
    await page.getByPlaceholder('••••••••').fill(USER.password);
    await page.getByPlaceholder('Jl. Contoh No. 123').fill(USER.address);
    await page.getByPlaceholder('Jakarta').fill(USER.city);
    await page.getByPlaceholder('12345').fill(USER.postalCode);
    // No referral code

    await page.getByRole('button', { name: 'Daftar Sekarang' }).click();

    // Register success swal: timer: 1500, showConfirmButton: false → auto-dismisses
    await waitForAutoSwal(page);
    await expect(page).toHaveURL('/');
  });

  test('2. Logout', async ({ page }) => {
    await loginAs(page, USER.email, USER.password);

    // Desktop navbar: user avatar uses CSS group-hover to show dropdown
    // Hover over the avatar button to reveal the dropdown
    const avatarBtn = page.locator('.group.relative > button').first();
    await avatarBtn.waitFor({ timeout: 5000 });
    await avatarBtn.hover();

    // Click the Logout button inside the dropdown (text-red-600 variant)
    const logoutBtn = page.locator('.group.relative button.text-red-600');
    await logoutBtn.waitFor({ timeout: 3000 });
    await logoutBtn.click();

    // Logout swal: timer + showConfirmButton: false → auto-dismisses
    await waitForAutoSwal(page);
    await page.waitForURL('/', { timeout: 5000 });
  });

  test('3. Login', async ({ page }) => {
    await loginAs(page, USER.email, USER.password);
    await expect(page).toHaveURL('/');

    // Save auth state so tests 4-6 can reuse without re-logging in
    await page.context().storageState({ path: USER_AUTH_FILE });
  });

  test('4. Browse products → Add to cart', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: USER_AUTH_FILE });
    const page = await ctx.newPage();

    try {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');

      const firstProductLink = page.locator('a[href^="/product/"]').first();
      await firstProductLink.waitFor({ timeout: 10000 });
      await firstProductLink.click();

      await page.waitForURL(/\/product\/.+/);
      await page.waitForLoadState('networkidle');

      await page.getByRole('button', { name: 'Add to Cart' }).click();
      await expect(page.getByRole('button', { name: 'Checkout' })).toBeVisible({ timeout: 5000 });
    } finally {
      await ctx.close();
    }
  });

  test('5. Checkout → Place Order', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: USER_AUTH_FILE });
    const page = await ctx.newPage();

    try {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      await page.locator('a[href^="/product/"]').first().click();
      await page.waitForURL(/\/product\/.+/);
      await page.waitForLoadState('networkidle');
      await page.getByRole('button', { name: 'Add to Cart' }).click();
      await page.getByRole('button', { name: 'Checkout' }).click();
      await page.waitForURL('/checkout');

      await page.getByPlaceholder('John Doe').fill(USER.name);
      await page.getByPlaceholder('+62 812 3456 7890').fill(USER.phone);
      await page.getByPlaceholder('Street name, house number').fill(USER.address);
      await page.getByPlaceholder('Jakarta Selatan').fill(USER.city);
      await page.getByPlaceholder('12345').fill(USER.postalCode);

      const checkoutResponsePromise = page.waitForResponse(
        resp => resp.url().includes('/api/checkout') && resp.status() === 201,
        { timeout: 15000 }
      );
      await page.getByRole('button', { name: 'Place Order' }).click();

      const checkoutResp = await checkoutResponsePromise;
      const body = await checkoutResp.json();
      createdOrderNumber = body?.data?.order_number || '';
      console.log(`Order placed: ${createdOrderNumber}`);
      expect(createdOrderNumber).toMatch(/INV-/);

      // Checkout shows a 2s auto-dismiss SweetAlert then navigates to invoice
      await page.waitForURL(/\/invoice\/.+/, { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      await expect(page.locator('text=Order Dibuat!')).toBeVisible({ timeout: 8000 });
    } finally {
      await ctx.close();
    }
  });

  test('6. Upload payment proof', async ({ browser }) => {
    // Write dummy PNG fixture
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';
    const fixturePath = path.join(__dirname, '../fixtures/payment-proof.png');
    fs.writeFileSync(fixturePath, Buffer.from(pngBase64, 'base64'));

    const ctx = await browser.newContext({ storageState: USER_AUTH_FILE });
    const page = await ctx.newPage();

    try {
      await page.goto(`/invoice/${createdOrderNumber}`);
      await page.waitForLoadState('networkidle');

      // Verify we're on the invoice page (not redirected to login)
      await expect(page.locator('text=Order Dibuat!')).toBeVisible({ timeout: 8000 });

      // The invoice page has a hidden file input #paymentProofInvoice
      const fileInput = page.locator('#paymentProofInvoice');
      await fileInput.waitFor({ state: 'attached', timeout: 5000 });
      await fileInput.setInputFiles(fixturePath);

      // Wait for upload success SweetAlert
      await dismissSwal(page, 10000);
    } finally {
      await ctx.close();
    }
  });

  test('7. Admin: review and approve payment', async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Filter by pending_payment status
    await page.getByRole('button', { name: 'Menunggu Pembayaran' }).click();
    await page.waitForTimeout(500);

    // Search by customer name
    await page.getByPlaceholder('Cari ID Pesanan / Nama...').fill(USER.name);
    await page.waitForTimeout(500);

    // Open order details
    await page.locator('button[title="Lihat Detail Pesanan"]').first().click();

    // "Review Bukti Pembayaran" button inside the order detail modal
    const reviewBtn = page.getByRole('button', { name: 'Review Bukti Pembayaran' });
    await reviewBtn.waitFor({ timeout: 8000 });
    await reviewBtn.click();

    // In payment review modal: select "Disetujui"
    await page.locator('input[type="radio"][value="approved"]').click();

    await page.getByRole('button', { name: 'Simpan Review' }).click();

    await dismissSwal(page, 10000);

    // Order should now show "Pesanan Diproses"
    await expect(page.getByText('Pesanan Diproses').first()).toBeVisible({ timeout: 5000 });
  });

  test('8. Admin: mark order as shipped with tracking number', async ({ page }) => {
    await loginAs(page, ADMIN.email, ADMIN.password);

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    // Filter processing orders
    await page.getByRole('button', { name: 'Pesanan Diproses' }).click();
    await page.waitForTimeout(500);

    await page.getByPlaceholder('Cari ID Pesanan / Nama...').fill(USER.name);
    await page.waitForTimeout(500);

    // Open order details
    await page.locator('button[title="Lihat Detail Pesanan"]').first().click();

    // Click "Dikirim" status button inside the order detail modal.
    // Scope to .max-w-4xl to avoid matching the status filter tab button outside the modal.
    const shippedBtn = page.locator('.max-w-4xl').getByRole('button', { name: 'Dikirim' }).first();
    await shippedBtn.waitFor({ timeout: 8000 });
    await shippedBtn.scrollIntoViewIfNeeded();
    await shippedBtn.click({ force: true });

    // handleUpdateStatus fires timer:1500 showConfirmButton:false → auto-dismiss
    await waitForAutoSwal(page);

    // "Tambah Nomor Resi" button should appear
    const addTrackingBtn = page.getByRole('button', { name: 'Tambah Nomor Resi' });
    await addTrackingBtn.waitFor({ timeout: 5000 });
    await addTrackingBtn.click();

    // Fill tracking form
    await page.getByPlaceholder('Contoh: 1234567890').fill('JNE2024TESTTRACK');
    await page.getByRole('combobox').selectOption('JNE');

    await page.getByRole('button', { name: 'Simpan Resi' }).click();

    await dismissSwal(page, 8000);

    // Tracking number should now be visible in the modal
    await expect(page.getByText('JNE2024TESTTRACK').first()).toBeVisible({ timeout: 5000 });
  });

});
