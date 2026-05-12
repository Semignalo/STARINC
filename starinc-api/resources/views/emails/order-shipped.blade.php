<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .alert { background-color: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
        .tracking-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #17a2b8; }
        .tracking-detail { margin: 10px 0; padding: 10px; background-color: #f0f0f0; border-radius: 3px; }
        .footer { background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pesanan Anda Dikirim</h1>
        </div>
        <div class="content">
            <p>Halo {{ $customerName }},</p>

            <div class="alert">
                <strong>✓ Pesanan Anda sedang dalam perjalanan!</strong>
            </div>

            <p>Kami dengan senang hati mengumumkan bahwa pesanan Anda telah dikirim dan sedang dalam perjalanan menuju alamat Anda.</p>

            <div class="tracking-info">
                <h3>Informasi Pengiriman</h3>
                <p><strong>Nomor Pesanan:</strong> {{ $orderNumber }}</p>
                <p><strong>Nomor Resi (Tracking):</strong> <span style="font-family: monospace; background-color: #f0f0f0; padding: 5px; border-radius: 3px;"><strong>{{ $trackingNumber }}</strong></span></p>
                <p><strong>Kurir Pengiriman:</strong> {{ $shippingProvider }}</p>

                <div class="tracking-detail">
                    <p style="margin: 0;"><strong>Alamat Pengiriman:</strong></p>
                    <p style="margin: 5px 0 0 0;">{{ $shippingAddress }}</p>
                </div>
            </div>

            <p><strong>Langkah Selanjutnya:</strong></p>
            <ol>
                <li>Salin atau ingat nomor resi: <strong>{{ $trackingNumber }}</strong></li>
                <li>Kunjungi website kurir {{ $shippingProvider }} untuk melacak paket secara real-time</li>
                <li>Persiapkan diri untuk menerima paket Anda</li>
            </ol>

            <p><strong>Estimasi Waktu Tiba:</strong> 3-7 hari kerja (tergantung lokasi)</p>

            <p>Jika ada pertanyaan atau masalah dengan pengiriman, hubungi tim support kami segera.</p>

            <p>Terima kasih telah berbelanja di STARINC!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} STARINC Platform. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
