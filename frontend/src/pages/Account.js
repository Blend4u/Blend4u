import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const Account = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen py-12 px-4" data-testid="account-page">
      <div className="max-w-6xl mx-auto">
        <div className="glass-panel rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{user?.full_name || 'My Account'}</h1>
              <p className="text-slate-600">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Package className="w-6 h-6 text-purple-600" />
            <span>My Orders</span>
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-purple-100 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  data-testid={`order-${order.id}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Order ID</p>
                      <p className="font-mono font-semibold text-slate-900">{order.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span>{item.product_name} x {item.quantity}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-purple-100 pt-4 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-xl font-bold text-purple-600">₹{order.total_amount}</p>
                    </div>
                    {order.tracking_id && (
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Tracking ID</p>
                        <p className="font-mono text-sm font-semibold">{order.tracking_id}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-600">
              <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
