<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .alert { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
        .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bukti Pembayaran Diterima</h1>
        </div>
        <div class="content">
            <p>Halo {{ $customerName }},</p>

            <div class="alert">
                <strong>✓ Pembayaran Anda telah diterima dan diverifikasi!</strong>
            </div>

            <p>Pesanan Anda segera akan diproses oleh tim kami. Anda akan menerima notifikasi lagi ketika pesanan mulai disiapkan untuk pengiriman.</p>

            <div class="details">
                <h3>Informasi Pesanan</h3>
                <p><strong>Nomor Pesanan:</strong> {{ $orderNumber }}</p>
                <p><strong>Total Pembayaran:</strong> Rp {{ number_format($totalAmount, 0, ',', '.') }}</p>
                <p><strong>Status:</strong> Pembayaran Diterima</p>
            </div>

            <p>Langkah selanjutnya:</p>
            <ol>
                <li>Pesanan dipersiapkan oleh penjual</li>
                <li>Anda akan menerima notifikasi pengiriman dengan nomor resi</li>
                <li>Paket akan tiba di alamat Anda</li>
            </ol>

            <p>Terima kasih telah berbelanja di STARINC!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} STARINC Platform. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
