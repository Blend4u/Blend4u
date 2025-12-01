# Stripe Integration - Complete Code Guide

This guide provides the exact code you need to add Stripe payment processing to your Blend4u website.

## Method 1: Full Stripe Checkout Integration (Recommended)

### Step 1: Install Stripe Packages

```bash
# Backend
cd /app/backend
pip install stripe
pip freeze > requirements.txt

# Frontend
cd /app/frontend
yarn add @stripe/stripe-js @stripe/react-stripe-js

# Restart services
sudo supervisorctl restart backend frontend
```

### Step 2: Add Environment Variables

**Backend `/app/backend/.env`:**
```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

**Frontend `/app/frontend/.env`:**
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### Step 3: Update Backend - Add Stripe Endpoints

**Location:** `/app/backend/server.py`

Add these imports at the top:
```python
import stripe
import os
from fastapi import Request
```

Add after JWT configuration:
```python
# Stripe Configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')
```

Add these endpoints before `app.include_router(api_router)`:

```python
# ============= STRIPE ROUTES =============

@api_router.post(\"/stripe/create-payment-intent\")
async def create_payment_intent(order_data: dict, current_user: dict = Depends(get_current_user)):
    \"\"\"Create a Stripe PaymentIntent\"\"\"
    try:
        # Calculate order total
        total_amount = sum(item['price'] * item['quantity'] for item in order_data['items'])
        
        # Apply discount if provided
        if order_data.get('discount_code'):
            discount = await db.discount_codes.find_one(
                {\"code\": order_data['discount_code'].upper(), \"is_active\": True},
                {\"_id\": 0}
            )
            if discount:
                if discount['discount_type'] == 'percentage':
                    discount_amount = total_amount * (discount['discount_value'] / 100)
                else:
                    discount_amount = discount['discount_value']
                total_amount -= discount_amount
        
        # Create PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # Amount in cents/paise
            currency=order_data.get('currency', 'inr').lower(),
            metadata={
                'user_id': current_user['id'],
                'user_email': current_user['email'],
                'order_items': str(order_data['items'])
            }
        )
        
        return {
            'clientSecret': intent.client_secret,
            'paymentIntentId': intent.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post(\"/stripe/webhook\")
async def stripe_webhook(request: Request):
    \"\"\"Handle Stripe webhooks\"\"\"
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail=\"Invalid payload\")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail=\"Invalid signature\")
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Update order status
        # You can extract order info from metadata
        metadata = payment_intent.get('metadata', {})
        user_id = metadata.get('user_id')
        
        # Find pending order for this user and update
        await db.orders.update_one(
            {\"user_id\": user_id, \"status\": \"PENDING\"},
            {\"$set\": {
                \"status\": \"PAID\",
                \"payment_intent_id\": payment_intent['id'],
                \"updated_at\": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        logger.info(f\"Payment succeeded: {payment_intent['id']}\")
        
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        logger.error(f\"Payment failed: {payment_intent['id']}\")
    
    return {\"status\": \"success\"}


@api_router.get(\"/stripe/config\")
async def get_stripe_config():
    \"\"\"Get Stripe publishable key\"\"\"
    return {
        \"publishableKey\": os.environ.get('STRIPE_PUBLISHABLE_KEY', '')
    }
```

### Step 4: Update Frontend - Add Stripe Checkout

**Create new file:** `/app/frontend/src/components/StripeCheckoutForm.js`

```javascript
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const StripeCheckoutForm = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/account`,
      },
      redirect: 'if_required'
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!');
      onSuccess(paymentIntent);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className=\"space-y-6\">
      <PaymentElement />
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type=\"submit\"
        disabled={!stripe || loading}
        className=\"w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50\"
      >
        {loading ? 'Processing...' : `Pay Now`}
      </motion.button>
    </form>
  );
};

export default StripeCheckoutForm;
```

### Step 5: Update Checkout Page

**Location:** `/app/frontend/src/pages/Checkout.js`

Add imports at the top:
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckoutForm from '../components/StripeCheckoutForm';
```

Add after other state declarations:
```javascript
const [stripePromise, setStripePromise] = useState(null);
const [clientSecret, setClientSecret] = useState('');
const [showStripeForm, setShowStripeForm] = useState(false);
```

Add after useEffect:
```javascript
useEffect(() => {
  // Load Stripe
  const loadStripeConfig = async () => {
    try {
      const { data } = await api.get('/stripe/config');
      setStripePromise(loadStripe(data.publishableKey));
    } catch (error) {
      console.error('Failed to load Stripe config:', error);
    }
  };
  loadStripeConfig();
}, []);
```

Replace the `handleSubmit` function:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // First create order in database
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

    // Create order
    const { data: order } = await api.post('/orders', orderData);

    // Create Stripe PaymentIntent
    const { data: paymentData } = await api.post('/stripe/create-payment-intent', orderData);
    setClientSecret(paymentData.clientSecret);
    setShowStripeForm(true);

  } catch (error) {
    toast.error(error.response?.data?.detail || 'Order failed');
  } finally {
    setLoading(false);
  }
};
```

Add payment success handler:
```javascript
const handlePaymentSuccess = (paymentIntent) => {
  clearCart();
  navigate('/account');
};
```

Replace the submit button section with:
```javascript
{!showStripeForm ? (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type=\"submit\"
    disabled={loading}
    className=\"w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50\"
  >
    {loading ? 'Processing...' : 'Proceed to Payment'}
  </motion.button>
) : (
  stripePromise && clientSecret && (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripeCheckoutForm 
        clientSecret={clientSecret}
        onSuccess={handlePaymentSuccess}
      />
    </Elements>
  )
)}
```

---

## Method 2: External Payment Links (Quick Setup)

This method redirects users to Stripe-hosted checkout pages. Perfect for quick launch!

### Step 1: Create Payment Links in Stripe

1. Go to https://dashboard.stripe.com/payment-links
2. Create a payment link for each product
3. Copy the payment link URLs

### Step 2: Store Payment Links

**Option A: Add to Product Model**

Update `/app/backend/server.py` Product model:

```python
class Product(BaseModel):
    # ... existing fields ...
    payment_link: Optional[str] = None  # Add this line
```

**Option B: Use Database Directly**

For each product in MongoDB, add:
```javascript
{
  \"payment_link\": \"https://buy.stripe.com/YOUR_LINK_HERE\"
}
```

### Step 3: Update Product Detail Page

**Location:** `/app/frontend/src/pages/ProductDetail.js`

Replace the \"Add to Cart\" button section with:

```javascript
{product.payment_link ? (
  <a
    href={product.payment_link}
    target=\"_blank\"
    rel=\"noopener noreferrer\"
    className=\"w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 transition-all flex items-center justify-center space-x-2 text-center\"
  >
    <ShoppingCart className=\"w-5 h-5\" />
    <span>Buy Now with Stripe</span>
  </a>
) : (
  <motion.button
    whileHover={{ scale: 1.02, translateY: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={handleAddToCart}
    disabled={product.stock === 0}
    className=\"w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2\"
  >
    <ShoppingCart className=\"w-5 h-5\" />
    <span>Add to Cart</span>
  </motion.button>
)}
```

### Step 4: Update Checkout Page

**Location:** `/app/frontend/src/pages/Checkout.js`

Add a Stripe Checkout button:

```javascript
<div className=\"flex flex-col space-y-4\">
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    type=\"submit\"
    disabled={loading}
    className=\"w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg shadow-xl hover:shadow-purple-500/50 transition-all disabled:opacity-50\"
  >
    {loading ? 'Processing...' : 'Complete Order (Cash on Delivery)'}
  </motion.button>

  <div className=\"text-center text-slate-600\">OR</div>

  <a
    href=\"https://buy.stripe.com/YOUR_CHECKOUT_LINK\"
    target=\"_blank\"
    rel=\"noopener noreferrer\"
    className=\"w-full py-4 rounded-full border-2 border-purple-600 text-purple-600 font-bold text-lg hover:bg-purple-50 transition-all text-center block\"
  >
    Pay with Credit/Debit Card
  </a>
</div>
```

---

## Testing Stripe Integration

### Test Card Numbers

**Success:**
```
Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

**Declined:**
```
Card: 4000 0000 0000 0002
```

**Requires Authentication:**
```
Card: 4000 0025 0000 3155
```

### Test Indian Payment Methods

**UPI:**
- Use test UPI IDs in test mode
- Example: `success@razorpay`

**Net Banking:**
- Select any test bank
- All test banks will succeed in test mode

### Webhook Testing (Local Development)

Install Stripe CLI:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to http://localhost:8001/api/stripe/webhook
```

This will give you a webhook signing secret starting with `whsec_...`

---

## Production Checklist

Before going live with Stripe:

### 1. Activate Stripe Account
- [ ] Complete business verification
- [ ] Add bank account details
- [ ] Submit required documents
- [ ] Verify tax information

### 2. Switch to Live Keys
- [ ] Get live API keys from dashboard
- [ ] Update backend `.env` with `sk_live_...`
- [ ] Update frontend `.env` with `pk_live_...`

### 3. Setup Production Webhooks
- [ ] Add webhook endpoint in Stripe dashboard
- [ ] URL: `https://blend4u.co/api/stripe/webhook`
- [ ] Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy webhook secret to backend `.env`

### 4. Test Live Integration
- [ ] Make a real ₹1 test transaction
- [ ] Verify webhook receives event
- [ ] Check order status updates correctly
- [ ] Verify refund process (if needed)

### 5. Compliance
- [ ] Display terms clearly
- [ ] Show NO RETURNS policy
- [ ] Include GST information
- [ ] Add customer support contact

---

## Troubleshooting

### \"Stripe is not defined\" Error
**Solution:** Make sure you've installed @stripe/stripe-js:
```bash
cd /app/frontend
yarn add @stripe/stripe-js @stripe/react-stripe-js
sudo supervisorctl restart frontend
```

### \"Invalid API Key\" Error
**Solution:** Check your `.env` files have correct Stripe keys with no extra spaces

### Webhook Not Receiving Events
**Solution:** 
1. Verify webhook URL is correct
2. Check webhook secret is correct in `.env`
3. Ensure your server is accessible from internet
4. Use Stripe CLI for local testing

### Payment Succeeds But Order Not Updated
**Solution:**
1. Check webhook endpoint is working
2. Verify webhook secret matches
3. Check backend logs for errors
4. Ensure MongoDB is running

---

## Support Resources

- **Stripe Documentation:** https://stripe.com/docs
- **Stripe Test Cards:** https://stripe.com/docs/testing
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Support:** https://support.stripe.com

---

**Your Stripe integration is now complete! Test thoroughly before launching.** 🎉
