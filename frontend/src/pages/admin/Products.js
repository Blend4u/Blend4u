import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price_inr: '', price_usd: '',
    stock: '', category: 'socks', images: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price_inr: parseFloat(formData.price_inr),
        price_usd: parseFloat(formData.price_usd),
        stock: parseInt(formData.stock),
        images: formData.images.split(',').map(i => i.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct}`, productData);
        toast.success('Product updated');
      } else {
        await api.post('/admin/products', productData);
        toast.success('Product created');
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', price_inr: '', price_usd: '', stock: '', category: 'socks', images: [] });
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div data-testid="admin-products">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold flex items-center space-x-2 hover:shadow-lg transition-shadow"
          data-testid="add-product-button"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit' : 'New'} Product</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="name-input" />
              <input type="text" placeholder="Slug" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} required className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="slug-input" />
              <input type="number" placeholder="Price INR" value={formData.price_inr} onChange={(e) => setFormData({...formData, price_inr: e.target.value})} required className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="price-inr-input" />
              <input type="number" placeholder="Price USD" value={formData.price_usd} onChange={(e) => setFormData({...formData, price_usd: e.target.value})} required className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="price-usd-input" />
              <input type="number" placeholder="Stock" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="stock-input" />
              <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="category-select">
                <option value="socks">Socks</option>
                <option value="bags">Bags</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            <textarea placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required rows={3} className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none resize-none" data-testid="description-input" />
            <input type="text" placeholder="Image URLs (comma-separated)" value={formData.images} onChange={(e) => setFormData({...formData, images: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none" data-testid="images-input" />
            <div className="flex space-x-2">
              <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors" data-testid="save-product-button">Save</button>
              <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition-colors">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-2xl overflow-hidden" data-testid={`product-card-${product.id}`}>
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-fuchsia-100">
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
              <p className="text-purple-600 font-bold mb-2">₹{product.price_inr}</p>
              <p className="text-sm text-slate-600 mb-1">Stock: {product.stock}</p>
              <div className="flex space-x-2 mt-3">
                <button onClick={() => { setEditingProduct(product.id); setFormData({...product, images: product.images.join(', ')}); setShowForm(true); }} className="flex-1 px-3 py-2 rounded-lg bg-purple-100 text-purple-700 font-medium hover:bg-purple-200 transition-colors flex items-center justify-center space-x-1" data-testid={`edit-${product.id}`}>
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button onClick={() => handleDelete(product.id)} className="flex-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 font-medium hover:bg-red-200 transition-colors flex items-center justify-center space-x-1" data-testid={`delete-${product.id}`}>
                  <Trash className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminProducts;
