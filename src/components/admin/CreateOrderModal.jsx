import { useState, useEffect, useCallback, useRef } from 'react';
import { XCircle, Search, Plus, Minus, Trash2, ChevronRight, ChevronLeft, ShoppingCart, User, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import { adminApi } from '../../api/adminApi';
import { productApi } from '../../api/productApi';

const fmtRp = (v) => 'Rp ' + Number(v || 0).toLocaleString('id-ID');
const FLAT_SHIPPING = 20000;
const DEFAULT_DISCOUNT = 23;

export default function CreateOrderModal({ isOpen, onClose, onOrderCreated }) {
    const [step, setStep] = useState(1);

    // Step 1 — user
    const [userSearch, setUserSearch]     = useState('');
    const [userResults, setUserResults]   = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Step 2 — customer info
    const [customerInfo, setCustomerInfo] = useState({
        name: '', phone: '', address: '', city: '', postal_code: '',
    });

    // Step 3 — products
    const [productSearch, setProductSearch]     = useState('');
    const [productResults, setProductResults]   = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [cart, setCart]                       = useState([]); // [{product, variantId, variantName, price, qty}]
    const [pendingVariant, setPendingVariant]   = useState({}); // productId → selected variantId

    // Step 4 — discount + submit
    const [discountPct, setDiscountPct] = useState(DEFAULT_DISCOUNT);
    const [submitting, setSubmitting]   = useState(false);

    const userDebounce   = useRef(null);
    const prodDebounce   = useRef(null);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setUserSearch(''); setUserResults([]); setSelectedUser(null);
            setCustomerInfo({ name: '', phone: '', address: '', city: '', postal_code: '' });
            setProductSearch(''); setProductResults([]); setCart([]);
            setPendingVariant({});
            setDiscountPct(DEFAULT_DISCOUNT);
        }
    }, [isOpen]);

    // ── User search ──────────────────────────────────────────────────────────
    useEffect(() => {
        clearTimeout(userDebounce.current);
        if (!userSearch.trim()) { setUserResults([]); return; }
        userDebounce.current = setTimeout(async () => {
            setLoadingUsers(true);
            try {
                const res = await adminApi.getStarcenters(userSearch);
                setUserResults((res.data || []).filter(u => u.role === 'starcenter'));
            } catch {
                setUserResults([]);
            } finally {
                setLoadingUsers(false);
            }
        }, 300);
    }, [userSearch]);

    const selectUser = (user) => {
        setSelectedUser(user);
        setCustomerInfo({
            name:        user.name        || '',
            phone:       user.phone       || '',
            address:     user.address     || '',
            city:        user.city        || '',
            postal_code: user.postal_code || '',
        });
        setUserSearch('');
        setUserResults([]);
    };

    // ── Product search ───────────────────────────────────────────────────────
    useEffect(() => {
        clearTimeout(prodDebounce.current);
        prodDebounce.current = setTimeout(async () => {
            setLoadingProducts(true);
            try {
                const res = await productApi.getProducts({ search: productSearch, per_page: 20 });
                setProductResults(res.data || []);
            } catch {
                setProductResults([]);
            } finally {
                setLoadingProducts(false);
            }
        }, 300);
    }, [productSearch]);

    // Load initial product list when entering step 3
    useEffect(() => {
        if (step === 3 && productResults.length === 0) {
            setProductSearch(''); // triggers debounce with empty search → loads all
        }
    }, [step]);

    const addToCart = (product) => {
        const variants  = product.variants || [];
        const variantId = variants.length > 0 ? (pendingVariant[product.id] ?? variants[0].id) : null;
        const variant   = variants.find(v => v.id === variantId);
        const price     = variant ? Number(variant.price) : Number(product.price);
        const varName   = variant ? variant.name : null;
        const key       = `${product.id}-${variantId ?? 'base'}`;

        setCart(prev => {
            const existing = prev.find(c => c.key === key);
            if (existing) {
                return prev.map(c => c.key === key ? { ...c, qty: c.qty + 1 } : c);
            }
            return [...prev, { key, product, variantId, variantName: varName, price, qty: 1 }];
        });
    };

    const updateQty = (key, delta) => {
        setCart(prev =>
            prev.map(c => c.key === key ? { ...c, qty: Math.max(1, c.qty + delta) } : c)
        );
    };

    const removeFromCart = (key) => {
        setCart(prev => prev.filter(c => c.key !== key));
    };

    // ── Price calc ───────────────────────────────────────────────────────────
    const subtotal      = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const discountAmt   = Math.round(subtotal * discountPct / 100);
    const total         = subtotal - discountAmt + FLAT_SHIPPING;

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                user_id:       selectedUser.id,
                customer_info: customerInfo,
                items: cart.map(c => ({
                    product_id: c.product.id,
                    variant_id: c.variantId ?? undefined,
                    quantity:   c.qty,
                })),
                discount_percent: discountPct,
            };

            const res = await adminApi.createOrderForUser(payload);
            const data = res.data;

            onClose();
            onOrderCreated();

            Swal.fire({
                icon: 'success',
                title: 'Pesanan Dibuat',
                html: `
                    <div class="text-left text-sm space-y-1">
                        <p><b>No. Pesanan:</b> ${data.order_number}</p>
                        <p><b>Total:</b> ${fmtRp(data.total)}</p>
                        <hr class="my-2"/>
                        <p class="font-semibold">Info Transfer:</p>
                        <p>${data.bank_info?.bank_name} — ${data.bank_info?.account_number}</p>
                        <p>a/n ${data.bank_info?.account_name}</p>
                    </div>
                `,
                confirmButtonText: 'OK',
            });
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.errors
                ? Object.values(err.response.data.errors || {}).flat().join('\n')
                : 'Gagal membuat pesanan.';
            Swal.fire('Gagal', msg, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const steps = ['Pilih Center', 'Info Penerima', 'Produk', 'Review'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Buat Pesanan</h2>
                        <div className="flex gap-2 mt-2">
                            {steps.map((label, i) => (
                                <div key={i} className="flex items-center gap-1">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition ${
                                        i + 1 === step ? 'bg-[var(--color-accent)] text-white' :
                                        i + 1 < step  ? 'bg-green-500 text-white' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>{i + 1}</span>
                                    <span className={`text-xs hidden sm:inline ${i + 1 === step ? 'font-semibold text-gray-800' : 'text-gray-400'}`}>{label}</span>
                                    {i < steps.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition">
                        <XCircle size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">

                    {/* ── Step 1: Pilih Starcenter ── */}
                    {step === 1 && (
                        <div className="space-y-4">
                            {selectedUser && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm text-gray-900">{selectedUser.name}</p>
                                        <p className="text-xs text-gray-500">{selectedUser.email}</p>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-red-500">
                                        <XCircle size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nama atau email starcenter..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                            </div>

                            {loadingUsers && <p className="text-sm text-gray-400 text-center py-4">Mencari...</p>}

                            {userResults.length > 0 && (
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    {userResults.map(u => (
                                        <button
                                            key={u.id}
                                            onClick={() => selectUser(u)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm text-gray-900 truncate">{u.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                            </div>
                                            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                                                u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>{u.status}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!loadingUsers && userSearch && userResults.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4">Tidak ada starcenter ditemukan.</p>
                            )}

                            {!userSearch && !selectedUser && (
                                <p className="text-sm text-gray-400 text-center py-8">Ketik nama atau email untuk mencari starcenter.</p>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Info Penerima ── */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                                <User size={15} />
                                <span>Pesanan atas nama: <b>{selectedUser?.name}</b></span>
                            </div>
                            {[
                                { key: 'name', label: 'Nama Penerima', type: 'text' },
                                { key: 'phone', label: 'Nomor Telepon', type: 'tel' },
                                { key: 'address', label: 'Alamat Lengkap', type: 'text', multiline: true },
                                { key: 'city', label: 'Kota', type: 'text' },
                                { key: 'postal_code', label: 'Kode Pos', type: 'text' },
                            ].map(({ key, label, type, multiline }) => (
                                <div key={key}>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                                    {multiline ? (
                                        <textarea
                                            value={customerInfo[key]}
                                            onChange={e => setCustomerInfo(prev => ({ ...prev, [key]: e.target.value }))}
                                            rows={3}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                                        />
                                    ) : (
                                        <input
                                            type={type}
                                            value={customerInfo[key]}
                                            onChange={e => setCustomerInfo(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Step 3: Tambah Produk ── */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {/* Cart summary */}
                            {cart.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                        <ShoppingCart size={13} /> Keranjang ({cart.length} item)
                                    </p>
                                    {cart.map(c => (
                                        <div key={c.key} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{c.product.title}</p>
                                                {c.variantName && <p className="text-xs text-gray-500">{c.variantName}</p>}
                                                <p className="text-xs text-gray-400">{fmtRp(c.price)}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => updateQty(c.key, -1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                                                    <Minus size={11} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{c.qty}</span>
                                                <button onClick={() => updateQty(c.key, 1)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                                                    <Plus size={11} />
                                                </button>
                                            </div>
                                            <p className="w-24 text-right text-sm font-semibold text-gray-800">{fmtRp(c.price * c.qty)}</p>
                                            <button onClick={() => removeFromCart(c.key)} className="text-gray-300 hover:text-red-500 transition">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Product search */}
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari produk..."
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                            </div>

                            {loadingProducts && <p className="text-sm text-gray-400 text-center py-4">Memuat produk...</p>}

                            {productResults.map(product => {
                                const variants = product.variants || [];
                                const selectedVarId = pendingVariant[product.id] ?? (variants[0]?.id ?? null);
                                const displayVariant = variants.find(v => v.id === selectedVarId);
                                const displayPrice = displayVariant ? Number(displayVariant.price) : Number(product.price);

                                return (
                                    <div key={product.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition">
                                        {product.main_image_url ? (
                                            <img src={product.main_image_url} alt={product.title}
                                                className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-100" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <Package size={20} className="text-gray-300" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{product.title}</p>
                                            <p className="text-xs text-gray-400">{product.category}</p>
                                            <p className="text-sm font-semibold text-[var(--color-accent)]">{fmtRp(displayPrice)}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {variants.length > 1 && (
                                                <select
                                                    value={selectedVarId ?? ''}
                                                    onChange={e => setPendingVariant(prev => ({ ...prev, [product.id]: Number(e.target.value) }))}
                                                    className="text-xs border border-gray-200 rounded px-1 py-0.5 focus:outline-none max-w-[110px]"
                                                >
                                                    {variants.map(v => (
                                                        <option key={v.id} value={v.id}>{v.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="flex items-center gap-1 bg-[var(--color-accent)] hover:opacity-90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition"
                                            >
                                                <Plus size={12} /> Tambah
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Step 4: Review ── */}
                    {step === 4 && (
                        <div className="space-y-5">
                            {/* Selected user */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Akun Starcenter</p>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-9 h-9 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
                                        {selectedUser?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-900">{selectedUser?.name}</p>
                                        <p className="text-xs text-gray-500">{selectedUser?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Customer info */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Info Penerima</p>
                                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                                    <p className="font-semibold">{customerInfo.name}</p>
                                    <p className="text-gray-600">{customerInfo.phone}</p>
                                    <p className="text-gray-600">{customerInfo.address}</p>
                                    <p className="text-gray-600">{customerInfo.city}{customerInfo.postal_code ? `, ${customerInfo.postal_code}` : ''}</p>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Produk</p>
                                <div className="space-y-1">
                                    {cart.map(c => (
                                        <div key={c.key} className="flex justify-between text-sm py-1">
                                            <span className="text-gray-700">
                                                {c.product.title}{c.variantName ? ` — ${c.variantName}` : ''} ×{c.qty}
                                            </span>
                                            <span className="font-semibold">{fmtRp(c.price * c.qty)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Custom discount input */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Diskon Khusus</p>
                                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-xs text-amber-700 mb-1">Persentase diskon (default starcenter: {DEFAULT_DISCOUNT}%)</p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={discountPct}
                                                onChange={e => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
                                                className="w-24 border border-amber-300 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 text-center"
                                            />
                                            <span className="text-sm font-semibold text-amber-700">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price breakdown */}
                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">{fmtRp(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Diskon ({discountPct}%)</span>
                                    <span className="font-semibold text-red-600">- {fmtRp(discountAmt)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Ongkir (flat)</span>
                                    <span className="font-semibold">{fmtRp(FLAT_SHIPPING)}</span>
                                </div>
                                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-[var(--color-accent)]">{fmtRp(total)}</span>
                                </div>
                                <p className="text-xs text-gray-400 text-center mt-1">* Harga estimasi, dikonfirmasi server saat order dibuat</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer nav */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        <ChevronLeft size={16} />
                        {step === 1 ? 'Batal' : 'Kembali'}
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={
                                (step === 1 && !selectedUser) ||
                                (step === 2 && (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city)) ||
                                (step === 3 && cart.length === 0)
                            }
                            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-[var(--color-accent)] hover:opacity-90 text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Lanjut <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-[var(--color-accent)] hover:opacity-90 text-white rounded-lg transition disabled:opacity-40"
                        >
                            {submitting ? 'Memproses...' : 'Buat Pesanan'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
