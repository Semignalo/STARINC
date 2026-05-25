<?php

namespace App\Console\Commands;

use App\Models\StarcenterNetwork;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class ImportCenters extends Command
{
    protected $signature = 'import:centers {file : Path to xlsx file} {--dry-run : Preview without writing}';

    protected $description = 'Import Starcenter members from Excel file (DATA CENTER AKTIF format)';

    /** Excel column index (1-based) → field key. */
    private array $colMap = [
        2  => 'member_id',          // B  - NO ID
        3  => 'center_name',        // C  - Nama Pendaftaran Center Star Inc
        4  => 'full_name',          // D  - Nama Lengkap
        6  => 'birth_date',         // F  - Tanggal Lahir
        7  => 'address',            // G  - Alamat
        8  => 'phone',              // H  - No Tlp / Wa
        9  => 'email',              // I  - Email
        10 => 'city',               // J  - Kota
        11 => 'initiator_name',     // K  - Nama Inisiator
        12 => 'bank_name',          // L  - Nama Bank
        13 => 'bank_account_number',// M  - No Rekening
        14 => 'bank_account_holder',// N  - Nama Pemilik Rekening
        15 => 'bank_branch',        // O  - Cabang Bank
        16 => 'npwp_number',        // P  - No NPWP
        17 => 'npwp_holder_name',   // Q  - Nama Pemilik NPWP
        18 => 'ig_account',         // R  - Akun IG
        20 => 'status_raw',         // T  - Aktif & Tidak Aktif
    ];

    public function handle(): int
    {
        $file = $this->argument('file');
        $dryRun = (bool) $this->option('dry-run');

        if (!file_exists($file)) {
            $this->error("File not found: {$file}");
            return self::FAILURE;
        }

        $this->info("Reading: {$file}");
        $reader = IOFactory::createReaderForFile($file);
        $reader->setReadDataOnly(true);
        $sheet = $reader->load($file)->getActiveSheet();

        $rows = [];
        $highest = $sheet->getHighestRow();
        for ($i = 3; $i <= $highest; $i++) {
            $row = [];
            foreach ($this->colMap as $colIdx => $key) {
                $col = Coordinate::stringFromColumnIndex($colIdx);
                $row[$key] = $sheet->getCell($col . $i)->getValue();
            }
            $mid = trim((string) ($row['member_id'] ?? ''));
            if ($mid === '' || $mid === '-' || !preg_match('/^SC\d{6,}/i', $mid)) continue;
            $row['_excel_row'] = $i;
            $rows[] = $row;
        }

        $this->info('Rows to process: ' . count($rows));

        $created = $skipped = $failed = 0;
        $log = [];

        DB::beginTransaction();
        try {
            // PASS 1 — create users (skip referrer linking)
            $emailSeen = [];
            foreach ($rows as $row) {
                $memberId = trim((string) $row['member_id']);
                $email    = strtolower(trim((string) $row['email']));
                $phone    = $this->normalizePhone((string) $row['phone']);

                if (!$memberId) { $log[] = "Row {$row['_excel_row']}: skip (no member_id)"; $skipped++; continue; }
                if (!$email)    { $log[] = "Row {$row['_excel_row']}: skip member {$memberId} (no email)"; $skipped++; continue; }
                if (isset($emailSeen[$email])) {
                    $log[] = "Row {$row['_excel_row']}: skip {$memberId} (duplicate email {$email} in file)";
                    $skipped++;
                    continue;
                }
                $emailSeen[$email] = true;

                if (User::where('member_id', $memberId)->orWhere('email', $email)->exists()) {
                    $log[] = "Row {$row['_excel_row']}: skip {$memberId} (already exists)";
                    $skipped++;
                    continue;
                }

                $status = stripos((string) $row['status_raw'], 'aktif') !== false
                    && stripos((string) $row['status_raw'], 'tidak') === false
                        ? 'active' : 'inactive';

                try {
                    User::create([
                        'member_id'           => $memberId,
                        'name'                => $this->clean($row['full_name']) ?: 'Unknown',
                        'center_name'         => $this->clean($row['center_name']),
                        'email'               => $email,
                        'password'            => Hash::make($phone ?: 'password123'),
                        'phone'               => $phone,
                        'address'             => $this->clean($row['address']),
                        'city'                => $this->clean($row['city']),
                        'birth_date'          => $this->parseDate($row['birth_date']),
                        'bank_name'           => $this->clean($row['bank_name']),
                        'bank_account_number' => $this->clean($row['bank_account_number']),
                        'bank_account_holder' => $this->clean($row['bank_account_holder']),
                        'bank_branch'         => $this->clean($row['bank_branch']),
                        'npwp_number'         => $this->clean($row['npwp_number']),
                        'npwp_holder_name'    => $this->clean($row['npwp_holder_name']),
                        'ig_account'          => $this->clean($row['ig_account']),
                        'initiator_name'      => $this->clean($row['initiator_name']),
                        'role'                => 'starcenter',
                        'status'              => $status,
                        'email_verified_at'   => now(),
                    ]);
                    $created++;
                    $log[] = "Row {$row['_excel_row']}: ✓ {$memberId} ({$email})";
                } catch (\Throwable $e) {
                    $failed++;
                    $log[] = "Row {$row['_excel_row']}: ✗ {$memberId} — " . $e->getMessage();
                }
            }

            // PASS 2 — link referrer by center_name match
            $this->info('Linking referrers...');
            $linked = 0;
            foreach ($rows as $row) {
                $memberId = trim((string) $row['member_id']);
                $iniName  = trim((string) $row['initiator_name']);
                if (!$memberId || !$iniName) continue;

                $user = User::where('member_id', $memberId)->first();
                if (!$user || $user->referrer_id) continue;

                // Try match by center_name (case + whitespace insensitive), then by name
                $needle = strtolower(preg_replace('/\s+/', ' ', $iniName));
                $referrer = User::whereRaw("LOWER(REPLACE(REPLACE(REPLACE(center_name, '  ', ' '), '  ', ' '), '  ', ' ')) = ?", [$needle])->first()
                    ?: User::whereRaw("LOWER(REPLACE(REPLACE(REPLACE(name, '  ', ' '), '  ', ' '), '  ', ' ')) = ?", [$needle])->first();

                if (!$referrer) {
                    // STARINC MANAGEMENT PUSAT → admin
                    if (stripos($iniName, 'PUSAT') !== false || stripos($iniName, 'MANAGEMENT') !== false) {
                        $referrer = User::where('role', 'admin')->first();
                    }
                }

                if ($referrer && $referrer->id !== $user->id) {
                    $user->update(['referrer_id' => $referrer->id]);
                    StarcenterNetwork::firstOrCreate([
                        'upline_id'   => $referrer->id,
                        'downline_id' => $user->id,
                        'depth'       => 1,
                    ]);
                    // Build deeper closure rows
                    $uplines = StarcenterNetwork::where('downline_id', $referrer->id)->get();
                    foreach ($uplines as $up) {
                        if ($up->depth < 7) {
                            StarcenterNetwork::firstOrCreate([
                                'upline_id'   => $up->upline_id,
                                'downline_id' => $user->id,
                                'depth'       => $up->depth + 1,
                            ]);
                        }
                    }
                    $linked++;
                }
            }

            if ($dryRun) {
                DB::rollBack();
                $this->warn('[DRY-RUN] Rolled back.');
            } else {
                DB::commit();
            }

            $this->newLine();
            foreach ($log as $line) $this->line($line);
            $this->newLine();
            $this->info("Created: {$created}  |  Skipped: {$skipped}  |  Failed: {$failed}  |  Linked: {$linked}");

            return self::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Fatal: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return self::FAILURE;
        }
    }

    private function clean(mixed $v): ?string
    {
        if ($v === null) return null;
        $s = preg_replace('/\s+/', ' ', trim((string) $v));
        if ($s === '' || $s === '-' || strtolower($s) === 'n/a') return null;
        return $s;
    }

    private function normalizePhone(string $v): ?string
    {
        $v = preg_replace('/\D+/', '', $v);
        if (!$v) return null;
        if (str_starts_with($v, '62')) $v = '0' . substr($v, 2);
        return $v;
    }

    private const ID_MONTHS = [
        'januari'=>'January','februari'=>'February','maret'=>'March','april'=>'April',
        'mei'=>'May','juni'=>'June','juli'=>'July','agustus'=>'August',
        'september'=>'September','oktober'=>'October','november'=>'November','desember'=>'December',
        'jan'=>'January','feb'=>'February','mar'=>'March','apr'=>'April','jun'=>'June',
        'jul'=>'July','agu'=>'August','sep'=>'September','okt'=>'October','nov'=>'November','des'=>'December',
    ];

    private function parseDate(mixed $v): ?string
    {
        if ($v === null || $v === '' || $v === '-') return null;
        if (is_numeric($v)) {
            try {
                return ExcelDate::excelToDateTimeObject((float) $v)->format('Y-m-d');
            } catch (\Throwable) {
                return null;
            }
        }

        $s = (string) $v;
        // Multi-date "A - B": take the last date (usually the owner's actual birthdate)
        if (preg_match('/^(.+?)\s*[-\/]\s*(.+)$/', $s, $m)) {
            $s = trim($m[2]);
        }

        // Translate Indonesian month names
        $lower = strtolower($s);
        foreach (self::ID_MONTHS as $id => $en) {
            $lower = preg_replace('/\b' . preg_quote($id, '/') . '\b/', $en, $lower);
        }

        try {
            return Carbon::parse($lower)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }
}
