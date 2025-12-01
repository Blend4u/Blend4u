import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', courier_name: '', tracking_id: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedStatus]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(o => o.status === selectedStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(o =>
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredOrders(filtered);
  };

  const handleUpdateStatus = async (orderId) => {
    try {
      await api.put(`/admin/orders/${orderId}`, statusUpdate);
      toast.success('Order updated successfully');
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      PAID: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-purple-100 text-purple-700',
      SHIPPED: 'bg-indigo-100 text-indigo-700',
      DELIVERED: 'bg-emerald-100 text-emerald-700',
      CANCELLED: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div data-testid="admin-orders">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Orders Management</h1>

      <div className="glass-panel rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              data-testid="search-orders"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 rounded-xl border border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            data-testid="status-filter"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-panel rounded-2xl p-6"
            data-testid={`order-${order.id}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Order ID</p>
                <p className="font-mono font-semibold text-slate-900">{order.id}</p>
                <p className="text-sm text-slate-600 mt-1">{order.user_email}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <button
                  onClick={() => {
                    setEditingOrder(order.id);
                    setStatusUpdate({ status: order.status, courier_name: order.courier_name || '', tracking_id: order.tracking_id || '' });
                  }}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                  data-testid={`edit-order-${order.id}`}
                >
                  Update
                </button>
              </div>
            </div>

            {editingOrder === order.id && (
              <div className="border-t border-purple-100 pt-4 mt-4 space-y-3">
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none"
                  data-testid="status-select"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <input
                  type="text"
                  placeholder="Courier Name"
                  value={statusUpdate.courier_name}
                  onChange={(e) => setStatusUpdate({...statusUpdate, courier_name: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none"
                  data-testid="courier-input"
                />
                <input
                  type="text"
                  placeholder="Tracking ID"
                  value={statusUpdate.tracking_id}
                  onChange={(e) => setStatusUpdate({...statusUpdate, tracking_id: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:border-purple-400 outline-none"
                  data-testid="tracking-input"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(order.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
                    data-testid="save-order-button"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="border-t border-purple-100 pt-4 mt-4">
              <div className="space-y-2 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-slate-600 text-sm">
                    <span>{item.product_name} x {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="text-xl font-bold text-purple-600">₹{order.total_amount}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
