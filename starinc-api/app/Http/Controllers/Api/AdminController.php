<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Order;
use App\Models\User;
use App\Models\Tier;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Dashboard statistics.
     */
    public function dashboard()
    {
        // 1. Basic Cards
        $totalRevenue = Order::where('status', 'completed')->sum('total');
        $activeOrders = Order::whereIn('status', ['pending_payment', 'processing', 'shipped'])->count();
        $totalCustomers = User::where('role', '!=', 'admin')->count();
        $pendingPayments = Order::where('status', 'pending_payment')
            ->whereHas('paymentProof', fn($q) => $q->where('status', 'pending'))
            ->count();

        // 2. Charts: Revenue & Orders per Month (Last 12 months)
        // Database-agnostic: works with SQLite (tests) and MySQL (production)
        $driver = DB::getDriverName();
        $dateFormat = match($driver) {
            'mysql' => DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
            'sqlite' => DB::raw("strftime('%Y-%m', created_at) as month"),
            default => DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
        };

        $monthlyStats = Order::where('status', 'completed')
            ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth())
            ->select(
                $dateFormat,
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(id) as orders')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // 3. Top 5 Products
        $topProducts = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->select(
                'order_items.product_id',
                'order_items.product_title',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.line_total) as total_revenue')
            )
            ->groupBy('order_items.product_id', 'order_items.product_title')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        // 4. Commission Stats
        $pendingCommissions = Commission::where('status', 'pending')->sum('commission_amount');
        $paidCommissions = Commission::where('status', 'paid')->sum('commission_amount');

        // 5. Recent Orders snippet
        $recentOrders = Order::with(['user', 'paymentProof'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($o) => [
                'id'           => $o->id,
                'order_number' => $o->order_number,
                'customer'     => $o->customer_info['name'] ?? '-',
                'total'        => (float) $o->total,
                'status'       => $o->status,
                'created_at'   => $o->created_at->toISOString(),
                'has_proof'    => $o->paymentProof !== null,
            ]);

        return response()->json([
            'total_revenue'      => (float) $totalRevenue,
            'active_orders'      => $activeOrders,
            'total_customers'    => $totalCustomers,
            'pending_payments'   => $pendingPayments,
            'monthly_stats'      => $monthlyStats,
            'top_products'       => $topProducts,
            'pending_commissions'=> (float) $pendingCommissions,
            'paid_commissions'   => (float) $paidCommissions,
            'recent_orders'      => $recentOrders,
        ]);
    }

    /**
     * Return all users (flat) with referrer_id for frontend tree building.
     */
    public function networkTree()
    {
        $users = User::select('id', 'name', 'email', 'role', 'referrer_id', 'referral_code')
            ->with('tier:id,slug')
            ->orderBy('created_at')
            ->get()
            ->map(fn($u) => [
                'id'            => $u->id,
                'name'          => $u->name,
                'email'         => $u->email,
                'role'          => $u->role,
                'referrer_id'   => $u->referrer_id,
                'referral_code' => $u->referral_code,
                'tier'          => $u->tier?->slug,
            ]);

        $counts = [
            'total'      => $users->count(),
            'admin'      => $users->where('role', 'admin')->count(),
            'starcenter' => $users->where('role', 'starcenter')->count(),
            'regular'    => $users->where('role', 'regular')->count(),
        ];

        return response()->json(['users' => $users->values(), 'counts' => $counts]);
    }

    /**
     * List all users (admin).
     */
    public function users(Request $request)
    {
        $query = User::with('tier');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json($users);
    }

    /**
     * Show detail of a user (admin).
     */
    public function showUser($id)
    {
        $user = User::with(['tier', 'referrer', 'orders' => function($q) {
            $q->orderBy('created_at', 'desc')->limit(20);
        }])->findOrFail($id);

        $network = $this->getUserNetwork($id);

        return response()->json([
            'user' => $user,
            'network' => $network,
        ]);
    }

    /**
     * Get user's downline/upline network tree.
     */
    private function getUserNetwork($userId)
    {
        // Get uplines (ancestors)
        $uplines = DB::table('starcenter_network')
            ->where('downline_id', $userId)
            ->where('depth', '>', 0)
            ->join('users', 'starcenter_network.upline_id', '=', 'users.id')
            ->select('users.id', 'users.name', 'users.email', 'users.role', 'starcenter_network.depth')
            ->orderBy('starcenter_network.depth')
            ->get();

        // Get downlines — include referrer_id and role so frontend can build the tree
        $downlines = DB::table('starcenter_network')
            ->where('starcenter_network.upline_id', $userId)
            ->join('users', 'starcenter_network.downline_id', '=', 'users.id')
            ->select(
                'users.id', 'users.name', 'users.email', 'users.role',
                'users.referrer_id', 'users.referral_code',
                'starcenter_network.depth'
            )
            ->orderBy('starcenter_network.depth')
            ->get();

        return [
            'uplines'         => $uplines,
            'downlines'       => $downlines,
            'total_downlines' => $downlines->count(),
        ];
    }

    /**
     * Manage user status (suspend/unsuspend) - currently we just have 'is_active'.
     * Wait, user table doesn't have is_active natively. I'll skip suspend for now unless requested.
     */

    /**
     * Update user role (admin).
     */
    public function updateUserRole(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|in:regular,starcenter,admin',
        ]);

        $newRole = $validated['role'];
        $user->role = $newRole;

        // Force diamond tier for starcenter
        if ($newRole === 'starcenter') {
            $diamondTier = Tier::where('slug', 'diamond')->first();
            $user->tier_id = $diamondTier?->id;
        }

        $user->save();

        return response()->json([
            'message' => "Role berhasil diubah menjadi {$newRole}.",
            'user'    => $user->load('tier'),
        ]);
    }

    /**
     * Update user password (admin action).
     */
    public function updateUserPassword(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password user berhasil diubah.',
            'user' => $user,
        ]);
    }

    /**
     * Update user tier (admin action).
     */
    public function updateUserTier(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'tier_id' => 'required|exists:tiers,id',
        ]);

        $tier = Tier::findOrFail($validated['tier_id']);
        $user->update(['tier_id' => $tier->id]);

        return response()->json([
            'message' => "Tier user berhasil diubah menjadi {$tier->name}.",
            'user' => $user->load('tier'),
        ]);
    }

    /**
     * Delete a user account (admin action).
     * Blocked for: admin accounts and self-deletion.
     */
    public function deleteUser(Request $request, int $id)
    {
        $target = User::findOrFail($id);

        if ($target->role === 'admin') {
            return response()->json(['message' => 'Akun admin tidak dapat dihapus.'], 403);
        }

        if ($request->user()->id === $id) {
            return response()->json(['message' => 'Tidak dapat menghapus akun sendiri.'], 403);
        }

        DB::transaction(function () use ($id) {
            // Detach from MLM network
            DB::table('starcenter_networks')->where('upline_id', $id)->orWhere('downline_id', $id)->delete();

            // Nullify referrer_id for direct referrals so they become root users
            User::where('referrer_id', $id)->update(['referrer_id' => null]);

            // Cancel pending commissions linked to this user
            Commission::where('user_id', $id)->orWhere('source_user_id', $id)->delete();

            User::destroy($id);
        });

        return response()->json(['message' => 'User berhasil dihapus.']);
    }

    /**
     * Get user commissions (admin view).
     */
    public function getUserCommissions(Request $request, int $id)
    {
        $user = User::findOrFail($id);

        $commissions = Commission::with(['order', 'sourceUser'])
            ->where('user_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($commissions);
    }

    /**
     * List all commissions (admin).
     */
    public function commissions(Request $request)
    {
        $query = Commission::with(['user', 'order', 'sourceUser']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $commissions = $query->orderBy('created_at', 'desc')->paginate(30);

        return response()->json($commissions);
    }

    /**
     * Mark commission as paid (admin).
     */
    public function payCommission(int $id)
    {
        $commission = Commission::findOrFail($id);

        if ($commission->status !== 'pending') {
            return response()->json(['message' => 'Komisi ini tidak dalam status pending.'], 422);
        }

        $commission->update(['status' => 'paid']);

        return response()->json(['message' => 'Komisi berhasil dibayarkan.']);
    }
    /**
     * Bulk Mark commissions as paid (admin).
     */
    public function bulkPayCommissions(Request $request)
    {
        $validated = $request->validate([
            'commission_ids' => 'required|array',
            'commission_ids.*' => 'integer|exists:commissions,id'
        ]);

        Commission::whereIn('id', $validated['commission_ids'])
            ->where('status', 'pending')
            ->update(['status' => 'paid']);

        return response()->json(['message' => count($validated['commission_ids']) . ' komisi berhasil dibayarkan.']);
    }

    /**
     * Export Orders to CSV (with filters)
     */
    public function exportOrders(Request $request)
    {
        $query = Order::with(['user'])->orderBy('created_at', 'desc');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $orders = $query->get();

        $mapped = $orders->map(function ($o) {
            return [
                'Order ID' => $o->order_number,
                'Customer Name' => $o->customer_info['name'] ?? '',
                'Customer Phone' => $o->customer_info['phone'] ?? '',
                'Subtotal' => $o->subtotal,
                'Discount' => $o->discount_amount,
                'Shipping' => $o->shipping_cost,
                'Total' => $o->total,
                'Status' => $o->status,
                'Date' => $o->created_at->format('Y-m-d H:i:s'),
            ];
        });
        return response()->json($mapped);
    }

    /**
     * Export Commissions to CSV (Basic)
     */
    public function exportCommissions(Request $request)
    {
        $commissions = Commission::with(['user', 'order'])->orderBy('created_at', 'desc')->get();
        $mapped = $commissions->map(function ($c) {
            return [
                'Commission ID' => $c->id,
                'Recipient' => $c->user->name ?? '',
                'Order Number' => $c->order->order_number ?? '',
                'Order Amount' => $c->order_amount,
                'Comm Rate %' => $c->commission_rate,
                'Comm Amount' => $c->commission_amount,
                'Status' => $c->status,
                'Date' => $c->created_at->format('Y-m-d H:i:s'),
            ];
        });
        return response()->json($mapped);
    }
}
