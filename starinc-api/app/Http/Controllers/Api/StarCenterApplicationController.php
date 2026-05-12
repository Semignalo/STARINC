<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StarcenterApplication;
use App\Models\StarcenterNetwork;
use App\Models\Tier;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class StarCenterApplicationController extends Controller
{
    /**
     * Public: Check if a center name is already taken.
     */
    public function checkCenterName(Request $request)
    {
        $name = $request->query('name', '');
        $taken = StarcenterApplication::where('center_name', $name)->exists();
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
            'birth_date'        => 'required|date',
            'birth_place'       => 'required|string|max:100',
            'gender'            => 'required|in:L,P',
            'religion'          => 'required|string|max:50',
            'marital_status'    => 'required|string|max:50',
            'occupation'        => 'required|string|max:100',
            'nik'               => 'nullable|string|size:16',
            'id_card'           => 'required|file|image|max:5120',
            'email'             => 'required|email|unique:starcenter_applications,email|unique:users,email',
            'phone'             => 'required|string|max:20',
            'shop_link'         => 'nullable|url|max:255',
            'bank_name'         => 'required|string|max:100',
            'bank_number'       => 'required|string|max:50',
            'bank_account_name' => 'required|string|max:100',
            'bank_book'         => 'required|file|image|max:5120',
            'tax_number'        => 'nullable|string|max:20',
            'tax_doc'           => 'nullable|file|image|max:5120',
            'referral_code'     => 'nullable|string|size:8|exists:users,referral_code',
        ]);

        // Resolve referrer
        $referrerId = null;
        if (!empty($validated['referral_code'])) {
            $referrerId = User::where('referral_code', strtoupper($validated['referral_code']))->value('id');
        }

        // Store private files
        $idCardPath   = $request->file('id_card')->store('applications/id_cards', 'local');
        $bankBookPath = $request->file('bank_book')->store('applications/bank_books', 'local');
        $taxDocPath   = null;
        if ($request->hasFile('tax_doc')) {
            $taxDocPath = $request->file('tax_doc')->store('applications/tax_docs', 'local');
        }

        $application = StarcenterApplication::create([
            'center_name'       => $validated['center_name'],
            'full_name'         => $validated['full_name'],
            'birth_date'        => $validated['birth_date'],
            'birth_place'       => $validated['birth_place'],
            'gender'            => $validated['gender'],
            'religion'          => $validated['religion'],
            'marital_status'    => $validated['marital_status'],
            'occupation'        => $validated['occupation'],
            'nik'               => $validated['nik'] ?? null,
            'id_card_path'      => $idCardPath,
            'email'             => $validated['email'],
            'phone'             => $validated['phone'],
            'shop_link'         => $validated['shop_link'] ?? null,
            'bank_name'         => $validated['bank_name'],
            'bank_number'       => $validated['bank_number'],
            'bank_account_name' => $validated['bank_account_name'],
            'bank_book_path'    => $bankBookPath,
            'tax_number'        => $validated['tax_number'] ?? null,
            'tax_doc_path'      => $taxDocPath,
            'referral_code'     => $validated['referral_code'] ?? null,
            'referrer_id'       => $referrerId,
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

    /**
     * Admin: List all applications with optional status filter.
     */
    public function index(Request $request)
    {
        $query = StarcenterApplication::with('referrer:id,name')
            ->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(30));
    }

    /**
     * Admin: Show one application.
     */
    public function show(int $id)
    {
        $app = StarcenterApplication::with(['referrer:id,name,email', 'user:id,name,email,role'])->findOrFail($id);
        return response()->json($app);
    }

    /**
     * Admin: Serve a private application document.
     */
    public function serveDocument(int $id, Request $request)
    {
        $app = StarcenterApplication::findOrFail($id);

        $field = $request->query('field'); // id_card | bank_book | tax_doc
        $path = match($field) {
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
     */
    public function approve(int $id)
    {
        $app = StarcenterApplication::findOrFail($id);

        if ($app->status !== 'pending') {
            return response()->json(['message' => 'Aplikasi sudah diproses sebelumnya.'], 422);
        }

        $diamondTier = Tier::where('slug', 'diamond')->first();

        DB::transaction(function () use ($app, $diamondTier) {
            $password = Str::random(12);

            $user = User::create([
                'name'              => $app->full_name,
                'email'             => $app->email,
                'phone'             => $app->phone,
                'password'          => Hash::make($password),
                'role'              => 'starcenter',
                'tier_id'           => $diamondTier?->id,
                'referrer_id'       => $app->referrer_id,
                'referral_code'     => strtoupper(Str::random(8)),
                'email_verified_at' => now(), // Admin-approved accounts are auto-verified
            ]);

            // Populate closure table
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

    /**
     * Admin: Reject application with reason.
     */
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
