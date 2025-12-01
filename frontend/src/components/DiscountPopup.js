import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag } from 'lucide-react';
import api from '../lib/api';

const DiscountPopup = () => {
  const [popups, setPopups] = useState([]);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());

  useEffect(() => {
    fetchPopups();
  }, []);

  const fetchPopups = async () => {
    try {
      const { data } = await api.get('/popups');
      setPopups(data);
      if (data.length > 0) {
        showNextPopup(data);
      }
    } catch (error) {
      console.error('Failed to fetch popups:', error);
    }
  };

  const showNextPopup = (popupList) => {
    const availablePopups = popupList.filter(p => !dismissed.has(p.id));
    if (availablePopups.length > 0) {
      const popup = availablePopups[Math.floor(Math.random() * availablePopups.length)];
      setCurrentPopup(popup);
      
      // Auto-dismiss after duration
      setTimeout(() => {
        handleDismiss(popup.id);
      }, popup.display_duration || 5000);
    }
  };

  const handleDismiss = (popupId) => {
    setDismissed(prev => new Set([...prev, popupId]));
    setCurrentPopup(null);
  };

  return (
    <AnimatePresence>
      {currentPopup && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 100 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
          data-testid="discount-popup"
        >
          <div className="glass-panel rounded-2xl p-6 shadow-2xl border-2 border-purple-200/50">
            <button
              onClick={() => handleDismiss(currentPopup.id)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-purple-100 transition-colors"
              data-testid="dismiss-popup-button"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>

            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 animate-pulse-glow">
                <Tag className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 mb-2 text-lg">
                  {currentPopup.title}
                </h3>
                <p className="text-slate-600 text-sm mb-3">
                  {currentPopup.message}
                </p>
                {currentPopup.discount_code && (
                  <div className="flex items-center space-x-2">
                    <code className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-mono text-sm font-semibold">
                      {currentPopup.discount_code}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentPopup.discount_code);
                        // toast.success('Code copied!');
                      }}
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DiscountPopup;
