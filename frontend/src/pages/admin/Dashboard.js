import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import api from '../../lib/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { title: 'Total Products', value: stats?.total_products || 0, icon: Package, color: 'from-purple-500 to-fuchsia-500' },
    { title: 'Total Orders', value: stats?.total_orders || 0, icon: ShoppingBag, color: 'from-emerald-500 to-teal-500' },
    { title: 'Revenue', value: `₹${stats?.total_revenue || 0}`, icon: DollarSign, color: 'from-amber-500 to-orange-500' }
  ];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your store</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel rounded-2xl p-6 hover:scale-105 transition-transform"
              data-testid={`stat-card-${idx}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Active</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {stats && stats.pending_orders > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 glass-panel rounded-2xl p-6 border-2 border-amber-200"
        >
          <h3 className="font-bold text-slate-900 mb-2">⚠️ Pending Orders</h3>
          <p className="text-slate-600">You have {stats.pending_orders} pending order(s) that need attention.</p>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
