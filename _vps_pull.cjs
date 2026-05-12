const { Client } = require('ssh2');
const conn = new Client();

const commands = [
    'cd /var/www/sdp-v2 && sudo chown -R STARINC:STARINC starinc-api/storage',
    // Keep .env out of git pull — exclude it from tracking temporarily
    'cd /var/www/sdp-v2 && git checkout -- .env 2>/dev/null; git pull origin main',
    // Restore production .env values after pull
    `cd /var/www/sdp-v2 && sed -i 's|VITE_API_URL=.*|VITE_API_URL=https://sdp.starincofficial.id/api|' .env && sed -i 's|VITE_STORAGE_URL=.*|VITE_STORAGE_URL=https://sdp.starincofficial.id/storage|' .env`,
    'cd /var/www/sdp-v2 && npm run build',
    'sudo chown -R www-data:www-data /var/www/sdp-v2/starinc-api/storage',
    'sudo systemctl restart sdp-api',
];

function runNext(i) {
    if (i >= commands.length) { console.log('\n✓ Done'); conn.end(); return; }
    const cmd = commands[i];
    console.log(`\n▶ ${cmd}`);
    conn.exec(cmd, (err, stream) => {
        if (err) { console.error(err); conn.end(); return; }
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('close', (code) => {
            if (code !== 0) { console.error(`✗ Exit ${code}`); conn.end(); return; }
            runNext(i + 1);
        });
    });
}

console.log('Connecting to VPS...');
conn.on('ready', () => { console.log('✓ Connected'); runNext(0); })
    .on('error', err => console.error('SSH error:', err.message))
    .connect({ host: '157.10.161.83', port: 22, username: 'STARINC', password: 'Starinc1998!!', tryKeyboard: true });

conn.on('keyboard-interactive', (n, i, l, p, finish) => finish(['Starinc1998!!']));
