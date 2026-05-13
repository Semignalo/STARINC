import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import {
    Edit2, Search, Shield, Crown, Eye, Trash2,
    List, GitBranch, ChevronRight, ChevronDown, ExternalLink,
} from 'lucide-react';
import Swal from 'sweetalert2';

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

    const handleEditRole = async (user) => {
        const { value: newRole } = await Swal.fire({
            title: `Ubah Tipe User untuk ${user.name || user.email}`,
            input: 'select',
            inputOptions: {
                starcenter: 'Official Starinc Distributor (Starcenter)',
                admin:      'Admin',
            },
            inputPlaceholder: 'Pilih Tipe User',
            inputValue: user.role || 'starcenter',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
        });

        if (newRole && newRole !== user.role) {
            try {
                await adminApi.updateUserRole(user.id, newRole);
                setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                // invalidate network cache so it refreshes next time
                setNetworkData(null);
                Swal.fire({ title: 'Berhasil!', text: `Tipe diubah menjadi ${newRole.toUpperCase()}.`, icon: 'success', timer: 1500, showConfirmButton: false });
            } catch (error) {
                console.error('Error updating user role:', error);
                Swal.fire('Error', 'Gagal mengubah tipe user.', 'error');
            }
        }
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
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200 flex items-center w-max gap-1">
                <Shield size={14} /> Admin
            </span>
        );
        return (
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200 flex items-center w-max gap-1">
                <Crown size={14} /> Distributor
            </span>
        );
    };

    const getStatusBadge = (status) => status === 'inactive'
        ? <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-600">Inactive</span>
        : <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">Aktif</span>;

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const treeRoots = networkData ? buildTree(networkData.users) : [];
    const counts = networkData?.counts;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
                    <p className="text-sm text-gray-500">Kelola akun dan role distributor</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {/* View toggle */}
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => handleSwitchView('table')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition
                                ${viewMode === 'table' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={13} /> Table
                        </button>
                        <button
                            onClick={() => handleSwitchView('network')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition
                                ${viewMode === 'network' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <GitBranch size={13} /> Jaringan
                        </button>
                    </div>

                    {/* Search — only in table mode */}
                    {viewMode === 'table' && (
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari Nama / Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── TABLE VIEW ── */}
            {viewMode === 'table' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-500">Memuat data pengguna...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex items-center justify-center h-64 text-gray-500">Tidak ada pengguna ditemukan.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100 text-sm">
                                    <tr>
                                        <th className="p-4">Nama Lengkap</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Tanggal Daftar</th>
                                        <th className="p-4">Tipe User & Status</th>
                                        <th className="p-4">Total Spending</th>
                                        <th className="p-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredUsers.map((user) => {
                                        const dateStr = user.created_at
                                            ? new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })
                                            : '-';
                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 text-sm font-medium text-gray-900">{user.name || '-'}</td>
                                                <td className="p-4 text-sm text-gray-600">{user.email}</td>
                                                <td className="p-4 text-sm text-gray-500">{dateStr}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        {getRoleBadge(user)}
                                                        {user.role !== 'admin' && getStatusBadge(user.status)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm font-bold text-gray-900">
                                                    Rp {Number(user.cumulative_spending || user.cumulativeSpending || 0).toLocaleString('id-ID')}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/users/${user.id}`)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Detail User"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditRole(user)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Ubah Role"
                                                        >
                                                            <Edit2 size={18} />
                                                        </button>
                                                        {user.role !== 'admin' && (
                                                            <button
                                                                onClick={() => handleDeleteUser(user)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Hapus User"
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
