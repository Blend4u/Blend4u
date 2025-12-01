import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const [address, setAddress] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  const validateDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const { data } = await api.post(`/discount/validate?code=${discountCode}&order_amount=${getTotal()}`);
      setDiscountAmount(data.discount_amount);
      toast.success(`Discount applied: ₹${data.discount_amount}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid discount code');
      setDiscountAmount(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: address,
        currency: 'INR',
        discount_code: discountCode || null
      };

      const { data } = await api.post('/orders', orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/account`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  const finalTotal = getTotal() - discountAmount;

  return (
    <div className="min-h-screen py-12 px-4" data-testid="checkout-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipping Address */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={address.full_name}
                onChange={(e) => setAddress({...address, full_name: e.target.value})}
                required
                className="px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="fullname-input"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={address.phone}
                onChange={(e) => setAddress({...address, phone: e.target.value})}
                required
                className="px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="phone-input"
              />
              <input
                type="text"
                placeholder="Address"
                value={address.address_line}
                onChange={(e) => setAddress({...address, address_line: e.target.value})}
                required
                className="md:col-span-2 px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="address-input"
              />
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({...address, city: e.target.value})}
                required
                className="px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="city-input"
              />
              <input
                type="text"
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress({...address, state: e.target.value})}
                required
                className="px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="state-input"
              />
              <input
                type="text"
                placeholder="Pincode"
                value={address.pincode}
                onChange={(e) => setAddress({...address, pincode: e.target.value})}
                required
                className="px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="pincode-input"
              />
            </div>
          </div>

          {/* Discount Code */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Discount Code</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                data-testid="discount-code-input"
              />
              <button
                type="button"
                onClick={validateDiscount}
                className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors"
                data-testid="apply-discount-button"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="glass-panel rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between text-slate-600">
                  <span>{item.product_name} x {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t border-purple-100 pt-2 flex justify-between font-semibold">
                <span>Subtotal</span>
                <span data-testid="subtotal">₹{getTotal()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span data-testid="discount-amount">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-purple-600">
                <span>Total</span>
                <span data-testid="total">₹{finalTotal}</span>
              </div>
            </div>
          </div>

          {/* NO RETURNS Notice */}
          <div className="glass-panel rounded-2xl p-6 border-2 border-amber-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-slate-900 mb-2">NO RETURNS / NO REFUNDS</h3>
                <p className="text-sm text-slate-600">
                  Blend4u sells products as-is. All sales are final. No returns and no refunds are offered except for documented manufacturing defects or verified shipping damage reported within 7 calendar days of delivery with photographic evidence.
                </p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50"
            data-testid="place-order-button"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
