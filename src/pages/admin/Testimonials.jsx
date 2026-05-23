import React, { useEffect, useState } from 'react';
import { adminTestimonialsApi } from '../../api/settingsApi';
import { Plus, Pencil, Trash2, Star, GripVertical, Eye, EyeOff, X, Save, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

const EMPTY_FORM = { name: '', location: '', product: '', text: '', rating: 5, is_active: true, sort_order: 0 };

function StarPicker({ value, onChange }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => onChange(n)}>
                    <Star size={20} className={n <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                </button>
            ))}
        </div>
    );
}

function TestimonialModal({ item, onClose, onSaved }) {
    const isEdit = !!item?.id;
    const [form, setForm] = useState(item || EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const saved = isEdit
                ? await adminTestimonialsApi.update(form.id, form)
                : await adminTestimonialsApi.create(form);
            onSaved(saved, isEdit);
            onClose();
        } catch {
            Swal.fire('Error', 'Gagal menyimpan testimoni.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="font-semibold text-gray-900">{isEdit ? 'Edit Testimoni' : 'Tambah Testimoni'}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Nama *</label>
                            <input
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                value={form.name} onChange={e => set('name', e.target.value)} required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Kota</label>
                            <input
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                value={form.location} onChange={e => set('location', e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Produk</label>
                        <input
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            value={form.product} onChange={e => set('product', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Ulasan *</label>
                        <textarea
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                            rows={4} value={form.text} onChange={e => set('text', e.target.value)} required
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-400 text-right mt-1">{form.text.length}/500</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Rating</label>
                            <StarPicker value={form.rating} onChange={v => set('rating', v)} />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <span className="text-sm text-gray-600">Tampilkan</span>
                            <div
                                onClick={() => set('is_active', !form.is_active)}
                                className={`w-10 h-5 rounded-full transition-colors ${form.is_active ? 'bg-green-500' : 'bg-gray-300'} relative`}
                            >
                                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.is_active ? 'left-5' : 'left-0.5'}`} />
                            </div>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50">
                            Batal
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isEdit ? 'Simpan' : 'Tambah'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AdminTestimonials() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'add' | {id, ...}

    const load = async () => {
        setLoading(true);
        try { setItems(await adminTestimonialsApi.getAll()); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSaved = (saved, isEdit) => {
        if (isEdit) {
            setItems(prev => prev.map(i => i.id === saved.id ? saved : i));
        } else {
            setItems(prev => [...prev, saved]);
        }
    };

    const handleToggle = async (item) => {
        try {
            const updated = await adminTestimonialsApi.update(item.id, { is_active: !item.is_active });
            setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        } catch {
            Swal.fire('Error', 'Gagal mengubah status.', 'error');
        }
    };

    const handleDelete = async (item) => {
        const result = await Swal.fire({
            title: 'Hapus testimoni ini?',
            text: `"${item.name}" akan dihapus permanen.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });
        if (!result.isConfirmed) return;
        try {
            await adminTestimonialsApi.remove(item.id);
            setItems(prev => prev.filter(i => i.id !== item.id));
        } catch {
            Swal.fire('Error', 'Gagal menghapus.', 'error');
        }
    };

    const moveItem = async (index, direction) => {
        const newItems = [...items];
        const target = index + direction;
        if (target < 0 || target >= newItems.length) return;
        [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
        const reordered = newItems.map((item, i) => ({ ...item, sort_order: i + 1 }));
        setItems(reordered);
        try {
            await adminTestimonialsApi.reorder(reordered.map(i => ({ id: i.id, sort_order: i.sort_order })));
        } catch {
            load();
        }
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-end justify-between mb-5">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Testimoni</h1>
                    <p className="text-xs text-gray-500 mt-1">Ulasan pelanggan yang tampil di homepage</p>
                </div>
                <button
                    onClick={() => setModal('add')}
                    className="h-8 px-3 inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-[6px] text-sm font-medium transition"
                >
                    <Plus size={14} /> Tambah
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center text-gray-400 py-16 bg-white rounded-lg border border-gray-100">
                    Belum ada testimoni. Klik "Tambah" untuk mulai.
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id} className={`bg-white rounded-lg border p-5 flex gap-4 items-start transition-opacity ${item.is_active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
                            {/* Reorder arrows */}
                            <div className="flex flex-col gap-1 shrink-0 pt-1">
                                <button
                                    onClick={() => moveItem(index, -1)}
                                    disabled={index === 0}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-default"
                                    title="Naik"
                                >
                                    <GripVertical size={14} className="text-gray-400 rotate-90 scale-x-[-1]" />
                                </button>
                                <button
                                    onClick={() => moveItem(index, 1)}
                                    disabled={index === items.length - 1}
                                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-20 disabled:cursor-default"
                                    title="Turun"
                                >
                                    <GripVertical size={14} className="text-gray-400 rotate-90" />
                                </button>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-400">
                                            {item.product && <span className="text-amber-600">{item.product}</span>}
                                            {item.location && <span>{item.location}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-0.5 shrink-0">
                                        {Array.from({ length: item.rating }).map((_, s) => (
                                            <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-2">"{item.text}"</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => handleToggle(item)}
                                    title={item.is_active ? 'Sembunyikan' : 'Tampilkan'}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700"
                                >
                                    {item.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    onClick={() => setModal(item)}
                                    className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(item)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600"
                                    title="Hapus"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <TestimonialModal
                    item={modal === 'add' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
