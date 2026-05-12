<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #20c997; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .alert { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 15px; }
        .commission-box { background-color: white; padding: 20px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #20c997; }
        .commission-amount { font-size: 28px; font-weight: bold; color: #20c997; margin: 15px 0; }
        .details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background-color: #e9ecef; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Komisi Anda Telah Didistribusikan</h1>
        </div>
        <div class="content">
            <p>Halo {{ $userName }},</p>

            <div class="alert">
                <strong>✓ Komisi dari penjualan Anda telah diproses!</strong>
            </div>

            <div class="commission-box">
                <h3>Detail Komisi</h3>
                <p><strong>Jumlah Komisi:</strong></p>
                <div class="commission-amount">
                    Rp {{ number_format($commissionAmount, 0, ',', '.') }}
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">

                <p><strong>Tingkat Komisi:</strong> {{ number_format($commissionRate, 2, ',', '.') }}%</p>
                <p><strong>Dari Pesanan:</strong> {{ $orderNumber }}</p>
                <p><strong>Nilai Pesanan:</strong> Rp {{ number_format($orderAmount, 0, ',', '.') }}</p>
            </div>

            <div class="details">
                <h3>Informasi Pembayaran</h3>
                <p>Komisi Anda akan ditransfer ke rekening yang terdaftar di akun Anda dalam waktu 1-3 hari kerja.</p>
                <p>Jangan lupa untuk melakukan verifikasi nomor rekening Anda di pengaturan akun untuk memastikan komisi diterima dengan benar.</p>
            </div>

            <p><strong>Terus tingkatkan penjualan Anda!</strong> Semakin banyak Anda menjual, semakin banyak komisi yang Anda dapatkan.</p>

            <p>Jika ada pertanyaan mengenai komisi atau pembayaran, hubungi tim support kami.</p>

            <p>Terima kasih telah menjadi bagian dari STARINC!</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} STARINC Platform. Semua hak dilindungi.</p>
        </div>
    </div>
</body>
</html>
