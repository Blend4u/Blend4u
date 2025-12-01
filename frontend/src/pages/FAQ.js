import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is your return policy?',
      answer: 'All sales are final. We do not accept returns or offer refunds except for documented manufacturing defects or verified shipping damage reported within 7 calendar days of delivery with photographic evidence.'
    },
    {
      question: 'How long does shipping take?',
      answer: 'Shipping typically takes 5-7 business days within India. International shipping times vary by location.'
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to select international destinations. Shipping costs and delivery times vary by location.'
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can also view your order status in your account dashboard.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure payment gateway.'
    },
    {
      question: 'How do I use a discount code?',
      answer: 'Enter your discount code at checkout in the designated field. The discount will be applied to your order total automatically.'
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4" data-testid="faq-page">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-600 text-lg">Find answers to common questions</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-purple-50/50 transition-colors"
                data-testid={`faq-question-${index}`}
              >
                <span className="font-semibold text-slate-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-purple-600 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-slate-600 leading-relaxed" data-testid={`faq-answer-${index}`}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
