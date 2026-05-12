import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderApi } from '../api/orderApi';
import { shippingApi } from '../api/shippingApi';
import { settingsApi } from '../api/settingsApi';
import { TIER_CONFIG } from '../lib/tierUtils';
import { getErrorMessage } from '../api/client';
import { CheckCircle2, MapPin, ShoppingBag, CreditCard, Truck, Clock, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';

// Progress Stepper Component
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
                                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                                    ${isCompleted ? 'bg-[#047857] text-white' : isActive ? 'bg-[var(--color-primary)] text-white ring-4 ring-gray-200' : 'bg-gray-100 text-gray-400'}
                                `}>
                                    {isCompleted ? (
                                        <CheckCircle2 size={20} />
                                    ) : (
                                        <Icon size={18} />
                                    )}
                                </div>
                                <span className={`text-xs mt-1.5 font-medium ${isActive ? 'text-[var(--color-primary)]' : isCompleted ? 'text-[#047857]' : 'text-gray-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`h-0.5 w-16 sm:w-24 mx-1 mb-4 transition-colors duration-300 ${currentStep > step.id ? 'bg-[#047857]' : 'bg-gray-200'}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

const COURIER_LABELS = { jne: 'JNE', pos: 'POS Indonesia', tiki: 'TIKI' };

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { userData } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!userData) return <Navigate to="/login" state={{ from: location }} replace />;

    const [loading, setLoading] = useState(false);
    const [moqThreshold, setMoqThreshold] = useState(5000000);
    const snapReady = useRef(false);

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

    // Load Midtrans Snap script once on mount
    useEffect(() => {
        const isProduction = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true';
        const snapUrl = isProduction
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        const existing = document.getElementById('midtrans-snap-script');
        if (existing) { snapReady.current = true; return; }

        const script = document.createElement('script');
        script.id = 'midtrans-snap-script';
        script.src = snapUrl;
        script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY || '');
        script.onload = () => { snapReady.current = true; };
        document.body.appendChild(script);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        postalCode: ''
    });

    // Fetch MOQ threshold
    useEffect(() => {
        if (userData?.role === 'starcenter') {
            settingsApi.getSystemSettings()
                .then((data) => setMoqThreshold(data.moq_threshold ?? 5000000))
                .catch(() => {});
        }
    }, [userData]);

    // Initialize form with userData
    useEffect(() => {
        if (userData) {
            setFormData(prev => ({
                ...prev,
                name: userData.name || prev.name,
                phone: userData.phone || prev.phone,
                address: userData.address || prev.address,
                postalCode: userData.postal_code || prev.postalCode
            }));
        }
    }, [userData]);

    // Load provinces on mount, detect if RajaOngkir is enabled
    useEffect(() => {
        shippingApi.getProvinces()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setProvinces(data);
                    setRajaOngkirEnabled(true);
                }
            })
            .catch(() => {
                // RajaOngkir not configured — fall back to flat rate mode
                setRajaOngkirEnabled(false);
            });
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
    const moqMet = !isStarcenter || subtotal >= moqThreshold;

    const discountPercentage = userData?.tier?.discount_percent || 0;
    const discountAmount = (subtotal * discountPercentage) / 100;

    const shippingCost = selectedShipping ? selectedShipping.cost : (rajaOngkirEnabled ? null : 20000);
    const total = shippingCost !== null ? subtotal - discountAmount + shippingCost : subtotal - discountAmount;

    const canSubmit = !loading && moqMet && (!rajaOngkirEnabled || selectedShipping !== null);

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-serif mb-4">Your cart is empty</h2>
                <button
                    onClick={() => navigate('/products')}
                    className="text-[var(--color-accent)] underline hover:text-[var(--color-primary)]"
                >
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

        if (userData?.role === 'starcenter' && subtotal < moqThreshold) {
            Swal.fire({
                title: 'Minimum Belanja Belum Tercapai',
                text: `Sebagai akun Starcenter (Official Distributor), minimum transaksi adalah Rp ${moqThreshold.toLocaleString('id-ID')}.`,
                icon: 'warning',
                confirmButtonColor: '#111827'
            });
            return;
        }

        if (rajaOngkirEnabled && !selectedShipping) {
            Swal.fire({
                title: 'Pilih Metode Pengiriman',
                text: 'Silakan pilih provinsi, kota, dan metode pengiriman terlebih dahulu.',
                icon: 'warning',
                confirmButtonColor: '#111827'
            });
            return;
        }

        setLoading(true);

        try {
            const itemsData = cart.map(item => ({
                product_id: item.id,
                variant_id: item.variantId || null,
                quantity: item.quantity
            }));

            const payload = {
                customer_info: {
                    name: formData.name,
                    phone: formData.phone,
                    address: formData.address,
                    city: selectedCityName || formData.city || '',
                    postal_code: formData.postalCode,
                    ...(rajaOngkirEnabled && selectedCityId ? { destination_city_id: parseInt(selectedCityId) } : {}),
                },
                items: itemsData,
                ...(rajaOngkirEnabled && selectedShipping ? {
                    shipping_courier: selectedShipping.courier,
                    shipping_service: selectedShipping.service,
                    shipping_cost: selectedShipping.cost,
                    destination_city_id: parseInt(selectedCityId),
                } : {}),
            };

            const response = await orderApi.checkout(payload);

            const { snap_token, order_number } = response.data;

            clearCart();
            setLoading(false);

            if (snap_token && window.snap) {
                window.snap.pay(snap_token, {
                    onSuccess: () => navigate(`/invoice/${order_number}?paid=1`),
                    onPending: () => navigate(`/invoice/${order_number}`),
                    onError: () => {
                        Swal.fire({
                            title: 'Pembayaran Gagal',
                            text: 'Terjadi kesalahan saat memproses pembayaran. Pesanan kamu masih tersimpan.',
                            icon: 'error',
                            confirmButtonColor: '#111827',
                        }).then(() => navigate(`/invoice/${order_number}`));
                    },
                    onClose: () => navigate(`/invoice/${order_number}`),
                });
            } else {
                navigate(`/invoice/${order_number}`);
            }

        } catch (error) {
            console.error('Error creating order:', error);
            setLoading(false);
            Swal.fire({
                title: 'Gagal!',
                text: getErrorMessage(error, 'Terjadi kesalahan saat membuat pesanan.'),
                icon: 'error',
                confirmButtonColor: '#111827'
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <CheckoutStepper currentStep={1} />
            <div className="flex justify-center">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Form */}
                <div className="bg-white p-6 md:p-8 rounded-lg border border-gray-100 shadow-sm">
                    {/* MOQ Warning Banner */}
                    {isStarcenter && !moqMet && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-amber-800">Minimum Order Belum Terpenuhi</p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Akun Starcenter memiliki minimum transaksi <strong>Rp {moqThreshold.toLocaleString('id-ID')}</strong>.
                                    Saat ini subtotal Anda <strong>Rp {subtotal.toLocaleString('id-ID')}</strong>.
                                </p>
                            </div>
                        </div>
                    )}
                    <h2 className="text-2xl font-serif mb-6 text-[var(--color-primary)]">Shipping Details</h2>
                    <form onSubmit={handleCheckout} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                autoComplete="name"
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                required
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                autoComplete="tel"
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base"
                                placeholder="+62 812 3456 7890"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                required
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                rows="3"
                                autoComplete="street-address"
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-none text-base"
                                placeholder="Street name, house number"
                            ></textarea>
                        </div>

                        {/* Province + City Dropdowns (RajaOngkir) */}
                        {rajaOngkirEnabled ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={selectedProvinceId}
                                            onChange={handleProvinceChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base appearance-none bg-white"
                                        >
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(p => (
                                                <option key={p.province_id} value={p.province_id}>{p.province}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City / District</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={selectedCityId}
                                            onChange={handleCityChange}
                                            disabled={!selectedProvinceId || loadingCities}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base appearance-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                        >
                                            <option value="">
                                                {loadingCities ? 'Memuat kota...' : !selectedProvinceId ? 'Pilih provinsi dulu' : 'Pilih Kota / Kabupaten'}
                                            </option>
                                            {cities.map(c => (
                                                <option key={c.city_id} value={c.city_id}>{c.type} {c.city_name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City / District</label>
                                <input
                                    required
                                    type="text"
                                    name="city"
                                    value={formData.city || ''}
                                    onChange={handleInputChange}
                                    autoComplete="address-level2"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base"
                                    placeholder="Jakarta Selatan"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                            <input
                                required
                                type="text"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleInputChange}
                                autoComplete="postal-code"
                                inputMode="numeric"
                                className="w-full px-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black text-base"
                                placeholder="12345"
                            />
                        </div>

                        {/* Shipping Options */}
                        {rajaOngkirEnabled && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Shipping Method
                                    {rajaOngkirEnabled && !selectedCityId && (
                                        <span className="text-gray-400 font-normal ml-1">(pilih kota dulu)</span>
                                    )}
                                </label>

                                {loadingShipping && (
                                    <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                        Mengambil opsi pengiriman...
                                    </div>
                                )}

                                {!loadingShipping && selectedCityId && shippingOptions.length === 0 && (
                                    <p className="text-sm text-amber-600 py-2">Tidak ada kurir tersedia untuk kota ini.</p>
                                )}

                                {!loadingShipping && shippingOptions.length > 0 && (
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                        {shippingOptions.map((opt, idx) => {
                                            const key = `${opt.courier}-${opt.service}`;
                                            const isSelected = selectedShipping && selectedShipping.courier === opt.courier && selectedShipping.service === opt.service;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setSelectedShipping(opt)}
                                                    className={`w-full text-left px-3 py-2.5 border rounded-sm flex items-center justify-between transition-colors ${
                                                        isSelected
                                                            ? 'border-[#047857] bg-[#f0fdf4] ring-1 ring-[#047857]'
                                                            : 'border-gray-200 hover:border-gray-400'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Truck size={14} className={isSelected ? 'text-[#047857]' : 'text-gray-400'} />
                                                        <div>
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {COURIER_LABELS[opt.courier] || opt.courier} {opt.service}
                                                            </span>
                                                            {opt.description && (
                                                                <p className="text-xs text-gray-500">{opt.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-4">
                                                        <span className="text-sm font-semibold text-gray-900">Rp {opt.cost.toLocaleString('id-ID')}</span>
                                                        {opt.etd && (
                                                            <div className="flex items-center gap-1 justify-end mt-0.5">
                                                                <Clock size={11} className="text-gray-400" />
                                                                <span className="text-xs text-gray-500">{opt.etd} hari</span>
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

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            title={
                                !moqMet ? `Minimum order Rp ${moqThreshold.toLocaleString('id-ID')} belum terpenuhi`
                                : (rajaOngkirEnabled && !selectedShipping) ? 'Pilih metode pengiriman'
                                : ''
                            }
                            className={`w-full font-bold py-4 rounded-sm shadow-md transition-colors uppercase tracking-widest text-sm mt-6 ${
                                !canSubmit
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#047857] hover:bg-[#065F46] text-white'
                            }`}
                        >
                            {loading ? 'Processing...' : !moqMet ? 'MOQ Belum Terpenuhi' : (rajaOngkirEnabled && !selectedShipping) ? 'Pilih Pengiriman' : 'Place Order'}
                        </button>
                    </form>
                </div>

                {/* Right Summary */}
                <div className="bg-gray-50 p-6 md:p-8 rounded-lg border border-gray-100">
                    <h2 className="text-xl font-serif mb-6 text-gray-900 border-b border-gray-200 pb-4">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-16 h-16 rounded-sm bg-white overflow-hidden border border-gray-100 flex-shrink-0 relative">
                                    <img src={item.main_image_url || item.main_image || item.image} alt={item.title} className="w-full h-full object-cover" />
                                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                        {item.quantity}
                                    </div>
                                </div>
                                <div className="flex-1 flex justify-between">
                                    <div>
                                        <h3 className="text-sm text-gray-700 font-medium line-clamp-2 pr-2">{item.title}</h3>
                                        {item.variantName && <p className="text-xs text-[var(--color-primary)] mt-0.5">{item.variantName}</p>}
                                    </div>
                                    <span className="text-sm font-medium whitespace-nowrap">
                                        Rp. {(parseFloat(String(item.price || 0).replace(/,/g, '')) * item.quantity).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-4 space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>Rp. {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-[var(--color-primary)] font-medium">
                                <span>Tier Discount ({discountPercentage}%)</span>
                                <span>- Rp. {discountAmount.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-gray-600">
                            {rajaOngkirEnabled ? (
                                <>
                                    <span>
                                        Shipping
                                        {selectedShipping && (
                                            <span className="text-gray-400 ml-1 text-xs">
                                                ({COURIER_LABELS[selectedShipping.courier] || selectedShipping.courier} {selectedShipping.service})
                                            </span>
                                        )}
                                    </span>
                                    <span>{selectedShipping ? `Rp. ${selectedShipping.cost.toLocaleString('id-ID')}` : '—'}</span>
                                </>
                            ) : (
                                <>
                                    <span>Shipping (Flat Rate)</span>
                                    <span>Rp. {(20000).toLocaleString('id-ID')}</span>
                                </>
                            )}
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                            <span>Total</span>
                            <span>{shippingCost !== null ? `Rp. ${total.toLocaleString('id-ID')}` : '—'}</span>
                        </div>
                    </div>
                </div>

            </div>
            </div>
        </div>
    );
}
