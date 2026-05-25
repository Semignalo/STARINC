<?php

namespace App\Console\Commands;

use App\Console\Commands\ImportCenters;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class BackfillBirthDates extends Command
{
    protected $signature = 'centers:backfill-birthdates {file}';

    protected $description = 'Backfill birth_date for already-imported centers using improved parser';

    private const ID_MONTHS = [
        'januari'=>'January','februari'=>'February','maret'=>'March','april'=>'April',
        'mei'=>'May','juni'=>'June','juli'=>'July','agustus'=>'August',
        'september'=>'September','oktober'=>'October','november'=>'November','desember'=>'December',
        'jan'=>'January','feb'=>'February','mar'=>'March','apr'=>'April','jun'=>'June',
        'jul'=>'July','agu'=>'August','sep'=>'September','okt'=>'October','nov'=>'November','des'=>'December',
    ];

    public function handle(): int
    {
        $file = $this->argument('file');
        $reader = IOFactory::createReaderForFile($file);
        $reader->setReadDataOnly(true);
        $sheet = $reader->load($file)->getActiveSheet();

        $updated = $failed = 0;
        for ($i = 3; $i <= $sheet->getHighestRow(); $i++) {
            $mid = trim((string) $sheet->getCell('B' . $i)->getValue());
            if (!preg_match('/^SC\d{6,}/i', $mid)) continue;

            $user = User::where('member_id', $mid)->first();
            if (!$user || $user->birth_date) continue;

            $raw = $sheet->getCell('F' . $i)->getValue();
            $parsed = $this->parseDate($raw);
            if ($parsed) {
                $user->update(['birth_date' => $parsed]);
                $this->line("✓ {$mid}: " . var_export($raw, true) . " → {$parsed}");
                $updated++;
            } elseif ($raw && $raw !== '-') {
                $this->warn("✗ {$mid}: cannot parse " . var_export($raw, true));
                $failed++;
            }
        }
        $this->info("Updated: {$updated}  |  Failed: {$failed}");
        return self::SUCCESS;
    }

    private function parseDate(mixed $v): ?string
    {
        if ($v === null || $v === '' || $v === '-') return null;
        if (is_numeric($v)) {
            try { return ExcelDate::excelToDateTimeObject((float) $v)->format('Y-m-d'); }
            catch (\Throwable) { return null; }
        }
        $s = (string) $v;
        if (preg_match('/^(.+?)\s*[-\/]\s*(.+)$/', $s, $m)) $s = trim($m[2]);
        $lower = strtolower($s);
        foreach (self::ID_MONTHS as $id => $en) {
            $lower = preg_replace('/\b' . preg_quote($id, '/') . '\b/', $en, $lower);
        }
        try { return Carbon::parse($lower)->format('Y-m-d'); }
        catch (\Throwable) { return null; }
    }
}
