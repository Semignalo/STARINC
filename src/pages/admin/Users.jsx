import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import {
    Search, Shield, Crown, Eye, Trash2,
    List, GitBranch, ChevronRight, ChevronDown, ExternalLink,
} from 'lucide-react';
import Swal from 'sweetalert2';
import Input from '../../components/admin/ui/Input';

// ── Network tree helpers ──────────────────────────────────────────────────────

const ROLE_CFG = {
    admin:      { card: 'border-red-200 bg-red-50',       badge: 'bg-red-100 text-red-700',       avatar: 'bg-red-500',    label: 'Admin' },
    starcenter: { card: 'border-purple-200 bg-purple-50', badge: 'bg-purple-100 text-purple-700', avatar: 'bg-purple-500', label: 'Starcenter' },
};

function countDesc(node) {
    if (!node.children?.length) return 0;
    return node.children.reduce((s, c) => s + 1 + countDesc(c), 0);
}

function buildTree(users) {
    const map = {};
    users.forEach(u => { map[u.id] = { ...u, children: [] }; });
    const roots = [];
    users.forEach(u => {
        if (u.referrer_id && map[u.referrer_id]) {
            map[u.referrer_id].children.push(map[u.id]);
        } else {
            roots.push(map[u.id]);
        }
    });
    // admins first in the root list
    roots.sort((a, b) => {
        const order = { admin: 0, starcenter: 1 };
        return (order[a.role] ?? 3) - (order[b.role] ?? 3);
    });
    return roots;
}

