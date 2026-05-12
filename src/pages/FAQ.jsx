import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const copy = {
    en: {
        heroLabel: 'Help Center',
        heroTitle: 'Frequently Asked Questions',
        heroDesc: 'Find answers to the most common questions about Starinc products, orders, and partnership programs.',
        stillQ: 'Still have questions?',
        stillDesc: 'Our team is ready to help you every day from 08:00 – 21:00 WIB.',
        contactBtn: 'Contact Us',
        sections: [
            {
                category: 'Products',
                items: [
                    {
                        q: 'Are Starinc products registered with BPOM?',
                        a: 'Yes, all Starinc products are registered and have received official approval from BPOM (Indonesian Food and Drug Authority). The BPOM registration number can be found on the packaging of each product.',
                    },
                    {
                        q: 'Are Starinc products halal?',
                        a: 'All Starinc products have received Halal certification from MUI (Indonesian Ulema Council). We are committed to maintaining halal standards at every stage of production.',
                    },
                    {
                        q: 'Are Starinc products safe for sensitive skin?',
                        a: 'Starinc products have undergone dermatological testing (dermatologist tested) and are formulated to be safe for all skin types, including sensitive skin. However, if you have a specific skin condition, we still recommend doing a patch test before full use.',
                    },
                    {
                        q: 'How long does it take to see visible results?',
                        a: 'Results vary depending on skin type and consistency of use. In general, initial changes can be felt within 1–2 weeks of regular use. Optimal results are usually visible after 4–8 weeks of consistent use.',
                    },
                    {
                        q: 'Can Starinc products be used with other skincare products?',
                        a: 'Yes, Starinc products are designed to be combined with other skincare routines. However, we advise against combining products with very strong active ingredients at the same time (e.g., high-concentration Vitamin C with Retinol) to avoid irritation.',
                    },
                    {
                        q: 'What is the shelf life of Starinc products?',
                        a: 'The expiry date is printed on the packaging of each product. After opening (PAO / Period After Opening), we recommend using the product within 6–12 months depending on the product type. Store in a cool, dry place away from direct sunlight.',
                    },
                ],
            },
            {
                category: 'Orders & Payment',
                items: [
                    {
                        q: 'What payment methods are available?',
                        a: 'We accept various payment methods, including bank transfers (BCA, Mandiri, BNI, BRI), virtual accounts, and digital payment platforms such as GoPay, OVO, and Dana.',
                    },
                    {
                        q: 'How do I place an order?',
                        a: 'You can order directly through this website. Select the desired product, add it to your cart, fill in your shipping details, then choose a payment method. Once payment is confirmed, your order will be processed immediately.',
                    },
                    {
                        q: 'Can I cancel my order after confirmation?',
                        a: 'Order cancellations can be made as long as the order has not yet entered the shipping stage. Please contact our team immediately via the available contact channels. If payment has been made, a refund will be processed within 3–5 business days.',
                    },
                    {
                        q: 'Does the listed price include shipping costs?',
                        a: 'Prices listed on the website are product prices and do not include shipping costs. Shipping fees are automatically calculated based on the destination address and package weight during checkout.',
                    },
                ],
            },
            {
                category: 'Shipping',
                items: [
                    {
                        q: 'Where does Starinc ship to?',
                        a: 'We deliver to all regions across Indonesia. For international shipping, please contact our team first for further information.',
                    },
                    {
                        q: 'What is the estimated delivery time?',
                        a: 'Estimated delivery time depends on the destination and chosen courier:\n• Same Day / Next Day: available for certain areas\n• Regular: 2–5 business days (Java & Bali)\n• Outside Java: 3–7 business days\n• Papua & remote islands: 7–14 business days',
                    },
                    {
                        q: 'How do I track my order?',
                        a: 'Once your order is shipped, you will receive a tracking number via email or a notification in your account. Use this tracking number to monitor your shipment status on the courier\'s website, or directly on your orders page.',
                    },
                    {
                        q: 'What should I do if my product arrives damaged?',
                        a: 'If a product arrives damaged or incorrect, immediately document the condition with photos/videos of the package before and after opening. Contact our customer service team within 24 hours of receipt. We will process a replacement or refund in accordance with our policy.',
                    },
                ],
            },
            {
                category: 'Partnership Program',
                items: [
                    {
                        q: 'What is the Starcenter program?',
                        a: 'Starcenter is Starinc\'s official partnership program that allows you to become a business partner, gaining access to exclusive wholesale pricing, special partner discounts, and various other exclusive benefits. Perfect for those who want to grow a business with Starinc.',
                    },
                    {
                        q: 'How do I register as a Starcenter?',
                        a: 'You can apply for Starcenter registration through the "Daftar Center" page on our website. Fill in the registration form completely, and our team will contact you within 1–3 business days for the verification process.',
                    },
                    {
                        q: 'Is there a minimum purchase for Starcenter members?',
                        a: 'Yes, Starcenter members have a minimum order quantity (MOQ) that applies. Details of the MOQ requirements and full benefits will be communicated after your registration is approved by the Starinc team.',
                    },
                ],
            },
        ],
    },
    id: {
        heroLabel: 'Help Center',
        heroTitle: 'Frequently Asked Questions',
        heroDesc: 'Temukan jawaban untuk pertanyaan yang paling sering ditanyakan tentang produk, pemesanan, dan program Starinc.',
        stillQ: 'Masih ada pertanyaan?',
        stillDesc: 'Tim kami siap membantu kamu setiap hari pukul 08.00 – 21.00 WIB.',
        contactBtn: 'Hubungi Kami',
        sections: [
            {
                category: 'Produk',
                items: [
                    {
                        q: 'Apakah produk Starinc sudah terdaftar di BPOM?',
                        a: 'Ya, seluruh produk Starinc telah terdaftar dan mendapatkan izin resmi dari BPOM (Badan Pengawas Obat dan Makanan) Indonesia. Nomor registrasi BPOM dapat ditemukan pada kemasan setiap produk.',
                    },
                    {
                        q: 'Apakah produk Starinc halal?',
                        a: 'Semua produk Starinc telah mendapatkan sertifikasi Halal dari MUI (Majelis Ulama Indonesia). Kami berkomitmen untuk menjaga standar kehalalan di setiap tahap produksi.',
                    },
                    {
                        q: 'Apakah produk Starinc aman untuk kulit sensitif?',
                        a: 'Produk Starinc telah melalui uji dermatologi (dermatologist tested) dan diformulasikan untuk aman digunakan pada semua jenis kulit, termasuk kulit sensitif. Namun, jika kamu memiliki kondisi kulit tertentu, kami tetap menyarankan untuk melakukan patch test terlebih dahulu sebelum pemakaian penuh.',
                    },
                    {
                        q: 'Berapa lama produk Starinc memberikan hasil yang terlihat?',
                        a: 'Hasil penggunaan bervariasi tergantung jenis kulit dan konsistensi pemakaian. Secara umum, perubahan awal sudah dapat dirasakan dalam 1–2 minggu pemakaian rutin. Hasil optimal biasanya terlihat setelah 4–8 minggu penggunaan konsisten.',
                    },
                    {
                        q: 'Apakah produk Starinc bisa digunakan bersamaan dengan produk skincare lain?',
                        a: 'Ya, produk Starinc dirancang untuk dapat dikombinasikan dengan rangkaian skincare lain. Namun, kami menyarankan untuk tidak menggabungkan produk dengan kandungan aktif yang terlalu kuat secara bersamaan (misalnya Vitamin C konsentrasi tinggi dengan Retinol) untuk menghindari iritasi.',
                    },
                    {
                        q: 'Berapa lama masa kedaluwarsa produk Starinc?',
                        a: 'Masa kedaluwarsa tertera pada kemasan setiap produk. Setelah dibuka (PAO / Period After Opening), kami menyarankan penggunaan maksimal 6–12 bulan tergantung jenis produk. Simpan produk di tempat yang sejuk, kering, dan terhindar dari paparan sinar matahari langsung.',
                    },
                ],
            },
            {
                category: 'Pemesanan & Pembayaran',
                items: [
                    {
                        q: 'Metode pembayaran apa saja yang tersedia?',
                        a: 'Kami menerima berbagai metode pembayaran, termasuk transfer bank (BCA, Mandiri, BNI, BRI), virtual account, serta pembayaran melalui platform digital seperti GoPay, OVO, dan Dana.',
                    },
                    {
                        q: 'Bagaimana cara melakukan pemesanan?',
                        a: 'Kamu dapat memesan langsung melalui website ini. Pilih produk yang diinginkan, tambahkan ke keranjang, isi data pengiriman, lalu pilih metode pembayaran. Setelah pembayaran dikonfirmasi, pesananmu akan segera diproses.',
                    },
                    {
                        q: 'Apakah saya bisa membatalkan pesanan setelah konfirmasi?',
                        a: 'Pembatalan pesanan dapat dilakukan selama pesanan belum memasuki tahap pengiriman. Silakan hubungi tim kami segera melalui kontak yang tersedia. Jika pembayaran sudah dilakukan, refund akan diproses dalam 3–5 hari kerja.',
                    },
                    {
                        q: 'Apakah harga yang tertera sudah termasuk ongkos kirim?',
                        a: 'Harga yang tertera di website adalah harga produk belum termasuk ongkos kirim. Biaya pengiriman akan dihitung secara otomatis berdasarkan alamat tujuan dan berat paket saat proses checkout.',
                    },
                ],
            },
            {
                category: 'Pengiriman',
                items: [
                    {
                        q: 'Ke mana saja Starinc bisa mengirimkan produk?',
                        a: 'Kami melayani pengiriman ke seluruh wilayah Indonesia. Untuk pengiriman internasional, silakan hubungi tim kami terlebih dahulu untuk informasi lebih lanjut.',
                    },
                    {
                        q: 'Berapa lama estimasi pengiriman?',
                        a: 'Estimasi pengiriman tergantung lokasi tujuan dan ekspedisi yang dipilih:\n• Same Day / Next Day: tersedia untuk area tertentu\n• Reguler: 2–5 hari kerja (Jawa & Bali)\n• Luar Jawa: 3–7 hari kerja\n• Papua & pulau terpencil: 7–14 hari kerja',
                    },
                    {
                        q: 'Bagaimana cara melacak pesanan saya?',
                        a: 'Setelah pesanan dikirim, kamu akan menerima nomor resi pengiriman melalui email atau notifikasi di akun kamu. Gunakan nomor resi tersebut untuk melacak status pengiriman di website ekspedisi yang bersangkutan, atau langsung di halaman pesanan kamu.',
                    },
                    {
                        q: 'Apa yang harus dilakukan jika produk rusak saat diterima?',
                        a: 'Jika produk diterima dalam kondisi rusak atau tidak sesuai, segera dokumentasikan dengan foto/video kondisi paket sebelum dibuka dan setelah dibuka. Hubungi tim customer service kami dalam 1×24 jam setelah penerimaan. Kami akan memproses penggantian atau refund sesuai kebijakan kami.',
                    },
                ],
            },
            {
                category: 'Program & Kemitraan',
                items: [
                    {
                        q: 'Apa itu program Starcenter?',
                        a: 'Starcenter adalah program kemitraan resmi Starinc yang memungkinkan kamu menjadi mitra bisnis dengan akses harga grosir eksklusif, diskon khusus mitra, dan berbagai benefit eksklusif lainnya. Cocok untuk kamu yang ingin mengembangkan bisnis bersama Starinc.',
                    },
                    {
                        q: 'Bagaimana cara mendaftar menjadi Starcenter?',
                        a: 'Kamu dapat mengajukan pendaftaran Starcenter melalui halaman "Daftar Center" di website kami. Isi formulir pendaftaran dengan lengkap, dan tim kami akan menghubungimu dalam 1–3 hari kerja untuk proses verifikasi.',
                    },
                    {
                        q: 'Apakah ada minimum pembelian untuk anggota Starcenter?',
                        a: 'Ya, anggota Starcenter memiliki minimum order quantity (MOQ) yang berlaku. Detail ketentuan MOQ dan benefit lengkap akan diinformasikan setelah pendaftaranmu disetujui oleh tim Starinc.',
                    },
                ],
            },
        ],
    },
};

