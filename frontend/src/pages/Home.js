import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Shield } from 'lucide-react';
import api from '../lib/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setFeaturedProducts(data.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 opacity-50" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent leading-tight" data-testid="hero-title">
              Blend Style with Performance
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Premium accessories designed for those who demand both quality and style. Elevate your everyday.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.05, translateY: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center space-x-2 w-full sm:w-auto"
                  data-testid="shop-now-button"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              
              <Link to="/shop">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-full glass-panel text-slate-700 font-semibold text-lg hover:bg-white/80 transition-all w-full sm:w-auto"
                >
                  Explore Collection
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 animate-float hidden lg:block">
            <div className="glass-panel p-4 rounded-2xl shadow-xl">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="absolute bottom-20 right-10 animate-float hidden lg:block" style={{ animationDelay: '1s' }}>
            <div className="glass-panel p-4 rounded-2xl shadow-xl">
              <TrendingUp className="w-8 h-8 text-fuchsia-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Premium Quality', desc: 'Only the finest materials and craftsmanship' },
              { icon: TrendingUp, title: 'Fast Shipping', desc: 'Quick delivery to your doorstep' },
              { icon: Sparkles, title: 'Exclusive Designs', desc: 'Unique products you won\'t find elsewhere' }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="glass-panel rounded-2xl p-8 text-center hover:scale-105 transition-transform"
              >
                <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-100 to-fuchsia-100 mb-4">
                  <feature.icon className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-gradient-to-b from-purple-50/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Featured Products</h2>
            <p className="text-slate-600 text-lg">Handpicked favorites from our collection</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link to={`/product/${product.slug}`}>
                  <div className="glass-panel rounded-2xl overflow-hidden hover:scale-105 transition-transform group">
                    <div className="aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-fuchsia-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-900 mb-2">{product.name}</h3>
                      <p className="text-purple-600 font-bold">₹{product.price_inr}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-semibold shadow-lg hover:shadow-purple-500/50 transition-shadow"
              >
                View All Products
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-panel rounded-3xl p-12 text-center bg-gradient-to-br from-purple-100/50 to-fuchsia-100/50"
          >
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Ready to Upgrade Your Style?</h2>
            <p className="text-slate-600 text-lg mb-8">Join thousands of satisfied customers worldwide</p>
            <Link to="/shop">
              <motion.button
                whileHover={{ scale: 1.05, translateY: -4 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transition-all"
              >
                Start Shopping
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