function NetworkNode({ node, depth = 0 }) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(depth >= 2);
    const hasChildren = node.children?.length > 0;
    const cfg = ROLE_CFG[node.role] || ROLE_CFG.starcenter;
    const total = hasChildren ? countDesc(node) : 0;
    const initials = (node.name || node.email || '?').charAt(0).toUpperCase();

    return (
        <div>
            <div className="flex items-start gap-2">
                {/* Expand / collapse */}
                <button
                    onClick={() => hasChildren && setCollapsed(c => !c)}
                    className={`mt-[18px] w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition
                        ${hasChildren ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                    title={collapsed ? 'Tampilkan downline' : 'Sembunyikan downline'}
                >
                    {collapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                </button>

                {/* Node card */}
                <div
                    className={`flex-1 border rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:shadow-sm transition ${cfg.card}`}
                    onClick={() => navigate(`/admin/users/${node.id}`)}
                >
                    {/* Avatar */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${cfg.avatar}`}>
                        {initials}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 truncate">{node.name || '-'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${cfg.badge}`}>
                                {cfg.label}
                            </span>
                            {node.status === 'inactive' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0 bg-red-100 text-red-600">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{node.email}</p>
                        {hasChildren && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                {node.children.length} langsung · {total} total downline
                            </p>
                        )}
                    </div>

                    <ExternalLink size={13} className="text-gray-400 flex-shrink-0" />
                </div>
            </div>

            {/* Children */}
            {!collapsed && hasChildren && (
                <div className="ml-[10px] pl-5 mt-1.5 space-y-1.5 border-l-2 border-dashed border-gray-200">
                    {node.children.map(child => (
                        <NetworkNode key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Users() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [networkData, setNetworkData] = useState(null); // { users, counts }
    const [networkLoading, setNetworkLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUsers();
            setUsers(data.data || data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNetworkView = async () => {
        if (networkData) return; // already cached
        try {
            setNetworkLoading(true);
            const data = await adminApi.getNetworkTree();
            setNetworkData(data);
        } catch (error) {
            console.error('Error fetching network:', error);
            Swal.fire('Error', 'Gagal memuat data jaringan.', 'error');
        } finally {
            setNetworkLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleSwitchView = (mode) => {
        setViewMode(mode);
        if (mode === 'network') loadNetworkView();
    };

    const handleDeleteUser = async (user) => {
        const { isConfirmed } = await Swal.fire({
            title: 'Hapus User?',
            html: `Akun <b>${user.name || user.email}</b> akan dihapus permanen beserta data komisi dan network-nya. Aksi ini tidak dapat dibatalkan.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
        });

        if (!isConfirmed) return;

        try {
            await adminApi.deleteUser(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            Swal.fire({ icon: 'success', title: 'User dihapus', showConfirmButton: false, timer: 1500 });
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menghapus user.';
            Swal.fire({ icon: 'error', title: 'Error', text: msg });
        }
    };

    const getRoleBadge = (user) => {
        if (user.role === 'admin') return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md ring-1 ring-inset bg-red-50 text-red-700 ring-red-200">
                <Shield size={11} /> Admin
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md ring-1 ring-inset bg-[var(--admin-accent-soft)] text-[var(--admin-accent-hover)] ring-[var(--admin-accent)]/20">
                <Crown size={11} /> Starcenter
            </span>
        );
    };

    const getStatusBadge = (status) => status === 'inactive'
        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md ring-1 ring-inset bg-gray-100 text-gray-600 ring-gray-200">Inactive</span>
        : <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>;

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const treeRoots = networkData ? buildTree(networkData.users) : [];
    const counts = networkData?.counts;

    return (
        <div className="max-w-7xl">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4 mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Pengguna</h1>
                    <p className="text-xs text-gray-500 mt-1">Kelola akun dan role distributor</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex border border-gray-200 rounded-[6px] p-0.5 bg-white">
                        <button
                            onClick={() => handleSwitchView('table')}
                            className={`inline-flex items-center gap-1 px-2 h-7 rounded text-xs font-medium transition-colors ${
                                viewMode === 'table' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <List size={12} /> Table
                        </button>
                        <button
                            onClick={() => handleSwitchView('network')}
                            className={`inline-flex items-center gap-1 px-2 h-7 rounded text-xs font-medium transition-colors ${
                                viewMode === 'network' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <GitBranch size={12} /> Jaringan
                        </button>
                    </div>

                    {viewMode === 'table' && (
                        <div className="w-64">
                            <Input
                                icon={Search}
                                type="text"
                                placeholder="Cari Nama / Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── TABLE VIEW ── */}
            {viewMode === 'table' && (
                <div className="bg-white border border-gray-200 rounded-[8px] overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-sm text-gray-400">Memuat data pengguna…</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-sm text-gray-400">Tidak ada pengguna.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50/60 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Nama</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Email</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Tanggal Daftar</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-left">Role / Status</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">Total Spending</th>
                                        <th className="px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-gray-500 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => {
                                        const dateStr = user.created_at
                                            ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
                                            : '—';
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                                                <td className="px-4 py-2.5 font-medium text-gray-900">{user.name || '—'}</td>
                                                <td className="px-4 py-2.5 text-gray-600">{user.email}</td>
                                                <td className="px-4 py-2.5 text-gray-500">{dateStr}</td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex gap-1.5 items-center flex-wrap">
                                                        {getRoleBadge(user)}
                                                        {user.role !== 'admin' && getStatusBadge(user.status)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-medium text-gray-900 tabular-nums">
                                                    Rp{Number(user.cumulative_spending || user.cumulativeSpending || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-2.5 text-right">
                                                    <div className="flex items-center justify-end gap-0.5">
                                                        <button
                                                            onClick={() => navigate(`/admin/users/${user.id}`)}
                                                            className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                                            title="Detail"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleDeleteUser(user)}
                                                                className="w-7 h-7 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── NETWORK VIEW ── */}
            {viewMode === 'network' && (
                <div className="space-y-5">
                    {/* Stats */}
                    {counts && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: 'Total Pengguna', value: counts.total,      color: 'text-gray-900' },
                                { label: 'Admin',          value: counts.admin,      color: 'text-red-600' },
                                { label: 'Starcenter',     value: counts.starcenter, color: 'text-purple-600' },
                            ].map(({ label, value, color }) => (
                                <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                                    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tree */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-900 flex items-center gap-2">
                                <GitBranch size={18} className="text-purple-600" />
                                Pohon Jaringan
                            </h2>
                            <p className="text-xs text-gray-400">
                                Klik node untuk detail · ▶ expand/collapse · Level 3+ otomatis ditutup
                            </p>
                        </div>

                        <div className="p-5">
                            {networkLoading ? (
                                <div className="flex items-center justify-center h-64 text-gray-500">
                                    Memuat jaringan...
                                </div>
                            ) : treeRoots.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                    <GitBranch size={36} className="mb-2 opacity-30" />
                                    <p className="text-sm">Tidak ada data jaringan.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {treeRoots.map(root => (
                                        <NetworkNode key={root.id} node={root} depth={0} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
