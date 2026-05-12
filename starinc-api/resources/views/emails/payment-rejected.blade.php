<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .alert { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
        .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .action { text-align: center; margin: 20px 0; }
        .button { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; }
        .footer { background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bukti Pembayaran Ditolak</h1>
        </div>
        <div class="content">
            <p>Halo {{ $customerName }},</p>

            <div class="alert">
                <strong>✗ Bukti pembayaran Anda tidak dapat diterima</strong>
            </div>

            <p>Kami telah meninjau bukti pembayaran Anda untuk pesanan #{{ $orderNumber }}, namun sayangnya tidak memenuhi kriteria kami.</p>

            <div class="details">
                <h3>Alasan Penolakan</h3>
                <p>{{ $reason }}</p>

                <h3>Informasi Pesanan</h3>
                <p><strong>Nomor Pesanan:</strong> {{ $orderNumber }}</p>
                <p><strong>Total Pembayaran:</strong> Rp {{ number_format($totalAmount, 0, ',', '.') }}</p>
            </div>

            <p><strong>Yang Anda Butuhkan:</strong></p>
            <ul>
                <li>Bukti pembayaran harus jelas terlihat</li>
                <li>Harus menunjukkan tanggal, jumlah, dan penerima</li>
                <li>Format: JPG, PNG, atau PDF (max 2MB)</li>
            </ul>

            <p>Silakan upload bukti pembayaran baru melalui aplikasi atau website kami untuk memproses pesanan Anda.</p>

            <div class="action">
                <p>Jika Anda memiliki pertanyaan, hubungi tim support kami segera.</p>
            </div>

            <p>Terima kasih!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} STARINC Platform. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
