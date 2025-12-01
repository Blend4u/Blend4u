import React from 'react';
import { AlertCircle } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen py-12 px-4" data-testid="terms-page">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms & Conditions</h1>

        <div className="glass-panel rounded-2xl p-8 space-y-6">
          <div className="border-l-4 border-amber-500 pl-6 py-4 bg-amber-50 rounded-r-xl">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">NO RETURNS / NO REFUNDS</h2>
                <p className="text-slate-700 leading-relaxed">
                  Blend4u sells products as-is. All sales are final. No returns and no refunds are offered except for documented manufacturing defects or verified shipping damage reported within 7 calendar days of delivery with photographic evidence. Exceptions require admin approval and are recorded in the audit log.
                </p>
              </div>
            </div>
          </div>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing and using Blend4u (blend4u.co), you accept and agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Products and Pricing</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              All products are subject to availability. Prices are listed in INR and USD and may change without notice.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We strive to provide accurate product descriptions and images, but we do not guarantee that descriptions, images, or other content are error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Shipping and Delivery</h2>
            <p className="text-slate-600 leading-relaxed">
              Shipping costs and estimated delivery times will be provided during checkout. We are not responsible for delays caused by courier services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              Blend4u shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions regarding these terms, please contact us at blend4uwithhhezz@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
