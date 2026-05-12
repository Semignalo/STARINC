<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentRejectedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        private Order $order,
        private ?string $reason = null
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Bukti Pembayaran Ditolak - Order #' . $this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.payment-rejected',
            with: [
                'order' => $this->order,
                'customerName' => $this->order->customer_info['name'] ?? 'Pelanggan',
                'orderNumber' => $this->order->order_number,
                'reason' => $this->reason ?? 'Bukti pembayaran tidak sesuai dengan persyaratan',
                'totalAmount' => (float) $this->order->total,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
