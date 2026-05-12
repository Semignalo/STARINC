<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pesanan Anda Berhasil Dibuat - Order #' . $this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-confirmed',
            with: [
                'order' => $this->order,
                'customerName' => $this->order->customer_info['name'] ?? 'Pelanggan',
                'orderNumber' => $this->order->order_number,
                'items' => $this->order->items,
                'total' => (float) $this->order->total,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
