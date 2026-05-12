<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderShippedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Pesanan Anda Dikirim - Order #' . $this->order->order_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order-shipped',
            with: [
                'order' => $this->order,
                'customerName' => $this->order->customer_info['name'] ?? 'Pelanggan',
                'orderNumber' => $this->order->order_number,
                'trackingNumber' => $this->order->tracking_number,
                'shippingProvider' => $this->order->shipping_provider ?? 'JNE',
                'shippingAddress' => $this->order->customer_info['address'] ?? '',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
