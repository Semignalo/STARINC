import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { ArrowLeft, Lock, Shield, Users, Copy, Check, RefreshCw, ChevronRight, ChevronDown, GitBranch, List, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';
import Swal from 'sweetalert2';

// ─── Network tree helpers ─────────────────────────────────────────────────────

function countDescendants(node) {
    if (!node.children?.length) return 0;
    return node.children.reduce((sum, child) => sum + 1 + countDescendants(child), 0);
}

function buildNetworkTree(rootUser, downlines) {
    const map = {};
    map[rootUser.id] = { ...rootUser, children: [], depth: 0 };
    downlines.forEach(d => { map[d.id] = { ...d, children: [] }; });
    downlines.forEach(d => {
        const parentId = d.referrer_id;
        if (parentId && map[parentId]) {
            map[parentId].children.push(map[d.id]);
        } else {
            map[rootUser.id].children.push(map[d.id]);
        }
    });
    return map[rootUser.id];
}

const ROLE_CARD = {
    admin:      'border-red-200 bg-red-50',
    starcenter: 'border-purple-200 bg-purple-50',
};
const ROLE_BADGE = {
    admin:      'bg-red-100 text-red-700',
    starcenter: 'bg-purple-100 text-purple-700',
};
const ROLE_LABEL = { admin: 'Admin', starcenter: 'Starcenter' };

function NetworkTreeNode({ node, isRoot = false }) {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(!isRoot && node.depth >= 2);
    const hasChildren = node.children?.length > 0;
    const totalDesc = hasChildren ? countDescendants(node) : 0;

    return (
        <div>
            <div className="flex items-start gap-2">
                <button
                    onClick={() => hasChildren && setCollapsed(c => !c)}
                    className={`mt-3 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition
                        ${hasChildren ? 'bg-gray-200 hover:bg-gray-300 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                >
                    {collapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
                </button>
                <div
                    className={`flex-1 border rounded-xl px-3 py-2.5 transition
                        ${isRoot
                            ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                            : `${ROLE_CARD[node.role] || 'border-gray-200 bg-gray-50'} cursor-pointer hover:shadow-sm`
                        }`}
                    onClick={() => !isRoot && navigate(`/admin/users/${node.id}`)}
                >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="font-medium text-sm text-gray-900 truncate">{node.name}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                ${isRoot ? 'bg-emerald-100 text-emerald-700' : (ROLE_BADGE[node.role] || 'bg-gray-100 text-gray-600')}`}>
                                {isRoot ? (ROLE_LABEL[node.role] || node.role) + ' (root)' : (ROLE_LABEL[node.role] || node.role)}
                            </span>
                            {!isRoot && <ExternalLink size={13} className="text-gray-400" />}
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{node.email}</p>
                    {hasChildren && (
                        <p className="text-xs text-gray-400 mt-1">
                            {node.children.length} langsung · {totalDesc} total downline
                        </p>
                    )}
                </div>
            </div>
            {!collapsed && hasChildren && (
                <div className="ml-[10px] pl-5 mt-1.5 space-y-1.5 border-l-2 border-dashed border-gray-200">
                    {node.children.map(child => (
                        <NetworkTreeNode key={child.id} node={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [network, setNetwork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newRole, setNewRole] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [networkView, setNetworkView] = useState('tree');

    useEffect(() => {
        fetchUserDetail();
    }, [id]);

    const fetchUserDetail = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getUserDetail(id);
            setUser(data.user);
            setNetwork(data.network);
            setNewRole(data.user.role);
        } catch (error) {
            console.error("Error fetching user:", error);
            Swal.fire('Error', 'Gagal memuat data user.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) { Swal.fire('Error', 'Password harus diisi.', 'error'); return; }
        if (newPassword.length < 8) { Swal.fire('Error', 'Password minimal 8 karakter.', 'error'); return; }
        if (newPassword !== confirmPassword) { Swal.fire('Error', 'Password tidak cocok.', 'error'); return; }

        try {
            setSubmitting(true);
            await adminApi.updateUserPassword(id, newPassword, confirmPassword);
            setNewPassword(''); setConfirmPassword('');
            Swal.fire('Berhasil', 'Password user berhasil diubah.', 'success');
        } catch {
            Swal.fire('Error', 'Gagal mengubah password.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateRole = async () => {
        if (newRole === user.role) { Swal.fire('Info', 'Role tidak berubah.', 'info'); return; }
        try {
            setSubmitting(true);
            const response = await adminApi.updateUserRole(id, newRole);
            setUser(response.user);
            Swal.fire('Berhasil', `Role berhasil diubah menjadi ${newRole}.`, 'success');
        } catch {
            Swal.fire('Error', 'Gagal mengubah role.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async () => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        const confirmed = await Swal.fire({
            title: newStatus === 'inactive' ? 'Nonaktifkan Akun?' : 'Aktifkan Akun?',
            text: newStatus === 'inactive'
                ? 'User tidak bisa checkout sampai diaktifkan kembali.'
                : 'User akan bisa melakukan pembelian kembali.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'inactive' ? '#dc2626' : '#16a34a',
            confirmButtonText: newStatus === 'inactive' ? 'Nonaktifkan' : 'Aktifkan',
            cancelButtonText: 'Batal',
        });
        if (!confirmed.isConfirmed) return;

        try {
            setSubmitting(true);
            const response = await adminApi.updateUserStatus(id, newStatus);
            setUser(response.user);
            Swal.fire('Berhasil', `Status akun diubah menjadi ${newStatus}.`, 'success');
        } catch {
            Swal.fire('Error', 'Gagal mengubah status akun.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        Swal.fire('Berhasil', 'Teks disalin ke clipboard.', 'success');
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!user) return <div className="p-6 text-center text-red-600">User tidak ditemukan.</div>;

    const roleDisplay = {
        starcenter: { label: 'Starcenter (Distributor)', color: 'bg-purple-100 text-purple-800' },
        admin:      { label: 'Admin', color: 'bg-red-100 text-red-800' }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">{user.name || user.email}</h1>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleDisplay[user.role]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {roleDisplay[user.role]?.label || user.role}
                </span>
                {user.status === 'inactive' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Tidak Aktif</span>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                    { key: 'profile', label: 'Profil' },
                    { key: 'access', label: 'Akses' },
                    { key: 'password', label: 'Password' },
                    { key: 'network', label: network ? `Jaringan (${network.total_downlines})` : 'Jaringan' },
                    { key: 'orders', label: 'Pesanan' },
                    { key: 'commissions', label: 'Komisi' },
                ].map(({ key, label }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                            activeTab === key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Nama</p>
                            <p className="text-sm font-medium text-gray-900">{user.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Email</p>
                            <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Role</p>
                            <p className="text-sm font-medium text-gray-900">{roleDisplay[user.role]?.label || user.role}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Status Akun</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${user.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {user.status === 'inactive' ? 'Tidak Aktif' : 'Aktif'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Total Spending</p>
                            <p className="text-sm font-medium text-gray-900">Rp. {Number(user.cumulative_spending || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Referral Code</p>
                            <div className="flex items-center gap-2">
                                <code className="text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded">{user.referral_code || '-'}</code>
                                {user.referral_code && (
                                    <button onClick={() => copyToClipboard(user.referral_code)}
                                        className="p-1 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 rounded transition">
                                        <Copy size={16} className="text-gray-400" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {user.referrer && (
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Upline / Referrer</p>
                            <div className="bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm font-medium text-gray-900">{user.referrer.name}</p>
                                <p className="text-xs text-gray-500">{user.referrer.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Access Tab */}
            {activeTab === 'access' && (
                <div className="space-y-6">
                    {/* Status Toggle */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            {user.status === 'active' ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} className="text-red-500" />}
                            Status Akun
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Status saat ini: <span className={`font-bold ${user.status === 'inactive' ? 'text-red-600' : 'text-green-600'}`}>
                                        {user.status === 'inactive' ? 'Tidak Aktif' : 'Aktif'}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {user.status === 'inactive'
                                        ? 'User tidak bisa checkout. Aktifkan untuk memulihkan akses.'
                                        : 'User dapat melakukan pembelian. Nonaktifkan jika diperlukan.'}
                                </p>
                            </div>
                            <button
                                onClick={handleToggleStatus}
                                disabled={submitting}
                                className={`px-5 py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 flex items-center gap-2
                                    ${user.status === 'active'
                                        ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                                        : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'}`}
                            >
                                {submitting ? <RefreshCw size={14} className="animate-spin" /> : null}
                                {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                            </button>
                        </div>
                    </div>

                    {/* Role Change */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Shield size={20} /> Ubah Role
                        </h3>
                        <div className="space-y-3">
                            <select value={newRole} onChange={(e) => setNewRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                <option value="starcenter">Starcenter (Distributor)</option>
                                <option value="admin">Admin</option>
                            </select>
                            <button onClick={handleUpdateRole} disabled={submitting || newRole === user.role}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                                {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                                Simpan Role
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-md">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock size={20} /> Reset Password
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password Baru</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Konfirmasi Password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Ulangi password"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                        </div>
                        <button onClick={handleUpdatePassword} disabled={submitting || !newPassword || !confirmPassword}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition">
                            {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Lock size={16} />}
                            Reset Password
                        </button>
                    </div>
                </div>
            )}

            {/* Network Tab */}
            {activeTab === 'network' && network && (() => {
                const levelCounts = {};
                network.downlines.forEach(d => { levelCounts[d.depth] = (levelCounts[d.depth] || 0) + 1; });
                const treeRoot = network.downlines.length > 0 ? buildNetworkTree(user, network.downlines) : null;

                return (
                    <div className="space-y-5">
                        {network.downlines.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                    <p className="text-xs text-gray-500 font-medium">Total Downline</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{network.total_downlines}</p>
                                </div>
                                {Object.entries(levelCounts).slice(0, 3).map(([lvl, cnt]) => (
                                    <div key={lvl} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                        <p className="text-xs text-gray-500 font-medium">Level {lvl}</p>
                                        <p className="text-2xl font-bold text-purple-700 mt-1">{cnt}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {network.uplines.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Upline Chain</h3>
                                <div className="flex flex-col gap-1.5">
                                    {network.uplines.map((upline, i) => (
                                        <div key={upline.id} className="flex items-center gap-3">
                                            {i > 0 && <div className="w-4 h-px bg-gray-300 ml-4" />}
                                            <div
                                                className="flex-1 flex items-center justify-between gap-2 p-2.5 rounded-lg border border-blue-200 bg-blue-50 cursor-pointer hover:shadow-sm transition"
                                                onClick={() => navigate(`/admin/users/${upline.id}`)}>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{upline.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{upline.email}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[upline.role] || 'bg-gray-100 text-gray-600'}`}>
                                                        {ROLE_LABEL[upline.role] || upline.role}
                                                    </span>
                                                    <span className="text-xs text-gray-400">L{upline.depth}</span>
                                                    <ExternalLink size={12} className="text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {network.downlines.length > 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                        <Users size={18} /> Jaringan Downline
                                        <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                            {network.total_downlines}
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                        <button onClick={() => setNetworkView('list')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${networkView === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                                            <List size={13} /> List
                                        </button>
                                        <button onClick={() => setNetworkView('tree')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${networkView === 'tree' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                                            <GitBranch size={13} /> Pohon
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5">
                                    {networkView === 'list' && (
                                        <div className="space-y-2">
                                            {network.downlines.map(downline => (
                                                <div key={downline.id}
                                                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50 hover:shadow-sm cursor-pointer transition"
                                                    onClick={() => navigate(`/admin/users/${downline.id}`)}>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">{downline.name}</p>
                                                        <p className="text-xs text-gray-500 truncate">{downline.email}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[downline.role] || 'bg-gray-100 text-gray-600'}`}>
                                                            {ROLE_LABEL[downline.role] || downline.role}
                                                        </span>
                                                        <span className="text-xs font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                                                            L{downline.depth}
                                                        </span>
                                                        <ExternalLink size={13} className="text-gray-400" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {networkView === 'tree' && treeRoot && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-400 mb-3">Klik node untuk buka detail · Klik ▶ untuk expand/collapse</p>
                                            <NetworkTreeNode node={treeRoot} isRoot />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
                                <GitBranch size={32} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Belum ada downline dalam jaringan ini.</p>
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Orders Tab */}
            {activeTab === 'orders' && user.orders && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Order</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Tanggal</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Total</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {user.orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{order.order_number}</td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">Rp. {Number(order.total).toLocaleString('id-ID')}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">{order.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {user.orders.length === 0 && (
                        <div className="p-6 text-center text-gray-500">User belum memiliki order.</div>
                    )}
                </div>
            )}

            {/* Commissions Tab */}
            {activeTab === 'commissions' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <p className="text-gray-500 text-sm">Commission history akan ditampilkan di sini.</p>
                </div>
            )}
        </div>
    );
}
