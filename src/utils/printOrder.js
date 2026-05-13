const COMPANY = {
    name: 'STARINC',
    address: 'Jl. Puncak Golf Blok A1/16, Kelurahan Made, Kecamatan Sambikerep, Surabaya - Jawa Timur, 60219',
    phone: '+62811253599',
    email: 'starinc.tech@gmail.com',
};

const fmtRp = (v) => 'Rp. ' + Number(v || 0).toLocaleString('id-ID');

const fmtDate = (dateStr) => {
    const d = new Date(dateStr);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const fmtDateShort = (dateStr) => {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getFullYear()}`;
};


export function printInvoice(order) {
    const ci = order.customer_info || order.customer || {};
    const items = order.items || [];
    const docNo = order.order_number || String(order.id);
    const dateStr = fmtDateShort(order.created_at);
    const discPct  = Number(order.discount_percent  || 0);
    const discount = Number(order.discount_amount   || 0);
    const shipping = Number(order.shipping_cost     || 0);
    const subtotal = Number(order.subtotal          || 0);
    const total    = Number(order.total             || 0);

    // Build address lines the same way the PDF does (each on its own line)
    const addrLines = [
        ci.address,
        ci.city,
        ci.postal_code,
    ].filter(Boolean).map(l => `<div>${l}</div>`).join('');

    const itemRows = items.map((item, i) => {
        const name      = item.product_title || item.product?.title || item.title || '-';
        const variant   = item.variant_name  || item.variant?.name  || '';
        const label     = variant ? `${name} — ${variant}` : name;
        const qty       = item.quantity;
        const unitPrice = Number(item.unit_price || item.price || 0);
        const lineTotal = Number(item.line_total || qty * unitPrice || 0);
        const lineDisk  = discPct > 0 ? lineTotal * discPct / 100 : 0;

        return `<tr>
          <td style="text-align:center;width:32px;">${i + 1}</td>
          <td>${label}</td>
          <td style="text-align:center;width:44px;">${qty}</td>
          <td style="text-align:right;width:90px;">${fmtRp(unitPrice)}</td>
          <td style="text-align:right;width:100px;">${lineDisk > 0 ? fmtRp(lineDisk).replace('Rp. ', '') + ',00' : '-'}</td>
          <td style="text-align:right;width:90px;font-weight:bold;">${fmtRp(lineTotal)}</td>
        </tr>`;
    }).join('');

    const logoUrl = window.location.origin + '/logo-print.png';

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Faktur — ${docNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;background:#fff;}
    .page{width:210mm;min-height:297mm;margin:0 auto;padding:13mm 15mm 60px;position:relative;}
    table{width:100%;border-collapse:collapse;}
    th{padding:7px 8px;font-size:11px;font-weight:bold;border-top:1.5px solid #111;border-bottom:1.5px solid #111;text-align:left;}
    td{padding:6px 8px;font-size:11px;border-bottom:1px solid #ddd;vertical-align:top;}
    td.nb{border-bottom:none;}
    .hr-thick{border:none;border-top:2px solid #111;margin:8px 0;}
    @page{size:A4;margin:0;}
    @media print{
      html,body{margin:0;padding:0;}
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      .page{width:100%;min-height:100vh;padding:13mm 15mm 60px;}
    }
  </style>
</head>
<body onload="window.print()">
<div class="page">

  <!-- ── HEADER ── -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:6px;">
    <!-- Logo block -->
    <div style="display:flex;align-items:center;gap:10px;">
      <img src="${logoUrl}" alt="STARINC" style="height:60px;object-fit:contain;"/>
    </div>
    <!-- Title -->
    <div style="text-align:right;line-height:1.1;">
      <div style="font-size:30px;font-weight:bold;">Faktur</div>
      <div style="font-size:30px;font-weight:bold;">Penjualan</div>
    </div>
  </div>
  <hr class="hr-thick"/>

  <!-- ── BILLING INFO ── -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin:12px 0 16px;">
    <!-- Left: Kepada -->
    <div style="max-width:58%;line-height:1.55;">
      <div style="font-size:10px;">Kepada:</div>
      <div style="font-size:13px;font-weight:bold;margin-top:1px;">${ci.name || '-'}</div>
      ${addrLines}
      ${ci.phone ? `<div>No Telp : ${ci.phone}</div>` : ''}
    </div>
    <!-- Right: Doc info -->
    <div style="line-height:1.8;white-space:nowrap;">
      <div><span style="font-weight:bold;">No. Faktur</span>&nbsp; : ${docNo}</div>
      <div><span style="font-weight:bold;">Tanggal</span>&nbsp;&nbsp;&nbsp;&nbsp; : ${dateStr}</div>
    </div>
  </div>

  <!-- ── ITEMS TABLE ── -->
  <table>
    <colgroup>
      <col style="width:32px;"/>
      <col/>
      <col style="width:44px;"/>
      <col style="width:90px;"/>
      <col style="width:100px;"/>
      <col style="width:90px;"/>
    </colgroup>
    <thead>
      <tr>
        <th style="text-align:center;">NO</th>
        <th>KETERANGAN</th>
        <th style="text-align:center;">QTY</th>
        <th style="text-align:right;">HARGA</th>
        <th style="text-align:right;">DISKON</th>
        <th style="text-align:right;">JUMLAH</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}

      <!-- spacer after items -->
      <tr><td colspan="6" class="nb" style="height:14px;"></td></tr>

      <!-- Subtotal row -->
      <tr>
        <td colspan="5" class="nb" style="text-align:right;padding-right:8px;">Subtotal :</td>
        <td class="nb" style="text-align:right;font-weight:bold;">${fmtRp(subtotal)}</td>
      </tr>

      <!-- Diskon row — left cell empty, right label+value -->
      <tr>
        <td colspan="2" class="nb" style="font-size:10px;color:#444;"></td>
        <td colspan="3" class="nb" style="text-align:right;padding-right:8px;">Diskon (${discPct.toFixed(2)}%) :</td>
        <td class="nb" style="text-align:right;font-weight:bold;">${fmtRp(discount)}</td>
      </tr>

      <!-- Ongkir row -->
      <tr>
        <td colspan="5" class="nb" style="text-align:right;padding-right:8px;">Ongkir :</td>
        <td class="nb" style="text-align:right;font-weight:bold;">${fmtRp(shipping)}</td>
      </tr>

      <!-- Keterangan + Biaya Lain -->
      <tr>
        <td colspan="2" class="nb" style="font-size:10px;color:#444;">Keterangan (Biaya Lain-Lain) :</td>
        <td colspan="3" class="nb" style="text-align:right;padding-right:8px;">Biaya Lain-Lain :</td>
        <td class="nb" style="text-align:right;font-weight:bold;">${fmtRp(0)}</td>
      </tr>

      <!-- Notes + Total -->
      <tr>
        <td colspan="2" class="nb" style="font-size:10px;font-weight:bold;">${order.notes || ''}</td>
        <td colspan="3" class="nb" style="text-align:right;padding-right:8px;font-weight:bold;border-top:1.5px solid #111;">Total :</td>
        <td class="nb" style="text-align:right;font-weight:bold;border-top:1.5px solid #111;">${fmtRp(total)}</td>
      </tr>
    </tbody>
  </table>

  <!-- ── FOOTER ── -->
  <div style="position:absolute;bottom:14mm;left:14mm;right:14mm;display:flex;justify-content:space-between;align-items:flex-start;">
    <div style="line-height:1.6;">
      <div style="font-weight:bold;">STARINC JAKARTA</div>
      <div style="font-size:9.5px;">${COMPANY.address}</div>
      <div style="font-size:9.5px;"> </div>
      <div style="font-size:9.5px;">${COMPANY.phone}</div>
    </div>
    <div style="font-weight:bold;font-size:10.5px;">Payment Method</div>
  </div>

</div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=860,height=1000');
    w.document.write(html);
    w.document.close();
}

export function printSuratJalan(order) {
    const ci = order.customer_info || order.customer || {};
    const items = order.items || [];
    const docNo = order.order_number || String(order.id);
    const dateStr = fmtDate(order.created_at);

    const logoUrl = window.location.origin + '/logo-print.png';

    const itemRows = items.map((item, i) => {
        const name = item.product_title || item.product?.title || item.title || '-';
        const variant = item.variant_name || item.variant?.name || '';
        const fullName = variant ? `${name} — ${variant}` : name;
        return `
        <tr>
          <td style="text-align:center;">${i + 1}</td>
          <td>${fullName}</td>
          <td style="text-align:center;">pcs</td>
          <td style="text-align:center;">${item.quantity}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Surat Jalan — ${docNo}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;background:#fff;}
    .page{width:210mm;min-height:297mm;margin:0 auto;padding:13mm 15mm;position:relative;}
    table{width:100%;border-collapse:collapse;}
    th{padding:7px 8px;font-size:11px;font-weight:bold;border-top:1.5px solid #111;border-bottom:1.5px solid #111;text-align:left;}
    td{padding:6px 8px;font-size:11px;border-bottom:1px solid #ddd;vertical-align:top;}
    .hr-thick{border:none;border-top:2px solid #111;margin:8px 0;}
    .hr-thin{border:none;border-top:1px solid #ccc;margin:6px 0;}
    @page{size:A4;margin:0;}
    @media print{
      html,body{margin:0;padding:0;}
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      .page{width:100%;min-height:100vh;padding:13mm 15mm;}
    }
  </style>
</head>
<body onload="window.print()">
<div class="page">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
    <img src="${logoUrl}" alt="STARINC" style="height:60px;object-fit:contain;"/>
    <div style="font-weight:bold;font-size:11px;">${dateStr}</div>
  </div>
  <div class="hr-thick" style="margin-top:8px;"></div>

  <!-- Sender + Recipient -->
  <div style="display:flex;justify-content:space-between;margin-top:12px;margin-bottom:12px;line-height:1.6;">
    <div style="max-width:48%;">
      <div style="font-weight:bold;">${COMPANY.name}</div>
      <div style="font-size:10px;">${COMPANY.address}</div>
      <div style="font-size:10px;">${COMPANY.phone}</div>

      <div style="margin-top:16px;">
        <div style="font-size:18px;font-weight:bold;">SURAT JALAN</div>
        <div>No. : ${docNo}</div>
      </div>
    </div>
    <div style="max-width:48%;line-height:1.6;">
      <div style="font-size:10px;margin-bottom:2px;">Kepada:</div>
      <div style="font-weight:bold;">${ci.name || '-'}</div>
      ${ci.phone ? `<div>${ci.phone}</div>` : ''}

      <div style="margin-top:10px;">
        <div style="font-size:10px;font-weight:bold;">Alamat :</div>
        <div>${ci.address || ''}</div>
        ${ci.city ? `<div>${ci.city}</div>` : ''}
        ${ci.postal_code ? `<div>${ci.postal_code}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="hr-thin"></div>
  <div style="margin:8px 0;font-size:11px;">Telah diterima sebagai berikut</div>

  <!-- Items Table -->
  <table>
    <thead>
      <tr>
        <th style="text-align:center;width:32px;">No</th>
        <th>Item Description</th>
        <th style="text-align:center;width:55px;">UOM</th>
        <th style="text-align:center;width:55px;">QTY</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
      <tr><td colspan="4" style="height:24px;border-bottom:none;"></td></tr>
    </tbody>
  </table>

  <div class="hr-thin" style="margin-top:0;"></div>

  <div style="margin-top:8px;font-size:10px;">
    Note: Jika barang sudah diterima mohon kirim tanda terima melalui email ${COMPANY.email}
  </div>

  <!-- Signature -->
  <div style="display:flex;justify-content:space-between;margin-top:44px;text-align:center;">
    <div style="width:42%;">
      <div style="font-size:10px;font-weight:bold;">Hormat Kami,</div>
      <div style="height:64px;"></div>
      <div class="hr-thin"></div>
      <div style="font-weight:bold;">${COMPANY.name}</div>
    </div>
    <div style="width:42%;">
      <div style="font-size:10px;font-weight:bold;">Diterima Oleh,</div>
      <div style="height:64px;"></div>
      <div class="hr-thin"></div>
      <div style="font-weight:bold;">${ci.name || '-'}</div>
    </div>
  </div>

</div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=820,height=900');
    w.document.write(html);
    w.document.close();
}
