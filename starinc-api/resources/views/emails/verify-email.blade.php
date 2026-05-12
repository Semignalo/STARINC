<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10b981; color: white; padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background-color: #f9fafb; padding: 30px 24px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .url-fallback { word-break: break-all; background-color: #f0f0f0; padding: 12px; border-radius: 4px; font-size: 13px; color: #555; }
        .footer { background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 8px 8px; }
        .notice { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-top: 20px; font-size: 14px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verifikasi Email Anda</h1>
        </div>
        <div class="content">
            <p>Halo, <strong>{{ $userName }}</strong>!</p>
            <p>Terima kasih telah mendaftar di STARINC. Klik tombol di bawah untuk mengaktifkan akun Anda:</p>
            <p style="text-align: center;">
                <a href="{{ $verifyUrl }}" class="button">Verifikasi Email Saya</a>
            </p>
            <p>Atau salin URL berikut ke browser Anda:</p>
            <p class="url-fallback">{{ $verifyUrl }}</p>
            <div class="notice">
                <strong>Penting:</strong> Link ini hanya berlaku selama <strong>60 menit</strong>. Jika sudah kadaluarsa, silakan login dan minta kirim ulang link verifikasi.
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #777;">
                Jika Anda tidak mendaftar di STARINC, abaikan email ini.
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} STARINC Platform. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
