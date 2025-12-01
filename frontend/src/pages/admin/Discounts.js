import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash, Tag } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([]);
  const [popups, setPopups] = useState([]);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [discountForm, setDiscountForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_uses: '' });
  const [popupForm, setPopupForm] = useState({ title: '', message: '', discount_code: '', is_active: true, display_duration: 5000 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [discountsRes, popupsRes] = await Promise.all([api.get('/admin/discounts'), api.get('/admin/popups')]);
      setDiscounts(discountsRes.data);
      setPopups(popupsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/discounts', { ...discountForm, discount_value: parseFloat(discountForm.discount_value), min_order_amount: parseFloat(discountForm.min_order_amount), max_uses: discountForm.max_uses ? parseInt(discountForm.max_uses) : null });
      toast.success('Discount created');
      setShowDiscountForm(false);
      setDiscountForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_uses: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create discount');
    }
  };

  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/popups', popupForm);
      toast.success('Popup created');
      setShowPopupForm(false);
      setPopupForm({ title: '', message: '', discount_code: '', is_active: true, display_duration: 5000 });
      fetchData();
    } catch (error) {
      toast.error('Failed to create popup');
    }
  };

  const togglePopupStatus = async (id, is_active) => {
    try {
      const popup = popups.find(p => p.id === id);
      await api.put(`/admin/popups/${id}`, { ...popup, is_active: !is_active });
      toast.success('Popup updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update popup');
    }
  };

  const deleteDiscount = async (id) => {
    if (window.confirm('Delete this discount?')) {
      try {
        await api.delete(`/admin/discounts/${id}`);
        toast.success('Discount deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div data-testid="admin-discounts">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Discounts & Offers</h1>

      {/* Discount Codes Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Discount Codes</h2>
          <button onClick={() => setShowDiscountForm(!showDiscountForm)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold flex items-center space-x-2" data-testid="add-discount-button">
            <Plus className="w-5 h-5" />
            <span>Add Discount</span>
          </button>
        </div>

        {showDiscountForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6 mb-6">
            <form onSubmit={handleDiscountSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Code" value={discountForm.code} onChange={(e) => setDiscountForm({...discountForm, code: e.target.value.toUpperCase()})} required className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="code-input" />
                <select value={discountForm.discount_type} onChange={(e) => setDiscountForm({...discountForm, discount_type: e.target.value})} className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="type-select">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
                <input type="number" placeholder="Value" value={discountForm.discount_value} onChange={(e) => setDiscountForm({...discountForm, discount_value: e.target.value})} required className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="value-input" />
                <input type="number" placeholder="Min Order Amount" value={discountForm.min_order_amount} onChange={(e) => setDiscountForm({...discountForm, min_order_amount: e.target.value})} className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="min-amount-input" />
                <input type="number" placeholder="Max Uses (optional)" value={discountForm.max_uses} onChange={(e) => setDiscountForm({...discountForm, max_uses: e.target.value})} className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="max-uses-input" />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors" data-testid="save-discount-button">Save</button>
                <button type="button" onClick={() => setShowDiscountForm(false)} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {discounts.map(discount => (
            <div key={discount.id} className="glass-panel rounded-xl p-4" data-testid={`discount-${discount.id}`}>
              <div className="flex items-center justify-between mb-2">
                <code className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-mono font-bold">{discount.code}</code>
                <button onClick={() => deleteDiscount(discount.id)} className="p-2 rounded-lg hover:bg-red-100 transition-colors" data-testid={`delete-discount-${discount.id}`}>
                  <Trash className="w-4 h-4 text-red-600" />
                </button>
              </div>
              <p className="text-sm text-slate-600">Type: {discount.discount_type}</p>
              <p className="text-sm text-slate-600">Value: {discount.discount_value}{discount.discount_type === 'percentage' ? '%' : ' INR'}</p>
              <p className="text-sm text-slate-600">Uses: {discount.uses_count}/{discount.max_uses || '∞'}</p>
              <p className={`text-sm font-semibold mt-2 ${discount.is_active ? 'text-emerald-600' : 'text-red-600'}`}>{discount.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popups Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Discount Popups</h2>
          <button onClick={() => setShowPopupForm(!showPopupForm)} className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold flex items-center space-x-2" data-testid="add-popup-button">
            <Plus className="w-5 h-5" />
            <span>Add Popup</span>
          </button>
        </div>

        {showPopupForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6 mb-6">
            <form onSubmit={handlePopupSubmit} className="space-y-4">
              <input type="text" placeholder="Title" value={popupForm.title} onChange={(e) => setPopupForm({...popupForm, title: e.target.value})} required className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="popup-title-input" />
              <textarea placeholder="Message" value={popupForm.message} onChange={(e) => setPopupForm({...popupForm, message: e.target.value})} required rows={3} className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none resize-none" data-testid="popup-message-input" />
              <input type="text" placeholder="Discount Code (optional)" value={popupForm.discount_code} onChange={(e) => setPopupForm({...popupForm, discount_code: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="popup-code-input" />
              <div className="flex space-x-2">
                <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors" data-testid="save-popup-button">Save</button>
                <button type="button" onClick={() => setShowPopupForm(false)} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="space-y-4">
          {popups.map(popup => (
            <div key={popup.id} className="glass-panel rounded-xl p-6" data-testid={`popup-${popup.id}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 mb-1">{popup.title}</h3>
                  <p className="text-slate-600 mb-2">{popup.message}</p>
                  {popup.discount_code && <code className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-mono text-sm">{popup.discount_code}</code>}
                </div>
                <button onClick={() => togglePopupStatus(popup.id, popup.is_active)} className={`px-4 py-2 rounded-lg font-semibold transition-colors ${popup.is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`} data-testid={`toggle-popup-${popup.id}`}>
                  {popup.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDiscounts;
