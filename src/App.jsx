import { Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import PageLoader from './components/PageLoader';
import ErrorBoundary from './components/ErrorBoundary';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

// Lazy load all pages
const Home = lazy(() => import('./pages/Home'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Invoice = lazy(() => import('./pages/Invoice'));
const TrackOrders = lazy(() => import('./pages/TrackOrders'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Profile = lazy(() => import('./pages/Profile'));
const CenterShop = lazy(() => import('./pages/CenterShop'));
const JoinStarcenter = lazy(() => import('./pages/JoinStarcenter'));
const DaftarCenter = lazy(() => import('./pages/DaftarCenter'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Partnership = lazy(() => import('./pages/Partnership'));

// Lazy load admin pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminAppearance = lazy(() => import('./pages/admin/Appearance'));
const AdminPaymentSettings = lazy(() => import('./pages/admin/PaymentSettings'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminUserDetail = lazy(() => import('./pages/admin/UserDetail'));
const AdminCommissions = lazy(() => import('./pages/admin/Commissions'));
const AdminApplications = lazy(() => import('./pages/admin/Applications'));
const AdminTestimonials = lazy(() => import('./pages/admin/Testimonials'));

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ScrollToTop />
        <Routes>
        {/* Public Routes */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/invoice/:id" element={<Invoice />} />
          <Route path="/orders" element={<TrackOrders />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/partnership" element={<Partnership />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/center" element={<CenterShop />} />
          <Route path="/join-starcenter" element={<JoinStarcenter />} />
          <Route path="/daftar-center" element={<DaftarCenter />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="settings" element={<AdminAppearance />} />
          <Route path="payment-settings" element={<AdminPaymentSettings />} />

          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
        </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
