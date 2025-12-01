import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingCart, User, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 glass-panel border-b border-purple-100/50"
      data-testid="main-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src="https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/i88259qv_favicon.ico"
                alt="Blend4u"
                className="h-10 w-10"
              />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
              Blend4u
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-700 hover:text-purple-600 font-medium transition-colors" data-testid="nav-home">
              Home
            </Link>
            <Link to="/shop" className="text-slate-700 hover:text-purple-600 font-medium transition-colors" data-testid="nav-shop">
              Shop
            </Link>
            <Link to="/contact" className="text-slate-700 hover:text-purple-600 font-medium transition-colors" data-testid="nav-contact">
              Contact
            </Link>
            <Link to="/faq" className="text-slate-700 hover:text-purple-600 font-medium transition-colors" data-testid="nav-faq">
              FAQ
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" data-testid="cart-icon-link">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 rounded-full hover:bg-purple-100 transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-slate-700" />
                {getItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold" data-testid="cart-item-count">
                    {getItemCount()}
                  </span>
                )}
              </motion.div>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                {isAdmin && (
                  <Link to="/admin" data-testid="admin-link">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium shadow-lg hover:shadow-purple-500/50 transition-shadow"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Admin</span>
                    </motion.button>
                  </Link>
                )}
                <Link to="/account" data-testid="account-link">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full glass-dark hover:bg-purple-100/30 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.email.split('@')[0]}</span>
                  </motion.button>
                </Link>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-100 transition-colors"
                  data-testid="logout-button"
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                </motion.button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block" data-testid="login-link">
                <motion.button
                  whileHover={{ scale: 1.05, translateY: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-shadow"
                >
                  Sign In
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-purple-100 transition-colors"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-purple-100/50 glass-panel"
          data-testid="mobile-menu"
        >
          <div className="px-4 py-4 space-y-3">
            <Link to="/" className="block py-2 text-slate-700 hover:text-purple-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/shop" className="block py-2 text-slate-700 hover:text-purple-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </Link>
            <Link to="/contact" className="block py-2 text-slate-700 hover:text-purple-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
            <Link to="/faq" className="block py-2 text-slate-700 hover:text-purple-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              FAQ
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="block py-2 text-purple-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <Link to="/account" className="block py-2 text-slate-700 hover:text-purple-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
                  My Account
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-red-600 font-medium">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-purple-600 font-semibold" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;
