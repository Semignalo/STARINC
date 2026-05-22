import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { ArrowLeft, Lock, Shield, Users, Copy, Check, RefreshCw, ChevronRight, ChevronDown, GitBranch, List, ExternalLink, ToggleLeft, ToggleRight, Pencil, X } from 'lucide-react';
import Swal from 'sweetalert2';
import Button from '../../components/admin/ui/Button';
import Card from '../../components/admin/ui/Card';
import Input, { Textarea, Select } from '../../components/admin/ui/Input';
import Badge from '../../components/admin/ui/Badge';
import { cn } from '../../lib/utils';

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
                    className={`mt-2.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors
                        ${hasChildren ? 'bg-gray-100 hover:bg-gray-200 text-gray-500 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
                >
                    {collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                <div
                    className={`flex-1 border rounded-md px-3 py-2 transition-colors
                        ${isRoot
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white cursor-pointer hover:border-gray-300 hover:bg-gray-50/60'
                        }`}
                    onClick={() => !isRoot && navigate(`/admin/users/${node.id}`)}
                >
                    <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className={`font-medium text-sm truncate ${isRoot ? 'text-white' : 'text-gray-900'}`}>{node.name}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded ring-1 ring-inset
                                ${isRoot
                                    ? 'bg-white/10 text-white ring-white/20'
                                    : node.role === 'admin'
                                        ? 'bg-red-50 text-red-700 ring-red-200'
                                        : 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent-hover)] ring-[var(--admin-accent)]/20'
                                }`}>
                                {ROLE_LABEL[node.role] || node.role}{isRoot ? ' · root' : ''}
                            </span>
                            {!isRoot && <ExternalLink size={11} className="text-gray-300" />}
                        </div>
                    </div>
                    <p className={`text-[11px] mt-0.5 truncate ${isRoot ? 'text-white/60' : 'text-gray-500'}`}>{node.email}</p>
                    {hasChildren && (
                        <p className={`text-[11px] mt-1 ${isRoot ? 'text-white/50' : 'text-gray-400'}`}>
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
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({});

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
            setProfileForm({
                name: data.user.name || '',
                email: data.user.email || '',
                phone: data.user.phone || '',
                address: data.user.address || '',
                city: data.user.city || '',
                postal_code: data.user.postal_code || '',
            });
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

    const handleUpdateProfile = async () => {
        try {
            setSubmitting(true);
            const response = await adminApi.updateUserProfile(id, profileForm);
            setUser(response.user);
            setEditingProfile(false);
            Swal.fire('Berhasil', 'Profil user berhasil diperbarui.', 'success');
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal memperbarui profil.';
            Swal.fire('Error', msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;
    if (!user) return <div className="p-6 text-center text-red-600">User tidak ditemukan.</div>;

    const roleDisplay = {
        starcenter: { label: 'Starcenter (Distributor)', color: 'bg-purple-100 text-purple-800' },
        admin:      { label: 'Admin', color: 'bg-red-100 text-red-800' }
    };

    return (
        <div className="max-w-6xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    aria-label="Kembali"
                >
                    <ArrowLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900 truncate">{user.name || user.email}</h1>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Badge color={user.role === 'admin' ? 'danger' : 'accent'}>
                    {roleDisplay[user.role]?.label || user.role}
                </Badge>
                {user.status === 'inactive' && <Badge color="gray">Tidak Aktif</Badge>}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-5 border-b border-gray-200">
                {[
                    { key: 'profile', label: 'Profil' },
                    { key: 'access', label: 'Akses' },
                    { key: 'password', label: 'Password' },
                    { key: 'network', label: network ? `Jaringan (${network.total_downlines})` : 'Jaringan' },
                    { key: 'orders', label: 'Pesanan' },
                    { key: 'commissions', label: 'Komisi' },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={cn(
                            'px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px',
                            activeTab === key
                                ? 'border-[var(--admin-accent)] text-gray-900'
                                : 'border-transparent text-gray-500 hover:text-gray-900',
                        )}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <Card className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Data Profil</h3>
                        {!editingProfile ? (
                            <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditingProfile(true)}>
                                Edit
                            </Button>
                        ) : (
                            <Button variant="ghost" size="sm" icon={X} onClick={() => setEditingProfile(false)}>
                                Batal
                            </Button>
                        )}
                    </div>

                    {!editingProfile ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Nama</p>
                                <p className="text-sm font-medium text-gray-900">{user.name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-sm font-medium text-gray-900">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">No. Telepon</p>
                                <p className="text-sm font-medium text-gray-900">{user.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Alamat</p>
                                <p className="text-sm font-medium text-gray-900">{user.address || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Kota</p>
                                <p className="text-sm font-medium text-gray-900">{user.city || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Kode Pos</p>
                                <p className="text-sm font-medium text-gray-900">{user.postal_code || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Role</p>
                                <p className="text-sm font-medium text-gray-900">{roleDisplay[user.role]?.label || user.role}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Status Akun</p>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${user.status === 'inactive' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                    {user.status === 'inactive' ? 'Tidak Aktif' : 'Aktif'}
                                </span>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Total Spending</p>
                                <p className="text-sm font-medium text-gray-900">Rp. {Number(user.cumulative_spending || 0).toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1">Referral Code</p>
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
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    { key: 'name', label: 'Nama Lengkap' },
                                    { key: 'email', label: 'Email', type: 'email' },
                                    { key: 'phone', label: 'No. Telepon' },
                                    { key: 'city', label: 'Kota' },
                                    { key: 'postal_code', label: 'Kode Pos' },
                                ].map(({ key, label, type = 'text' }) => (
                                    <Input
                                        key={key}
                                        label={label}
                                        type={type}
                                        value={profileForm[key] || ''}
                                        onChange={(e) => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                                    />
                                ))}
                                <div className="md:col-span-2">
                                    <Textarea
                                        label="Alamat"
                                        value={profileForm.address || ''}
                                        onChange={(e) => setProfileForm(f => ({ ...f, address: e.target.value }))}
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <Button variant="primary" size="md" icon={Check} loading={submitting} onClick={handleUpdateProfile}>
                                Simpan Perubahan
                            </Button>
                        </div>
                    )}

                    {user.referrer && (
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-2">Upline / Referrer</p>
                            <div className="bg-gray-50/60 border border-gray-200 p-3 rounded-md">
                                <p className="text-sm font-medium text-gray-900">{user.referrer.name}</p>
                                <p className="text-xs text-gray-500">{user.referrer.email}</p>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Access Tab */}
            {activeTab === 'access' && (
                <div className="space-y-4 max-w-2xl">
                    {/* Status Toggle */}
                    <Card>
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                    {user.status === 'active'
                                        ? <ToggleRight size={14} className="text-emerald-600" />
                                        : <ToggleLeft size={14} className="text-gray-400" />}
                                    Status Akun
                                </h3>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    {user.status === 'inactive'
                                        ? 'User tidak bisa checkout. Aktifkan untuk memulihkan akses.'
                                        : 'User dapat melakukan pembelian. Nonaktifkan jika diperlukan.'}
                                </p>
                            </div>
                            <Button
                                variant={user.status === 'active' ? 'danger' : 'primary'}
                                size="sm"
                                onClick={handleToggleStatus}
                                loading={submitting}
                            >
                                {user.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                            </Button>
                        </div>
                    </Card>

                    {/* Role Change */}
                    <Card>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Shield size={14} className="text-gray-400" /> Ubah Role
                        </h3>
                        <div className="space-y-3">
                            <Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                                <option value="starcenter">Starcenter (Distributor)</option>
                                <option value="admin">Admin</option>
                            </Select>
                            <Button
                                variant="primary"
                                icon={Check}
                                loading={submitting}
                                disabled={newRole === user.role}
                                onClick={handleUpdateRole}
                                fullWidth
                            >
                                Simpan Role
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
                <Card className="max-w-md">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Lock size={14} className="text-gray-400" /> Reset Password
                    </h3>
                    <div className="space-y-3">
                        <Input
                            label="Password Baru"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimal 8 karakter"
                        />
                        <Input
                            label="Konfirmasi Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Ulangi password"
                        />
                        <Button
                            variant="danger"
                            icon={Lock}
                            loading={submitting}
                            disabled={!newPassword || !confirmPassword}
                            onClick={handleUpdatePassword}
                            fullWidth
                        >
                            Reset Password
                        </Button>
                    </div>
                </Card>
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