function AccordionItem({ q, a, isOpen, onToggle }) {
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-start justify-between py-5 text-left gap-4 group"
            >
                <span className={`text-sm font-medium leading-relaxed transition-colors ${isOpen ? 'text-[var(--color-accent)]' : 'text-gray-900 group-hover:text-[var(--color-accent)]'}`}>
                    {q}
                </span>
                <ChevronDown
                    size={18}
                    strokeWidth={1.5}
                    className={`shrink-0 mt-0.5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[var(--color-accent)]' : ''}`}
                />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{a}</p>
            </div>
        </div>
    );
}

export default function FAQ() {
    const { lang } = useLanguage();
    const tx = copy[lang] ?? copy.id;
    const [openMap, setOpenMap] = useState({ '0-0': true });

    const toggle = (key) => {
        setOpenMap(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="bg-white min-h-screen">

            {/* Hero */}
            <section className="bg-[#faf8f5] border-b border-stone-100 py-16 md:py-24 px-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-accent)] mb-3">{tx.heroLabel}</p>
                <h1 className="text-3xl md:text-5xl font-serif text-gray-900 mb-4">{tx.heroTitle}</h1>
                <div className="h-px w-12 bg-[var(--color-accent)] mx-auto mt-5 mb-6" />
                <p className="text-gray-500 text-sm max-w-md mx-auto">{tx.heroDesc}</p>
            </section>

            {/* Content */}
            <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
                <div className="space-y-12">
                    {tx.sections.map((section, si) => (
                        <div key={`${lang}-${si}`}>
                            <h2 className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent)] mb-6 font-semibold">
                                {section.category}
                            </h2>
                            <div className="bg-white border border-gray-100 rounded-sm px-6">
                                {section.items.map((item, ii) => {
                                    const key = `${si}-${ii}`;
                                    return (
                                        <AccordionItem
                                            key={key}
                                            q={item.q}
                                            a={item.a}
                                            isOpen={!!openMap[key]}
                                            onToggle={() => toggle(key)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still have questions */}
                <div className="mt-16 bg-[#faf8f5] border border-stone-100 rounded-sm p-8 text-center">
                    <h3 className="font-serif text-xl text-gray-900 mb-2">{tx.stillQ}</h3>
                    <p className="text-sm text-gray-500 mb-6">{tx.stillDesc}</p>
                    <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 text-sm font-semibold tracking-wider uppercase hover:bg-[var(--color-accent)] transition-colors"
                    >
                        {tx.contactBtn}
                    </a>
                </div>
            </section>

        </div>
    );
}
