import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass-panel border-t border-purple-100/50 mt-20" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img
                src="https://customer-assets.emergentagent.com/job_cf372bce-09fe-40c5-a580-939c2fdf2eec/artifacts/i88259qv_favicon.ico"
                alt="Blend4u"
                className="h-8 w-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
                Blend4u
              </span>
            </Link>
            <p className="text-slate-600 text-sm mb-4">
              Premium accessories for your active lifestyle. Quality products, exceptional service.
            </p>
            <div className="flex space-x-3">
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors">
                <Facebook className="w-4 h-4 text-purple-600" />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors">
                <Twitter className="w-4 h-4 text-purple-600" />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="#" className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors">
                <Instagram className="w-4 h-4 text-purple-600" />
              </motion.a>
              <motion.a whileHover={{ scale: 1.1 }} href="mailto:blend4uwithhhezz@gmail.com" className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors">
                <Mail className="w-4 h-4 text-purple-600" />
              </motion.a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=socks" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Socks</Link></li>
              <li><Link to="/shop?category=bags" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Bags</Link></li>
              <li><Link to="/shop?category=accessories" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Accessories</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Help Center</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-slate-600 hover:text-purple-600 text-sm transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-purple-100/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-600 text-sm">
              © {new Date().getFullYear()} Blend4u. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs">
              Made with passion for quality and style
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
