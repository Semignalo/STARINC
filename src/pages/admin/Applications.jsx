import { useState, useEffect, useCallback } from 'react';
import {
    ClipboardList, Eye, CheckCircle2, XCircle, Loader2,
    ChevronLeft, ChevronRight, User, Phone, Landmark,
    FileText, CreditCard, Users, X, AlertCircle, Building2
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import apiClient from '../../api/client';

const STATUS_TAB = [
    { key: '', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'rejected', label: 'Ditolak' },
];

const STATUS_BADGE = {
    pending:  'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};
const STATUS_LABEL = { pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' };

const GENDER_LABEL = { L: 'Laki-laki', P: 'Perempuan' };

/* ─── Document viewer ──────────────────────────────────────────────── */
function DocViewer({ appId, field, label }) {
    const [url, setUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const load = async () => {
        if (url) { window.open(url, '_blank'); return; }
        setLoading(true);
        try {
            const res = await apiClient.get(
                `/admin/starcenter-applications/${appId}/document`,
                { params: { field }, responseType: 'blob' }
            );
            const objectUrl = URL.createObjectURL(res.data);
            setUrl(objectUrl);
            window.open(objectUrl, '_blank');
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
            {error ? 'Gagal memuat' : label}
        </button>
    );
}

/* ─── Detail Modal ─────────────────────────────────────────────────── */
function DetailModal({ app, onClose, onApproved, onRejected }) {
    const [rejectMode, setRejectMode] = useState(false);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const handleApprove = async () => {
        if (!confirm(`Setujui pendaftaran "${app.center_name}"? Akun starcenter akan dibuat otomatis.`)) return;
        setLoading(true); setErr('');
        try {
            await adminApi.approveApplication(app.id);
            onApproved(app.id);
        } catch (e) {
            setErr(e.response?.data?.message || 'Gagal menyetujui.');
        } finally { setLoading(false); }
    };

    const handleReject = async () => {
        if (!reason.trim()) { setErr('Alasan penolakan wajib diisi.'); return; }
        setLoading(true); setErr('');
        try {
            await adminApi.rejectApplication(app.id, reason.trim());
            onRejected(app.id);
        } catch (e) {
            setErr(e.response?.data?.message || 'Gagal menolak.');
        } finally { setLoading(false); }
    };

    const Row = ({ label, value }) => (
        <div className="flex gap-2 py-2 border-b border-gray-50 last:border-0">
            <span className="w-36 shrink-0 text-xs text-gray-400 mt-0.5">{label}</span>
            <span className="text-sm text-gray-800 font-medium break-all">{value || '-'}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{app.center_name}</h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[app.status]}`}>
                            {STATUS_LABEL[app.status]}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">

                    {/* Layer 1: Identitas */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <User size={13} /> Identitas
                        </h3>
                        <div className="bg-gray-50 rounded-xl px-4 py-1">
                            <Row label="Nama Lengkap" value={app.full_name} />
                            {app.nik && <Row label="NIK" value={app.nik} />}
                            <Row label="TTL" value={app.birth_place && app.birth_date
                                ? `${app.birth_place}, ${new Date(app.birth_date).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}`
                                : app.birth_place || app.birth_date} />
                            <Row label="Jenis Kelamin" value={GENDER_LABEL[app.gender] || app.gender} />
                            <Row label="Agama" value={app.religion} />
                            <Row label="Status Pernikahan" value={app.marital_status} />
                            <Row label="Pekerjaan" value={app.occupation} />
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            <DocViewer appId={app.id} field="id_card" label="Lihat KTP" />
                        </div>
                    </section>

                    {/* Layer 2: Kontak */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Phone size={13} /> Kontak
                        </h3>
                        <div className="bg-gray-50 rounded-xl px-4 py-1">
                            <Row label="Email" value={app.email} />
                            <Row label="No. Telepon" value={app.phone} />
                            {app.shop_link && <Row label="Link Toko Online" value={app.shop_link} />}
                        </div>
                    </section>

                    {/* Layer 3: Bank */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Landmark size={13} /> Rekening Bank
                        </h3>
                        <div className="bg-gray-50 rounded-xl px-4 py-1">
                            <Row label="Bank" value={app.bank_name} />
                            <Row label="No. Rekening" value={app.bank_number} />
                            <Row label="Nama Pemilik" value={app.bank_account_name} />
                            {app.tax_number && <Row label="NPWP" value={app.tax_number} />}
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                            <DocViewer appId={app.id} field="bank_book" label="Lihat Buku Tabungan" />
                            {app.tax_doc_path && (
                                <DocViewer appId={app.id} field="tax_doc" label="Lihat NPWP" />
                            )}
                        </div>
                    </section>

                    {/* Layer 4: Referral */}
                    {(app.referral_code || app.referrer) && (
                        <section>
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Users size={13} /> Referral
                            </h3>
                            <div className="bg-gray-50 rounded-xl px-4 py-1">
                                {app.referral_code && <Row label="Kode Referral" value={app.referral_code} />}
                                {app.referrer && <Row label="Inisiator" value={`${app.referrer.name} (${app.referrer.email})`} />}
                            </div>
                        </section>
                    )}

                    {/* Reject reason (if already rejected) */}
                    {app.status === 'rejected' && app.reject_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                            <p className="font-semibold mb-1">Alasan Penolakan:</p>
                            <p>{app.reject_reason}</p>
                        </div>
                    )}

                    {/* Linked user (if approved) */}
                    {app.status === 'approved' && app.user && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
                            <p className="font-semibold mb-1">Akun Starcenter:</p>
                            <p>{app.user.name} — {app.user.email}</p>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                {app.status === 'pending' && (
                    <div className="px-6 py-4 border-t border-gray-100">
                        {err && (
                            <div className="mb-3 flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={14} /> {err}
                            </div>
                        )}

                        {rejectMode ? (
                            <div className="space-y-3">
                                <textarea
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    placeholder="Tuliskan alasan penolakan..."
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => { setRejectMode(false); setErr(''); setReason(''); }}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                        Konfirmasi Tolak
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectMode(true)}
                                    className="flex-1 py-2.5 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
                                >
                                    <XCircle size={16} /> Tolak
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Setujui
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function Applications() {
    const [statusFilter, setStatusFilter] = useState('pending');
    const [apps, setApps] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getApplications(page, statusFilter);
            setApps(data.data);
            setMeta(data);
        } catch {
            setApps([]);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    useEffect(() => { fetchApps(); }, [fetchApps]);

    const openDetail = async (id) => {
        try {
            const data = await adminApi.getApplication(id);
            setSelected(data);
        } catch { /* ignore */ }
    };

    const handleApproved = (id) => {
        setSelected(null);
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    };

    const handleRejected = (id) => {
        setSelected(null);
        setApps(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    };

    const pendingCount = apps.filter(a => a.status === 'pending').length;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Building2 size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Pengajuan Center</h1>
                        <p className="text-sm text-gray-500">Review dan approval pendaftaran starcenter</p>
                    </div>
                </div>
                {pendingCount > 0 && statusFilter !== 'pending' && (
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                        {pendingCount} menunggu
                    </span>
                )}
            </div>

            {/* Status tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                {STATUS_TAB.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => { setStatusFilter(tab.key); setPage(1); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            statusFilter === tab.key
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-gray-300" />
                    </div>
                ) : apps.length === 0 ? (
                    <div className="text-center py-20">
                        <ClipboardList size={36} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-gray-400 text-sm">Tidak ada pengajuan</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                                        <th className="px-6 py-4 font-medium">Nama Center</th>
                                        <th className="px-6 py-4 font-medium">Nama / Email</th>
                                        <th className="px-6 py-4 font-medium">Inisiator</th>
                                        <th className="px-6 py-4 font-medium">Tanggal</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {apps.map(app => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{app.center_name}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-gray-800">{app.full_name}</p>
                                                <p className="text-xs text-gray-400">{app.email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {app.referrer?.name || <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(app.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_BADGE[app.status]}`}>
                                                    {STATUS_LABEL[app.status]}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openDetail(app.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition"
                                                >
                                                    <Eye size={13} /> Tinjau
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                    {meta.from}–{meta.to} dari {meta.total} pengajuan
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        disabled={page === meta.last_page}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {selected && (
                <DetailModal
                    app={selected}
                    onClose={() => setSelected(null)}
                    onApproved={handleApproved}
                    onRejected={handleRejected}
                />
            )}
        </div>
    );
}
