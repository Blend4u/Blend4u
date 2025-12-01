import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen py-12 px-4" data-testid="contact-page">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-600 text-lg">We'd love to hear from you</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel rounded-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="name-input"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="email-input"
              />
              <textarea
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                data-testid="message-input"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-shadow disabled:opacity-50"
                data-testid="submit-button"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                  <a href="mailto:blend4uwithhhezz@gmail.com" className="text-purple-600 hover:text-purple-700">
                    blend4uwithhhezz@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100">
                  <MapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Location</h3>
                  <p className="text-slate-600">India</p>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Support Hours</h3>
                  <p className="text-slate-600">Monday - Saturday<br />9:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
