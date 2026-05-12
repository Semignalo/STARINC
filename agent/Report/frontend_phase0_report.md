# Frontend Phase 0 Report — Cleanup & Stabilisasi

**Tanggal:** 2026-04-16
**Agent:** Frontend Developer
**Phase:** 0 (Critical Cleanup)

---

## Ringkasan

Semua task Phase 0 (A1–A4) telah selesai dikerjakan. Firebase dependency berhasil dihapus sepenuhnya dari frontend. Build berhasil tanpa compile error.

---

## Task yang Dikerjakan

### A4 — Pindahkan Firebase API Key ke .env [SELESAI]

**File:** `.env`

Semua hardcoded Firebase config key dipindahkan ke environment variables dengan prefix `VITE_FIREBASE_*`. File `.env` sekarang mengandung:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

**Catatan Risiko:** Firebase API key sebelumnya hardcoded di git history. Disarankan rotasi key via Firebase Console setelah A3 selesai.

---

### A1 — Migrasi PaymentSettings.jsx dari Firebase ke Laravel API [SELESAI]

**File:** `src/pages/admin/PaymentSettings.jsx`

Perubahan:
- Hapus import `db` dari `../../lib/firebase` dan `doc`, `getDoc`, `setDoc` dari `firebase/firestore`
- Tambah import `adminSettingsApi` dari `../../api/settingsApi`
- Ganti `getDoc(doc(db, "settings", "payment"))` dengan `adminSettingsApi.getSettings()`
- Ganti `setDoc(doc(db, "settings", "payment"), config)` dengan `adminSettingsApi.updateSettings(config)`
- Error handling menggunakan `error?.response?.data?.message` (konsisten dengan pattern API client)
- Tidak ada perubahan pada UI/UX — tampilan identik dengan sebelumnya

**API Endpoint yang digunakan:**
- GET `/api/admin/settings` — fetch settings
- PUT `/api/admin/settings` — update settings

---

### A2 — Migrasi Appearance.jsx dari Firebase ke Laravel API [SELESAI]

**File:** `src/pages/admin/Appearance.jsx`

Perubahan:
- Hapus semua import Firebase: `db`, `storage`, `onSnapshot`, `setDoc`, `ref`, `uploadBytesResumable`, `getDownloadURL`
- Tambah import `adminSettingsApi` dari `../../api/settingsApi`
- Ganti `onSnapshot` real-time listener dengan satu kali fetch `adminSettingsApi.getAppearance()` pada mount
- Ganti `setDoc` Firestore dengan `adminSettingsApi.updateAppearance(config)`
- Refactor upload video:
  - Sebelum: langsung upload ke Firebase Storage menggunakan `uploadBytesResumable`
  - Sesudah: upload via `adminSettingsApi.uploadFile()` ke endpoint Laravel `/api/admin/upload`
- Ekstrak reusable sub-komponen `VideoUploadField` dan `HeroVideoUploader` untuk mengurangi duplikasi kode upload
- `lastSaved` state menampilkan waktu terakhir simpan (sebagai pengganti "Live Preview" timestamp Firebase)
- Default config dipindah ke konstanta `DEFAULT_CONFIG` di luar komponen

**API Endpoint yang digunakan:**
- GET `/api/admin/appearance` — fetch appearance settings
- PUT `/api/admin/appearance` — update appearance settings
- POST `/api/admin/upload` — upload file (video/image) — **endpoint ini perlu diimplementasikan di backend**

**Catatan Backend Dependency:**
Endpoint `POST /api/admin/upload` belum ada di backend. Backend perlu mengimplementasikan endpoint ini yang menerima `multipart/form-data` dengan field `file` dan `folder`, lalu mengembalikan `{ url: string }`.

---

### A3 — Hapus firebase.js dan dependency [SELESAI]

**Files yang diubah:**
- `src/lib/firebase.js` — **DIHAPUS**
- `package.json` — dependency `"firebase": "^12.9.0"` dihapus

**Verifikasi:**
- Grep untuk `firebase` di seluruh direktori `src/` — tidak ditemukan satu pun file yang masih menggunakan firebase
- `npm run build` berhasil tanpa error

---

## Hasil Verifikasi

### npm run build
```
vite v7.3.1 building client environment for production...
2459 modules transformed.
dist/index.html          0.79 kB
dist/assets/index.css   92.23 kB
dist/assets/index.js   964.74 kB (gzip: 278.26 kB)
built in 14.36s
```

Build berhasil. Ukuran bundle berkurang signifikan karena Firebase SDK (~350KB gzip) sudah dihapus.

### npm run lint (file yang dimodifikasi)
- `src/pages/admin/PaymentSettings.jsx` — 0 error
- `src/pages/admin/Appearance.jsx` — 0 error
- `src/api/settingsApi.js` — 0 error

---

## Catatan untuk Tim Backend

Task A2 memerlukan endpoint baru di backend:

**POST /api/admin/upload**
- Auth: Bearer token admin
- Content-Type: `multipart/form-data`
- Body: `file` (File), `folder` (string, opsional)
- Response: `{ url: string }` — URL publik file yang diupload ke Laravel storage

Tanpa endpoint ini, fitur upload video di halaman Appearance tidak akan berfungsi. User masih bisa input URL video manual.

---

## File yang Dimodifikasi

| File | Status |
|------|--------|
| `src/pages/admin/PaymentSettings.jsx` | Dimigrasi dari Firebase ke settingsApi |
| `src/pages/admin/Appearance.jsx` | Dimigrasi dari Firebase ke settingsApi |
| `src/api/settingsApi.js` | Ditambah method `uploadFile()` |
| `src/lib/firebase.js` | Dihapus |
| `package.json` | Dependency firebase dihapus |
| `.env` | Firebase config dipindah ke env vars |
