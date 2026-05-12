<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WalletLedger;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    /**
     * GET /user/wallet — saldo + riwayat transaksi (paginated).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $balance = WalletLedger::getBalance($user->id);

        $ledgers = WalletLedger::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'balance'      => (float) $balance,
            'transactions' => $ledgers,
        ]);
    }

    /**
     * POST /user/wallet/withdraw — request penarikan saldo.
     */
    public function withdraw(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'amount'          => 'required|numeric|min:50000',
            'bank_name'       => 'required|string|max:100',
            'account_number'  => 'required|string|max:50',
            'account_name'    => 'required|string|max:100',
        ]);

        $balance = WalletLedger::getBalance($user->id);

        if ($validated['amount'] > $balance) {
            return response()->json([
                'message' => 'Saldo tidak mencukupi. Saldo tersedia: Rp ' . number_format($balance, 0, ',', '.'),
            ], 422);
        }

        $description = "Penarikan ke {$validated['bank_name']} {$validated['account_number']} a.n. {$validated['account_name']}";

        WalletLedger::create([
            'user_id'     => $user->id,
            'type'        => 'debit',
            'amount'      => $validated['amount'],
            'description' => $description,
            'status'      => 'pending',
        ]);

        return response()->json([
            'message' => 'Permintaan penarikan berhasil dikirim. Admin akan memproses dalam 1-3 hari kerja.',
            'balance' => WalletLedger::getBalance($user->id),
        ]);
    }
}
