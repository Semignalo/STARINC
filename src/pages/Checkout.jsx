import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../api/orderApi';
import { shippingApi } from '../api/shippingApi';
import { getErrorMessage } from '../api/client';
import { CheckCircle2, MapPin, ShoppingBag, CreditCard, Truck, Clock, ChevronDown, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import OptimizedImage from '../components/OptimizedImage';

function CheckoutStepper({ currentStep }) {
    const steps = [
        { id: 1, label: 'Shipping', icon: MapPin },
        { id: 2, label: 'Review', icon: ShoppingBag },
        { id: 3, label: 'Payment', icon: CreditCard },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 px-4">
            <div className="flex items-center justify-center gap-0">
                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;

                    return (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center">
                                <div className={`
                                    w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isCompleted ? 'bg-gray-900 text-white' : isActive ? 'bg-gray-900 text-white ring-4 ring-gray-100' : 'bg-gray-100 text-gray-400'}
                                `}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                                </div>
                                <span className={`text-[10px] uppercase tracking-[0.15em] mt-2 font-medium ${isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-px w-16 sm:w-24 mx-1 mb-4 transition-colors duration-300 ${currentStep > step.id ? 'bg-gray-900' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

const COURIER_LABELS = { jne: 'JNE', pos: 'POS Indonesia', tiki: 'TIKI' };
const MOQ_FIRST_ORDER = 50000000;
const STARCENTER_DISCOUNT = 23;

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { userData, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (authLoading) return <div className="min-h-screen pt-24 text-center text-sm text-gray-400">Memuat…</div>;
    if (!userData) return <Navigate to="/login" state={{ from: location }} replace />;
    if (userData.role !== 'starcenter' && userData.role !== 'admin') {
        return (
            <div className="min-h-screen pt-32 px-4 max-w-md mx-auto text-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-3">Members Only</p>
                <h2 className="text-2xl font-medium text-gray-900 mb-3 tracking-tight">Pembelian khusus Starcenter</h2>
                <p className="text-sm text-gray-600 mb-7">
                    Checkout di STARINC hanya untuk akun Starcenter. Untuk pembelian retail, kunjungi marketplace SDP.
                </p>
                <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white text-xs uppercase tracking-[0.2em] transition-colors"
                >
                    Beli di SDP
                </a>
            </div>
        );
    }

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        postalCode: userData?.postal_code || '',
        city: userData?.city || '',
    });

    // RajaOngkir state
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [selectedProvinceId, setSelectedProvinceId] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingShipping, setLoadingShipping] = useState(false);
    const [rajaOngkirEnabled, setRajaOngkirEnabled] = useState(false);

    useEffect(() => {
        shippingApi.getProvinces()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setProvinces(data);
                    setRajaOngkirEnabled(true);
                }
            })
            .catch(() => setRajaOngkirEnabled(false));
    }, []);

    const handleProvinceChange = async (e) => {
        const provinceId = e.target.value;
        setSelectedProvinceId(provinceId);
        setSelectedCityId('');
        setSelectedCityName('');
        setCities([]);
        setShippingOptions([]);
        setSelectedShipping(null);

        if (!provinceId) return;
        setLoadingCities(true);
        try {
            const data = await shippingApi.getCities(provinceId);
            setCities(Array.isArray(data) ? data : []);
        } catch {
            setCities([]);
        } finally {
            setLoadingCities(false);
        }
    };

    const handleCityChange = async (e) => {
        const cityId = e.target.value;
        const cityObj = cities.find(c => String(c.city_id) === String(cityId));
        setSelectedCityId(cityId);
        setSelectedCityName(cityObj ? `${cityObj.type} ${cityObj.city_name}` : '');
        setShippingOptions([]);
        setSelectedShipping(null);

        if (!cityId) return;
        setLoadingShipping(true);
        try {
            const items = cart.map(item => ({ product_id: item.id, quantity: item.quantity }));
            const data = await shippingApi.getCost(cityId, items);
            setShippingOptions(Array.isArray(data) ? data : []);
        } catch {
            setShippingOptions([]);
        } finally {
            setLoadingShipping(false);
        }
    };

    const subtotal = getCartTotal();
    const isStarcenter = userData?.role === 'starcenter';
    const isInactive = userData?.status === 'inactive';
    const discountAmount = isStarcenter ? Math.round(subtotal * STARCENTER_DISCOUNT / 100) : 0;
    const shippingCost = selectedShipping ? selectedShipping.cost : (rajaOngkirEnabled ? null : 20000);
    const total = shippingCost !== null ? subtotal - discountAmount + shippingCost : subtotal - discountAmount;

    const canSubmit = !loading && !isInactive && (!rajaOngkirEnabled || selectedShipping !== null);

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
                <button onClick={() => navigate('/products')} className="text-[var(--color-accent)] underline hover:text-[var(--color-primary)]">
                    Continue Shopping
                </button>
            </div>
        );
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckout = async (e) => {
        e.preventDefault();

        if (rajaOngkirEnabled && !selectedShipping) {
            Swal.fire({
                title: 'Pilih Metode Pengiriman',
                text: 'Silakan pilih provinsi, kota, dan metode pengiriman terlebih dahulu.',
                icon: 'warning',
                confirmButtonColor: '#111827',
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                customer_info: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: selectedCityName || formData.city || '',
                    postal_code: formData.postalCode,
                },
                items: cart.map(item => ({
                    product_id: item.id,
                    variant_id: item.variantId || null,
                    quantity: item.quantity,
                })),
                ...(rajaOngkirEnabled && selectedShipping ? {
                    shipping_courier: selectedShipping.courier,
                    shipping_service: selectedShipping.service,
                    shipping_cost: selectedShipping.cost,
                    destination_city_id: parseInt(selectedCityId),
                } : {}),
            };

            const response = await orderApi.checkout(payload);
            const { order_number, bank_info } = response.data;

            clearCart();

            if (bank_info) {
                await Swal.fire({
                    title: 'Pesanan Berhasil Dibuat!',
                    html: `
                        <p class="text-sm text-gray-600 mb-4">Silakan transfer ke rekening berikut:</p>
                        <div class="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                            <div class="flex justify-between"><span class="text-sm text-gray-500">Bank</span><strong>${bank_info.bank_name}</strong></div>
                            <div class="flex justify-between"><span class="text-sm text-gray-500">No. Rekening</span><strong>${bank_info.account_number}</strong></div>
                            <div class="flex justify-between"><span class="text-sm text-gray-500">Atas Nama</span><strong>${bank_info.account_name}</strong></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-3">Upload bukti transfer di halaman invoice.</p>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Lihat Invoice',
                    confirmButtonColor: '#047857',
                });
            }

            navigate(`/invoice/${order_number}`);
        } catch (error) {
            setLoading(false);
            Swal.fire({
                title: 'Gagal!',
                text: getErrorMessage(error, 'Terjadi kesalahan saat membuat pesanan.'),
                icon: 'error',
                confirmButtonColor: '#111827',
            });
        }
    };

    const inputClass = "w-full h-11 px-3 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors";

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
            <CheckoutStepper currentStep={1} />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">

                {/* Left Form */}
                <div className="bg-white border border-gray-200 p-6 md:p-8">

                    {/* Inactive Warning */}
                    {isInactive && (
                        <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-amber-900">Akun Tidak Aktif</p>
                                <p className="text-[11px] text-amber-700 mt-0.5">
                                    Akun Anda tidak aktif karena tidak ada transaksi selama 3 bulan. Hubungi admin untuk mengaktifkan kembali.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* MOQ Info for starcenter */}
                    {isStarcenter && subtotal < MOQ_FIRST_ORDER && (
                        <div className="mb-6 px-4 py-3 bg-gray-50 border border-gray-200 flex items-start gap-3">
                            <AlertTriangle size={14} className="text-gray-700 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-gray-900">Info Minimum Order Pertama</p>
                                <p className="text-[11px] text-gray-600 mt-0.5">
                                    Order pertama minimum <span className="font-medium text-gray-900">Rp{(50000000).toLocaleString('id-ID')}</span>. Subtotal Anda <span className="font-medium text-gray-900">Rp{subtotal.toLocaleString('id-ID')}</span>.
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Step 1</p>
                    <h2 className="text-xl font-medium text-gray-900 mb-6 tracking-tight">Shipping Details</h2>
                        <form onSubmit={handleCheckout} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleInputChange}
                                    autoComplete="name" placeholder="John Doe" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nomor Telepon</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                    autoComplete="tel" placeholder="+62 812 3456 7890" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Alamat</label>
                                <textarea required name="address" value={formData.address} onChange={handleInputChange}
                                    rows="3" autoComplete="street-address" placeholder="Jalan, nomor rumah"
                                    className="w-full px-3 py-2.5 bg-white border border-gray-200 text-sm placeholder:text-gray-400 focus:ring-1 focus:ring-gray-900 focus:border-gray-900 outline-none transition-colors resize-none" />
                            </div>

                            {/* Province + City Dropdowns */}
                            {rajaOngkirEnabled ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Provinsi</label>
                                        <div className="relative">
                                            <select required value={selectedProvinceId} onChange={handleProvinceChange}
                                                className={`${inputClass} appearance-none pr-9`}>
                                                <option value="">Pilih Provinsi</option>
                                                {provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Kota / Kabupaten</label>
                                        <div className="relative">
                                            <select required value={selectedCityId} onChange={handleCityChange}
                                                disabled={!selectedProvinceId || loadingCities}
                                                className={`${inputClass} appearance-none pr-9 disabled:bg-gray-50 disabled:text-gray-400`}>
                                                <option value="">{loadingCities ? 'Memuat kota…' : !selectedProvinceId ? 'Pilih provinsi dulu' : 'Pilih Kota / Kabupaten'}</option>
                                                {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.type} {c.city_name}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Kota / Kabupaten</label>
                                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange}
                                        autoComplete="address-level2" placeholder="Jakarta Selatan" className={inputClass} />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Kode Pos</label>
                                <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange}
                                    autoComplete="postal-code" inputMode="numeric" placeholder="12345" className={inputClass} />
                            </div>

                            {/* Shipping Options */}
                            {rajaOngkirEnabled && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Pengiriman
                                        {!selectedCityId && <span className="text-gray-400 font-normal ml-1">(pilih kota dulu)</span>}
                                    </label>
                                    {loadingShipping && (
                                        <div className="flex items-center gap-2 py-3 text-xs text-gray-500">
                                            <div className="w-3 h-3 border border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                                            Mengambil opsi pengiriman…
                                        </div>
                                    )}
                                    {!loadingShipping && selectedCityId && shippingOptions.length === 0 && (
                                        <p className="text-xs text-amber-600 py-2">Tidak ada kurir tersedia untuk kota ini.</p>
                                    )}
                                    {!loadingShipping && shippingOptions.length > 0 && (
                                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                            {shippingOptions.map((opt) => {
                                                const isSelected = selectedShipping?.courier === opt.courier && selectedShipping?.service === opt.service;
                                                return (
                                                    <button key={`${opt.courier}-${opt.service}`} type="button"
                                                        onClick={() => setSelectedShipping(opt)}
                                                        className={`w-full text-left px-3 py-2.5 border flex items-center justify-between transition-colors ${
                                                            isSelected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                                                        }`}>
                                                        <div className="flex items-center gap-2">
                                                            <Truck size={12} className={isSelected ? 'text-gray-900' : 'text-gray-400'} />
                                                            <div>
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {COURIER_LABELS[opt.courier] || opt.courier} {opt.service}
                                                                </span>
                                                                {opt.description && <p className="text-[11px] text-gray-500">{opt.description}</p>}
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0 ml-4">
                                                            <span className="text-sm font-medium text-gray-900 tabular-nums">Rp{opt.cost.toLocaleString('id-ID')}</span>
                                                            {opt.etd && (
                                                                <div className="flex items-center gap-1 justify-end mt-0.5">
                                                                    <Clock size={10} className="text-gray-400" />
                                                                    <span className="text-[11px] text-gray-500">{opt.etd} hari</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button type="submit" disabled={!canSubmit}
                                className={`w-full h-12 text-xs uppercase tracking-[0.2em] transition-colors mt-6 ${
                                    !canSubmit ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800 text-white'
                                }`}>
                                {loading ? 'Memproses…' : isInactive ? 'Akun Tidak Aktif' : (rajaOngkirEnabled && !selectedShipping) ? 'Pilih Pengiriman' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    {/* Right Summary */}
                    <div className="bg-gray-50 border border-gray-200 p-6 md:p-7 h-fit lg:sticky lg:top-20">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Order</p>
                        <h2 className="text-lg font-medium text-gray-900 mb-6 tracking-tight pb-5 border-b border-gray-200">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-14 h-14 bg-white overflow-hidden border border-gray-200 flex-shrink-0 relative">
                                        <OptimizedImage src={item.main_image_url || item.main_image || item.image} alt={item.title} width={56} height={56} blur={false} wrapperClassName="w-full h-full" />
                                        <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-medium">
                                            {item.quantity}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-xs font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                                            {item.variantName && <p className="text-[11px] text-gray-500 mt-0.5">{item.variantName}</p>}
                                        </div>
                                        <span className="text-xs font-medium whitespace-nowrap tabular-nums text-gray-900">
                                            Rp{(parseFloat(String(item.price || 0).replace(/,/g, '')) * item.quantity).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-2.5 tabular-nums">
                            <div className="flex justify-between text-xs text-gray-600">
                                <span>Subtotal</span>
                                <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            {isStarcenter && discountAmount > 0 && (
                                <div className="flex justify-between text-xs text-emerald-700 font-medium">
                                    <span>Diskon Member ({STARCENTER_DISCOUNT}%)</span>
                                    <span>−Rp{discountAmount.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xs text-gray-600">
                                {rajaOngkirEnabled ? (
                                    <>
                                        <span>
                                            Pengiriman
                                            {selectedShipping && (
                                                <span className="text-gray-400 ml-1">
                                                    ({COURIER_LABELS[selectedShipping.courier] || selectedShipping.courier} {selectedShipping.service})
                                                </span>
                                            )}
                                        </span>
                                        <span>{selectedShipping ? `Rp${selectedShipping.cost.toLocaleString('id-ID')}` : '—'}</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Pengiriman (Flat)</span>
                                        <span>Rp{(20000).toLocaleString('id-ID')}</span>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-between text-sm font-semibold text-gray-900 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span>{shippingCost !== null ? `Rp${total.toLocaleString('id-ID')}` : '—'}</span>
                            </div>
                        </div>

                        {/* Payment method note */}
                        <div className="mt-6 p-3 bg-gray-50 border border-gray-200">
                            <p className="text-xs font-medium text-gray-900">Pembayaran via Transfer Bank</p>
                            <p className="text-[11px] text-gray-600 mt-0.5">Info rekening akan ditampilkan setelah order dibuat.</p>
                        </div>
                    </div>

            </div>
        </div>
    );
}
