<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .order-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .item { border-bottom: 1px solid #eee; padding: 10px 0; }
        .item:last-child { border-bottom: none; }
        .total { background-color: #e9ecef; padding: 15px; border-radius: 5px; text-align: right; font-size: 18px; font-weight: bold; margin-top: 10px; }
        .footer { background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Pesanan Anda Berhasil Dibuat</h1>
        </div>
        <div class="content">
            <p>Halo {{ $customerName }},</p>
            <p>Terima kasih telah berbelanja di STARINC! Pesanan Anda telah berhasil dibuat dan sedang menunggu bukti pembayaran.</p>

            <div class="order-details">
                <h3>Detail Pesanan</h3>
                <p><strong>Nomor Pesanan:</strong> {{ $orderNumber }}</p>
                <p><strong>Tanggal:</strong> {{ $order->created_at->format('d M Y H:i') }}</p>

                <h4>Daftar Item:</h4>
                @foreach($items as $item)
                    <div class="item">
                        <strong>{{ $item->product_title }}</strong><br>
                        Qty: {{ $item->quantity }} x Rp {{ number_format($item->unit_price, 0, ',', '.') }}
                        = <strong>Rp {{ number_format($item->line_total, 0, ',', '.') }}</strong>
                    </div>
                @endforeach

                <div class="total">
                    Total: Rp {{ number_format($total, 0, ',', '.') }}
                </div>
            </div>

            <p>Silakan upload bukti pembayaran untuk melanjutkan proses pesanan Anda. Anda dapat melakukannya melalui aplikasi atau website kami.</p>

            <p>Jika ada pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
            <p>Terima kasih!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} STARINC Platform. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
