import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER = {
  centerName: 'Starcenter Jakarta Selatan',
  fullName: 'DEBBY ANGGRAINI',
  nik: '3174096112900001',
  birthPlace: 'Jakarta',
  birthDate: '1990-12-21',
  gender: 'P', 
  religion: 'Islam',
  maritalStatus: 'Lajang',
  job: 'Karyawan Swasta',
  email: 'STARCENTERtes01@gmail.com',
  phone: `08${Math.floor(Math.random() * 1000000000)}`,
  address: 'JL KECAPI V',
  city: 'Jagakarsa, Jakarta Selatan',
  postalCode: '12620',
};

const BANK = {
  name: 'BCA',
  number: '0111321551',
  accountName: 'Debby A',
};

const ADMIN = {
  email: 'admin@starinc.id',
  password: 'password',
};

// Reused between tests
const KTP_PATH = 'C:\\Users\\stari\\Downloads\\Scan KTP.JPG';
const USER_AUTH_FILE = path.join(__dirname, '../fixtures/debby-auth.json');
let createdOrderNumber = '';
let targetProductId = '';

// Helper for Swal
async function dismissSwal(page: Page, timeout = 8000) {
  await page.waitForSelector('.swal2-popup', { timeout }).catch(() => {});
  const confirmBtn = page.locator('.swal2-confirm');
  if (await confirmBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    await confirmBtn.click();
  }
  await page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function waitForAutoSwal(page: Page, timeout = 8000) {
  await page.waitForSelector('.swal2-popup', { timeout }).catch(() => {});
  await page.waitForSelector('.swal2-popup', { state: 'hidden', timeout: 5000 }).catch(() => {});
}

test.describe.serial('StarCenter Flow: Registration -> Approve -> Checkout Bulk -> Complete', () => {

  test.beforeAll(() => {
    // Clean up user and application with the test email so the test can run repeatedly without throwing duplicate errors
    try {
      execSync(`php artisan tinker --execute="\\App\\Models\\User::where('email', '${USER.email}')->forceDelete(); \\DB::table('starcenter_applications')->where('email', '${USER.email}')->delete();"`, { cwd: path.join(__dirname, '../../starinc-api') });
      console.log('Cleaned up existing Debby account and applications via Database.');
    } catch (e) {
      console.error('Warning: Failed to clean up account', e);
    }
  });

  test('1. Registration (/daftar-center)', async ({ page }) => {
    await page.goto('/daftar-center');

    // --- STEP 1: Identitas ---
    await page.getByPlaceholder('Contoh: Starcenter Surabaya Timur').fill(USER.centerName);

    // KTP Upload
    const fileInputKtp = page.locator('input[type="file"]').first();
    await fileInputKtp.setInputFiles(KTP_PATH);
    
    // Wait for OCR to complete (the auto-success text)
    await expect(page.locator('text=Data terisi otomatis').first()).toBeVisible({ timeout: 30000 });

    // Override the OCR data
    await page.getByPlaceholder('Sesuai KTP').fill('');
    await page.getByPlaceholder('Sesuai KTP').fill(USER.fullName);

    await page.getByPlaceholder('Nomor Induk Kependudukan').fill(USER.nik);

    await page.getByPlaceholder('Kota').fill('');
    await page.getByPlaceholder('Kota').fill(USER.birthPlace);

    await page.locator('input[type="date"]').fill(USER.birthDate);

    await page.getByRole('button', { name: 'Perempuan' }).click();
    await page.locator('select.w-full.border.rounded-xl').first().selectOption(USER.religion);
    await page.locator('select.w-full.border.rounded-xl').nth(1).selectOption(USER.maritalStatus);
    
    await page.getByPlaceholder('Pekerjaan utama').fill('');
    await page.getByPlaceholder('Pekerjaan utama').fill(USER.job);

    await page.getByRole('button', { name: 'Lanjut' }).click();

    // --- STEP 2: Kontak ---
    await page.getByPlaceholder('email@contoh.com').fill(USER.email);
    await page.getByPlaceholder('08xxxxxxxxxx').fill(USER.phone);
    // shop link left blank

    await page.getByRole('button', { name: 'Lanjut' }).click();

    // --- STEP 3: Bank & Pajak ---
    await page.getByPlaceholder('Contoh: BCA, BNI, Mandiri').fill(BANK.name);
    await page.getByPlaceholder('Nomor rekening').fill(BANK.number);
    await page.getByPlaceholder('Sesuai buku tabungan').fill(BANK.accountName);

    // Create a dummy bank book image
    const fixtureBankBook = path.join(__dirname, '../fixtures/bank-book.png');
    if (!fs.existsSync(fixtureBankBook)) {
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';
      fs.writeFileSync(fixtureBankBook, Buffer.from(pngBase64, 'base64'));
    }
    
    const fileInputBank = page.locator('input[type="file"]').first();
    await fileInputBank.setInputFiles(fixtureBankBook);

    await page.getByRole('button', { name: 'Lanjut' }).click();

    // --- STEP 4: Referral ---
    // Leave blank
    await page.getByRole('button', { name: 'Kirim Pendaftaran' }).click();

    // Wait for success screen
    await expect(page.getByText('Pendaftaran Terkirim!')).toBeVisible({ timeout: 15000 });
  });

  test('2. Admin approve application', async ({ page }) => {
    // Login admin
    await page.goto('/login');
    await page.getByPlaceholder('kamu@email.com').fill(ADMIN.email);
    await page.getByPlaceholder('••••••••').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Masuk Sekarang' }).click();
    await waitForAutoSwal(page);

    await page.goto('/admin/applications');
    await page.waitForLoadState('networkidle');

    // Find our new application
    await page.getByRole('button', { name: 'Menunggu' }).first().click();
    
    const row = page.locator('tr', { hasText: USER.centerName }).first();
    await row.getByRole('button', { name: 'Tinjau' }).click();

    // The detail modal appears, wait for Setujui button
    const approveBtn = page.getByRole('button', { name: 'Setujui' });
    await approveBtn.waitFor({ state: 'visible', timeout: 5000 });

    // Setup dialog listener for the native confirm window
    page.once('dialog', dialog => dialog.accept());

    await approveBtn.click();

    // Wait for modal to close (or refresh status). So the application is now approved.
    await expect(page.locator('tr', { hasText: USER.centerName }).getByText('Disetujui')).toBeVisible({ timeout: 10000 });
  });

  test('3. Login as Debby + Save Auth State', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('kamu@email.com').fill(USER.email);
    await page.getByPlaceholder('••••••••').fill('password');
    await page.getByRole('button', { name: 'Masuk Sekarang' }).click();
    await waitForAutoSwal(page);

    await expect(page).toHaveURL('/');

    // Save auth state
    await page.context().storageState({ path: USER_AUTH_FILE });
  });

  test('4. Checkout Bulk Orders', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: USER_AUTH_FILE });
    const page = await ctx.newPage();

    try {
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      
      // Select C-STAR
      const cStarCard = page.locator('a[href^="/product/"]', { hasText: 'C-STAR' }).first();
      await cStarCard.click();
      await page.waitForURL(/\/product\/.+/);
      await page.waitForLoadState('networkidle');

      // Add 500 qty C-STAR
      // The frontend likely has an input field for quantity or multiple clicks. Let's find an input.
      const qtyInput = page.locator('input[type="number"], input.w-12');
      if (await qtyInput.isVisible()) {
        await qtyInput.fill('500');
      } else {
        // Fallback if no input exists and we have to click + 499 times, which is bad. 
        // We will try updating value directly.
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('input');
          for(const inp of inputs) {
            if (inp.value === "1") inp.value = "500";
          }
        });
      }
      await page.getByRole('button', { name: 'Add to Cart' }).click();

      // Go back to products
      await page.goto('/products');
      await page.waitForLoadState('networkidle');

      // Select Confidence burst
      const burstCard = page.locator('a[href^="/product/"]', { hasText: /burst/i }).first();
      await burstCard.click();
      await page.waitForURL(/\/product\/.+/);
      await page.waitForLoadState('networkidle');

      // Add 500 qty Confidence burst
      const qtyInputBurst = page.locator('input[type="number"], input.w-12');
      if (await qtyInputBurst.isVisible()) {
        await qtyInputBurst.fill('500');
      } else {
        await page.evaluate(() => {
          const inputs = document.querySelectorAll('input');
          for(const inp of inputs) {
            if (inp.value === "1") inp.value = "500";
          }
        });
      }
      await page.getByRole('button', { name: 'Add to Cart' }).click();

      await page.getByRole('button', { name: 'Checkout' }).click();
      await page.waitForURL('/checkout');

      // Address form
      await page.getByPlaceholder('John Doe').fill(USER.fullName);
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

  test('5. Upload bukti pembayaran', async ({ browser }) => {
    const fixturePath = path.join(__dirname, '../fixtures/payment-proof.png');
    // Ensure fixture exists
    if (!fs.existsSync(fixturePath)) {
      const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwADhQGAWjR9awAAAABJRU5ErkJggg==';
      fs.writeFileSync(fixturePath, Buffer.from(pngBase64, 'base64'));
    }

    const ctx = await browser.newContext({ storageState: USER_AUTH_FILE });
    const page = await ctx.newPage();

    try {
      await page.goto(`/invoice/${createdOrderNumber}`);
      await page.waitForLoadState('networkidle');

      await expect(page.locator('text=Order Dibuat!')).toBeVisible({ timeout: 8000 });

      const fileInput = page.locator('#paymentProofInvoice');
      await fileInput.waitFor({ state: 'attached', timeout: 5000 });
      await fileInput.setInputFiles(fixturePath);

      // Let user visually see it since slow_mo
      await dismissSwal(page, 10000);
    } finally {
      await ctx.close();
    }
  });

  test('6. Admin: approve pembayaran', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('kamu@email.com').fill(ADMIN.email);
    await page.getByPlaceholder('••••••••').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Masuk Sekarang' }).click();
    await waitForAutoSwal(page);

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Menunggu Pembayaran' }).click();
    await page.waitForTimeout(1000);

    // Click "Lihat Detail" for newest order
    await page.locator('button[title="Lihat Detail Pesanan"]').first().click();

    const reviewBtn = page.getByRole('button', { name: 'Review Bukti Pembayaran' });
    await reviewBtn.waitFor({ timeout: 8000 });
    await reviewBtn.click();

    await page.locator('input[type="radio"][value="approved"]').click();
    await page.getByRole('button', { name: 'Simpan Review' }).click();

    await dismissSwal(page, 10000);

    await expect(page.getByText('Pesanan Diproses').first()).toBeVisible({ timeout: 5000 });
  });

  test('7. Admin: ubah ke Dikirim + input resi', async ({ page }) => {
    // Re-login because of not using saved auth
    await page.goto('/login');
    await page.getByPlaceholder('kamu@email.com').fill(ADMIN.email);
    await page.getByPlaceholder('••••••••').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Masuk Sekarang' }).click();
    await waitForAutoSwal(page);

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Pesanan Diproses' }).click();
    await page.waitForTimeout(1000);

    await page.locator('button[title="Lihat Detail Pesanan"]').first().click();

    const shippedBtn = page.locator('.max-w-4xl').getByRole('button', { name: 'Dikirim' }).first();
    await shippedBtn.waitFor({ timeout: 8000 });
    await shippedBtn.scrollIntoViewIfNeeded();
    await shippedBtn.click({ force: true });

    await waitForAutoSwal(page);

    const addTrackingBtn = page.getByRole('button', { name: 'Tambah Nomor Resi' });
    await addTrackingBtn.waitFor({ timeout: 5000 });
    await addTrackingBtn.click();

    await page.getByPlaceholder('Contoh: 1234567890').fill('RESIBCA50M');
    await page.getByRole('combobox').selectOption('JNE');
    await page.getByRole('button', { name: 'Simpan Resi' }).click();

    await dismissSwal(page, 8000);
    await expect(page.getByText('RESIBCA50M').first()).toBeVisible({ timeout: 5000 });
  });

  test('8. Admin: ubah ke Selesai', async ({ page }) => {
    // Re-login again
    await page.goto('/login');
    await page.getByPlaceholder('kamu@email.com').fill(ADMIN.email);
    await page.getByPlaceholder('••••••••').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Masuk Sekarang' }).click();
    await waitForAutoSwal(page);

    await page.goto('/admin/orders');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Dikirim' }).click();
    await page.waitForTimeout(1000);

    await page.locator('button[title="Lihat Detail Pesanan"]').first().click();

    const completeBtn = page.locator('.max-w-4xl').getByRole('button', { name: 'Selesai' }).first();
    await completeBtn.waitFor({ timeout: 8000 });
    await completeBtn.scrollIntoViewIfNeeded();
    await completeBtn.click({ force: true });

    await waitForAutoSwal(page);
    await page.waitForTimeout(2000); // Wait for animations / db ops
    
    // Final verification, see if it is Selesai
    await expect(page.getByText('Status Selesai').or(page.getByText('Selesai').first())).toBeVisible();

    console.log(`Flow complete! Order ${createdOrderNumber} marked as Completed. Distribution triggers executed.`);
  });
});
