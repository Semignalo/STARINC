<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #1f2937; padding: 32px; }
  .header { border-bottom: 3px solid #047857; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; font-weight: 700; color: #047857; }
  .header p  { font-size: 11px; color: #6b7280; margin-top: 4px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
                   color: #047857; border-bottom: 1px solid #d1fae5; padding-bottom: 4px; margin-bottom: 12px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; }
  .card-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
  .card-value { font-size: 18px; font-weight: 700; color: #111827; margin-top: 2px; }
  .card-value.green { color: #047857; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; font-size: 10px; font-weight: 700; text-transform: uppercase;
       letter-spacing: 0.05em; color: #6b7280; padding: 8px 10px; text-align: left; }
  td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; font-size: 11px; }
  .text-right { text-align: right; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
  .badge-completed { background: #d1fae5; color: #047857; }
  .badge-pending   { background: #fef3c7; color: #92400e; }
  .badge-cancelled { background: #fee2e2; color: #991b1b; }
  .footer { margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 12px;
            font-size: 10px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>

<div class="header">
  <h1>Laporan Keuangan Bulanan — STARINC</h1>
  <p>Periode: {{ \Carbon\Carbon::parse($month . '-01')->translatedFormat('F Y') }}
     &nbsp;|&nbsp; Dicetak: {{ now()->format('d M Y H:i') }}</p>
</div>

{{-- Summary Cards --}}
<div class="section">
  <div class="section-title">Ringkasan</div>
  <div class="grid-2">
    <div class="card">
      <div class="card-label">Total Revenue</div>
      <div class="card-value green">Rp {{ number_format($revenue, 0, ',', '.') }}</div>
    </div>
    <div class="card">
      <div class="card-label">Total Order</div>
      <div class="card-value">{{ $orderCount }}</div>
    </div>
    <div class="card">
      <div class="card-label">Order Selesai</div>
      <div class="card-value">{{ $completedCount }}</div>
    </div>
    <div class="card">
      <div class="card-label">Order Dibatalkan</div>
      <div class="card-value">{{ $cancelledCount }}</div>
    </div>
  </div>
</div>

{{-- Commission Summary --}}
<div class="section">
  <div class="section-title">Komisi</div>
  <div class="grid-2">
    <div class="card">
      <div class="card-label">Komisi Pending</div>
      <div class="card-value">Rp {{ number_format($commPending, 0, ',', '.') }}</div>
    </div>
    <div class="card">
      <div class="card-label">Komisi Dibayarkan</div>
      <div class="card-value green">Rp {{ number_format($commPaid, 0, ',', '.') }}</div>
    </div>
  </div>
</div>

{{-- Top Products --}}
@if($topProducts->isNotEmpty())
<div class="section">
  <div class="section-title">Produk Terlaris</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Produk</th>
        <th class="text-right">Qty Terjual</th>
        <th class="text-right">Revenue</th>
      </tr>
    </thead>
    <tbody>
      @foreach($topProducts as $i => $p)
      <tr>
        <td>{{ $i + 1 }}</td>
        <td>{{ $p->product_title }}</td>
        <td class="text-right">{{ number_format($p->qty) }}</td>
        <td class="text-right">Rp {{ number_format($p->revenue, 0, ',', '.') }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>
@endif

{{-- Order List --}}
<div class="section">
  <div class="section-title">Daftar Order ({{ $orders->count() }} order)</div>
  <table>
    <thead>
      <tr>
        <th>No. Order</th>
        <th>Customer</th>
        <th class="text-right">Total</th>
        <th>Status</th>
        <th>Tanggal</th>
      </tr>
    </thead>
    <tbody>
      @foreach($orders as $o)
      <tr>
        <td>{{ $o->order_number }}</td>
        <td>{{ $o->customer_info['name'] ?? '-' }}</td>
        <td class="text-right">Rp {{ number_format($o->total, 0, ',', '.') }}</td>
        <td>
          <span class="badge badge-{{ in_array($o->status, ['cancelled','rejected']) ? 'cancelled' : ($o->status === 'completed' ? 'completed' : 'pending') }}">
            {{ $o->status }}
          </span>
        </td>
        <td>{{ $o->created_at->format('d/m/Y') }}</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>

<div class="footer">
  Dokumen ini digenerate otomatis oleh sistem STARINC Platform.
  Harap simpan sebagai arsip internal.
</div>

</body>
</html>
