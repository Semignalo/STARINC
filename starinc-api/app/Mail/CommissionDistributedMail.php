<?php

namespace App\Mail;

use App\Models\Commission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CommissionDistributedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private Commission $commission)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Komisi Anda Telah Didistribusikan',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.commission-distributed',
            with: [
                'commission' => $this->commission,
                'userName' => $this->commission->user->name ?? 'Mitra',
                'commissionAmount' => (float) $this->commission->commission_amount,
                'commissionRate' => (float) $this->commission->commission_rate,
                'orderNumber' => $this->commission->order->order_number ?? '-',
                'orderAmount' => (float) ($this->commission->order->total ?? 0),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
