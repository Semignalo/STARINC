<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StarcenterApplication;
use App\Models\StarcenterNetwork;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class StarCenterApplicationController extends Controller
{
    /**
     * Public: Check if a center name is already taken.
     */
    public function checkCenterName(Request $request)
    {
        $name = $request->query('name', '');
        $taken = StarcenterApplication::where('center_name', $name)->exists()
            || User::where('center_name', $name)->exists();
        return response()->json(['available' => !$taken]);
    }

    /**
     * Public: Submit a new starcenter application.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'center_name'       => 'required|string|max:100|unique:starcenter_applications,center_name',
            'full_name'         => 'required|string|max:100',
            'birth_date'        => 'nullable|date',
            'nik'               => 'nullable|string|size:16',
            'id_card'           => 'nullable|file|image|max:5120',
            'email'             => 'required|email|unique:starcenter_applications,email|unique:users,email',
            'phone'             => 'required|string|max:20',
            'address'           => 'required|string|max:500',
            'city'              => 'required|string|max:100',
            'bank_name'         => 'nullable|string|max:100',
            'bank_number'       => 'nullable|string|max:50',
            'bank_account_name' => 'nullable|string|max:100',
            'bank_branch'       => 'nullable|string|max:100',
            'bank_book'         => 'nullable|file|image|max:5120',
            'tax_number'        => 'nullable|string|max:30',
            'npwp_holder_name'  => 'nullable|string|max:100',
            'tax_doc'           => 'nullable|file|image|max:5120',
            'ig_account'        => 'nullable|string|max:100',
            'referral_code'     => 'required|string|max:20|exists:users,member_id',
        ], [
            'referral_code.exists' => 'Kode inisiator (SC...) tidak ditemukan.',
        ]);

        $referrer = User::where('member_id', $validated['referral_code'])->first();

        $idCardPath   = $request->hasFile('id_card')   ? $request->file('id_card')->store('applications/id_cards', 'local') : null;
        $bankBookPath = $request->hasFile('bank_book') ? $request->file('bank_book')->store('applications/bank_books', 'local') : null;
        $taxDocPath   = $request->hasFile('tax_doc')   ? $request->file('tax_doc')->store('applications/tax_docs', 'local') : null;

        $application = StarcenterApplication::create([
            'center_name'       => $validated['center_name'],
            'full_name'         => $validated['full_name'],
            'birth_date'        => $validated['birth_date'] ?? null,
            'nik'               => $validated['nik'] ?? null,
            'id_card_path'      => $idCardPath,
            'email'             => $validated['email'],
            'phone'             => $validated['phone'],
            'address'           => $validated['address'],
            'city'              => $validated['city'],
            'bank_name'         => $validated['bank_name'] ?? null,
            'bank_number'       => $validated['bank_number'] ?? null,
            'bank_account_name' => $validated['bank_account_name'] ?? null,
            'bank_branch'       => $validated['bank_branch'] ?? null,
            'bank_book_path'    => $bankBookPath,
            'tax_number'        => $validated['tax_number'] ?? null,
            'npwp_holder_name'  => $validated['npwp_holder_name'] ?? null,
            'tax_doc_path'      => $taxDocPath,
            'ig_account'        => $validated['ig_account'] ?? null,
            'referral_code'     => $validated['referral_code'],
            'referrer_id'       => $referrer->id,
            'status'            => 'pending',
        ]);

        return response()->json([
            'message' => 'Pendaftaran berhasil dikirim. Tim kami akan meninjau dalam 1–3 hari kerja.',
            'id'      => $application->id,
        ], 201);
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Methods
    |--------------------------------------------------------------------------
    */

    public function index(Request $request)
    {
        $query = StarcenterApplication::with('referrer:id,name,member_id')
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(30));
    }

    public function show(int $id)
    {
        $app = StarcenterApplication::with([
            'referrer:id,name,email,member_id',
            'user:id,name,email,role,member_id',
        ])->findOrFail($id);
        return response()->json($app);
    }

    public function serveDocument(int $id, Request $request)
    {
        $app = StarcenterApplication::findOrFail($id);

        $field = $request->query('field');
        $path = match ($field) {
            'id_card'   => $app->id_card_path,
            'bank_book' => $app->bank_book_path,
            'tax_doc'   => $app->tax_doc_path,
            default     => null,
        };

        if (!$path || !Storage::disk('local')->exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }

        return Storage::disk('local')->response($path);
    }

    /**
     * Admin: Approve application — create User account with starcenter role.
     * Password default = nomor HP user.
     */
    public function approve(int $id)
    {
        $app = StarcenterApplication::findOrFail($id);

        if ($app->status !== 'pending') {
            return response()->json(['message' => 'Aplikasi sudah diproses sebelumnya.'], 422);
        }

        DB::transaction(function () use ($app) {
            $user = User::create([
                'name'                 => $app->full_name,
                'center_name'          => $app->center_name,
                'email'                => $app->email,
                'phone'                => $app->phone,
                'password'             => Hash::make($app->phone),
                'nik'                  => $app->nik,
                'birth_date'           => $app->birth_date,
                'address'              => $app->address,
                'city'                 => $app->city,
                'bank_name'            => $app->bank_name,
                'bank_account_number'  => $app->bank_number,
                'bank_account_holder'  => $app->bank_account_name,
                'bank_branch'          => $app->bank_branch,
                'npwp_number'          => $app->tax_number,
                'npwp_holder_name'     => $app->npwp_holder_name,
                'ig_account'           => $app->ig_account,
                'initiator_name'       => $app->referrer?->center_name ?? $app->referrer?->name,
                'role'                 => 'starcenter',
                'status'               => 'active',
                'referrer_id'          => $app->referrer_id,
                'email_verified_at'    => now(),
            ]);

            if ($app->referrer_id) {
                StarcenterNetwork::create([
                    'upline_id'   => $app->referrer_id,
                    'downline_id' => $user->id,
                    'depth'       => 1,
                ]);

                $uplines = StarcenterNetwork::where('downline_id', $app->referrer_id)->get();
                foreach ($uplines as $upline) {
                    if ($upline->depth < 7) {
                        StarcenterNetwork::create([
                            'upline_id'   => $upline->upline_id,
                            'downline_id' => $user->id,
                            'depth'       => $upline->depth + 1,
                        ]);
                    }
                }
            }

            $app->update([
                'status'  => 'approved',
                'user_id' => $user->id,
            ]);
        });

        return response()->json(['message' => 'Aplikasi disetujui. Akun starcenter telah dibuat.']);
    }

    public function reject(Request $request, int $id)
    {
        $app = StarcenterApplication::findOrFail($id);

        if ($app->status !== 'pending') {
            return response()->json(['message' => 'Aplikasi sudah diproses sebelumnya.'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $app->update([
            'status'        => 'rejected',
            'reject_reason' => $validated['reason'],
        ]);

        return response()->json(['message' => 'Aplikasi ditolak.']);
    }
}
