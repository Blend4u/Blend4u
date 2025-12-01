import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout components
import Header from './components/Header';
import Footer from './components/Footer';
import DiscountPopup from './components/DiscountPopup';

// Public pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Account from './pages/Account';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';

// Admin
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminDiscounts from './pages/admin/Discounts';

// Simple pages
const Privacy = () => (
  <div className="min-h-screen py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
      <div className="glass-panel rounded-2xl p-8 space-y-6">
        <p className="text-slate-600 leading-relaxed">At Blend4u, we respect your privacy. We collect minimal information necessary to process orders and improve our services.</p>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Information We Collect</h2>
          <p className="text-slate-600 leading-relaxed">We collect your name, email, shipping address, and payment information only for order processing.</p>
        </section>
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact</h2>
          <p className="text-slate-600 leading-relaxed">For privacy concerns, contact blend4uwithhhezz@gmail.com</p>
        </section>
      </div>
    </div>
  </div>
);

const Cookies = () => (
  <div className="min-h-screen py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Cookie Policy</h1>
      <div className="glass-panel rounded-2xl p-8 space-y-6">
        <p className="text-slate-600 leading-relaxed">We use cookies to enhance your browsing experience and remember your preferences.</p>
      </div>
    </div>
  </div>
);

const Support = () => (
  <div className="min-h-screen py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-slate-900 mb-8">Support Center</h1>
      <div className="glass-panel rounded-2xl p-8">
        <p className="text-slate-600 leading-relaxed mb-4">Need help? We're here for you!</p>
        <p className="text-slate-600">Email: blend4uwithhhezz@gmail.com</p>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div></div>;
  if (!user || !isAdmin) return <Navigate to="/" />;
  return children;
};

function AppContent() {
  return (
    <div className="App">
      <div className="content-wrapper">
        <BrowserRouter>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="discounts" element={<AdminDiscounts />} />
            </Route>

            {/* Public Routes with Header/Footer */}
            <Route path="/*" element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/cookies" element={<Cookies />} />
                </Routes>
                <Footer />
                <DiscountPopup />
              </>
            } />
          </Routes>
        </BrowserRouter>
      </div>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#6B46FF', color: '#fff' } }} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
