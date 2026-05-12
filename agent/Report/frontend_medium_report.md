# Frontend Medium Priority — Phase 3 Report

> Tanggal: 2026-04-16
> Status: SELESAI

---

## Task yang Dikerjakan

### C4 — Custom Hook `useApi.js` ✅
**File:** `src/hooks/useApi.js` (baru)

Custom hook standar untuk mengelola state `loading`, `error`, dan `data` dari API call secara konsisten di seluruh app.

**API:**
```js
const { data, loading, error, execute, reset, setData } = useApi(apiFn, { onSuccess, onError, initialData });
```

**Fitur:**
- Auto-extract error message via `getErrorMessage()` dari `client.js`
- Callback `onSuccess` dan `onError` opsional
- Method `reset()` untuk clear state
- Method `setData()` untuk update data manual

---

### G1 — Inline Validation Register Form ✅
**File:** `src/pages/Login.jsx` (diubah)

Ditambahkan validasi inline pada form register (Login.jsx handle keduanya):

1. **Email validation**: Ikon ✓/✗ muncul setelah blur, error message "Format email tidak valid"
2. **Password strength indicator**: Bar warna + label (Lemah/Sedang/Kuat/Sangat Kuat) pada register mode
3. **Password show/hide toggle**: Tombol eye icon di field password

**Logika password strength:**
- Panjang ≥8 karakter (+1)
- Ada huruf kapital (+1)
- Ada angka (+1)
- Ada karakter spesial (+1)
- Score 1 = Lemah (merah), 2 = Sedang (kuning), 3 = Kuat (biru), 4 = Sangat Kuat (hijau)

---

### F3 — Audit Unused Dependencies ✅
**File:** `package.json` (tidak ada perubahan diperlukan)

Audit dilakukan. Semua dependencies di `package.json` aktif digunakan:
- `axios` → `src/api/client.js`
- `clsx` + `tailwind-merge` → `src/lib/utils.js`
- `lucide-react` → ikon di seluruh komponen
- `react`, `react-dom` → framework
- `react-router-dom` → routing
- `recharts` → grafik di admin Dashboard
- `sweetalert2` → notifikasi/dialog

Firebase (`firebase` package) sudah dihapus di Phase 0. Tidak ada dependency orphan.

---

## Catatan Tambahan

- **Build status**: ✅ `npm run build` berhasil (6.29s)
- **Lint status**: ✅ `npm run lint` — 0 error, 0 warning
- **Bundle size**: 979 KB (belum dilakukan code-splitting — task D3/F1 High priority masih pending)
