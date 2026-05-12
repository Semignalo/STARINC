const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
    // Manually mark paid orders as processing
    const cmd = `cd /var/www/sdp-v2/starinc-api && php artisan tinker --execute="
\\$orders = \\App\\Models\\Order::whereIn('order_number', ['INV-C1X63YSP', 'INV-E0WLG1WY'])->get();
foreach (\\$orders as \\$o) {
    if (\\$o->status === 'pending_payment') {
        \\$o->update(['status' => 'processing']);
        echo 'Updated: ' . \\$o->order_number . PHP_EOL;
    } else {
        echo 'Skipped (' . \\$o->status . '): ' . \\$o->order_number . PHP_EOL;
    }
}
"`;
    conn.exec(cmd, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('close', () => conn.end());
    });
})
.connect({ host: '157.10.161.83', port: 22, username: 'STARINC', password: 'Starinc1998!!', tryKeyboard: true });
conn.on('keyboard-interactive', (n, i, l, p, finish) => finish(['Starinc1998!!']));
