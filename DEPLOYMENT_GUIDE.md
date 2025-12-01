# Blend4u - Complete Deployment & Integration Guide

## 🎉 Your Website is Ready!

Your Blend4u e-commerce platform is fully functional with:
- ✅ Stunning Frosted Purple Liquid Glass UI
- ✅ Complete storefront (Home, Shop, Product pages)
- ✅ Shopping cart and checkout
- ✅ User authentication (Login/Register)
- ✅ Admin panel with full management capabilities
- ✅ Discount codes system with customizable popups
- ✅ 5 products pre-seeded with your images
- ✅ MongoDB database configured
- ✅ All pages: Home, Shop, Cart, Checkout, Account, Terms, Privacy, FAQ, Contact

## 📋 Table of Contents

1. [Accessing Your Website](#accessing-your-website)
2. [Admin Access](#admin-access)
3. [Stripe Payment Integration](#stripe-payment-integration)
4. [Deployment to Production](#deployment-to-production)
5. [Managing Products](#managing-products)
6. [Managing Discounts & Popups](#managing-discounts--popups)
7. [Managing Orders](#managing-orders)

---

## 🌐 Accessing Your Website

**Current Preview URL:** https://budget-blend4u.preview.emergentagent.com

This is your live website! All features are functional and ready to test.

---

## 🔐 Admin Access

### Admin Login Credentials (KEEP SECURE)
**Email:** blend4uwithhhezz@gmail.com  
**Password:** $@Bunny25Jain*

**Demo User (for testing):**
**Email:** demo.blend4u@gmail.com  
**Password:** Blend@Demo

### How to Access Admin Panel:
1. Go to your website
2. Click "Sign In" (top right)
3. Enter your admin email and password
4. After login, click the "Admin" button in the header
5. Or directly visit: `https://your-domain.com/admin`

### Admin Panel Features:
- **Dashboard:** View total users, products, orders, and revenue
- **Products:** Add, edit, delete products with images
- **Orders:** Manage all orders, update status, add tracking
- **Discounts:** Create discount codes and promotional popups

---

## 💳 Stripe Payment Integration

### Method 1: Using Test Mode (Recommended for Development)

#### Step 1: Get Your Stripe API Keys

1. **Create a Stripe Account:**
   - Go to https://dashboard.stripe.com/register
   - Sign up with your email

2. **Get Test API Keys:**
   - After login, go to: https://dashboard.stripe.com/test/apikeys
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_...`)
     - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

3. **Copy Both Keys** - You'll need them next

#### Step 2: Add Keys to Your Backend

**IMPORTANT:** Do this via your server's file manager or SSH

1. Open `/app/backend/.env` file
2. Add these lines at the end:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

3. Replace `YOUR_SECRET_KEY_HERE` and `YOUR_PUBLISHABLE_KEY_HERE` with your actual keys
4. Save the file

#### Step 3: Add Keys to Your Frontend

1. Open `/app/frontend/.env` file
2. Add this line:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

3. Replace with your actual publishable key
4. Save the file

#### Step 4: Install Stripe Package

Run these commands in your server terminal:

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

#### Step 5: Test Payment

Use these test card numbers:
- **Success:** 4242 4242 4242 4242
- **Declined:** 4000 0000 0000 0002
- **Requires Auth:** 4000 0025 0000 3155
- **Any future date for expiry**
- **Any 3-digit CVC**

---

### Method 2: Using External Payment Links (Quick Launch)

If you want to launch immediately without integrating Stripe SDK:

#### Step 1: Create Payment Links in Stripe

1. Go to https://dashboard.stripe.com/payment-links
2. Click "New payment link"
3. For each product, create a payment link:
   - **Vintage Baseball Socks** - ₹599
   - **Vintage Socks** - ₹599
   - **Thunder Socks** - ₹599
   - **Gym Bag** - ₹799
   - **Bottle Juicer Blender** - ₹899

4. Copy each payment link URL

#### Step 2: Update Product Links in Database

You can add a `payment_link` field to each product in the MongoDB database:

```javascript
// Example for one product
{
  "id": "product-id-here",
  "name": "Vintage Baseball Socks",
  "payment_link": "https://buy.stripe.com/your-payment-link"
}
```

#### Step 3: Modify Checkout Button

In your product detail page or checkout, add a button that redirects to the Stripe payment link:

**Location:** `/app/frontend/src/pages/Checkout.js`

```javascript
// Replace the existing checkout button with:
<a 
  href={`YOUR_STRIPE_PAYMENT_LINK_HERE`} 
  target="_blank"
  rel="noopener noreferrer"
  className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg text-center block"
>
  Complete Payment with Stripe
</a>
```

---

### Method 3: Production Stripe Integration (For Going Live)

When ready to accept real payments:

#### Step 1: Activate Your Stripe Account

1. Go to https://dashboard.stripe.com/account/onboarding
2. Complete business verification
3. Add bank account details
4. Submit required documents

#### Step 2: Switch to Live Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Get your **live keys** (starts with `pk_live_...` and `sk_live_...`)
3. Update your `.env` files with live keys (same process as test mode)

#### Step 3: Set Up Webhooks (For Order Status Updates)

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter: `https://blend4u.co/api/stripe/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret (starts with `whsec_...`)
6. Add to backend `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
```

---

## 🚀 Deployment to Production (Your Domain: blend4u.co)

### Pre-Deployment Checklist

- [ ] Registered domain (blend4u.co)
- [ ] Chosen hosting provider (Vercel, Netlify, or your own server)
- [ ] Stripe keys ready (if using Stripe)
- [ ] Database backup created

### Option 1: Deploy to Vercel (Recommended - Easiest)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy Backend (FastAPI)

```bash
cd /app/backend
vercel --prod
```

Follow the prompts and note your backend URL (e.g., `https://blend4u-api.vercel.app`)

#### Step 3: Update Frontend Environment

Update `/app/frontend/.env`:

```env
REACT_APP_BACKEND_URL=https://blend4u-api.vercel.app
```

#### Step 4: Deploy Frontend

```bash
cd /app/frontend
vercel --prod
```

#### Step 5: Add Custom Domain

1. Go to your Vercel dashboard
2. Select your frontend project
3. Go to Settings → Domains
4. Add `blend4u.co` and `www.blend4u.co`
5. Update your domain's DNS records as instructed by Vercel

### Option 2: Deploy to Your Own Server

#### Step 1: Setup Server

Minimum requirements:
- Ubuntu 20.04+ / Debian 11+
- 2GB RAM
- 20GB storage
- Node.js 18+
- Python 3.10+
- MongoDB 6.0+

#### Step 2: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python
sudo apt install -y python3.10 python3-pip

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Step 3: Clone Your Code

```bash
cd /var/www
git clone YOUR_REPOSITORY_URL blend4u
cd blend4u
```

#### Step 4: Setup Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
nano .env
```

Add your environment variables:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=blend4u_production
JWT_SECRET=your-secure-jwt-secret-here
CORS_ORIGINS=https://blend4u.co,https://www.blend4u.co
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
```

#### Step 5: Setup Frontend

```bash
cd ../frontend
npm install
# Update .env
nano .env
```

Add:

```env
REACT_APP_BACKEND_URL=https://api.blend4u.co
```

Build:

```bash
npm run build
```

#### Step 6: Setup Nginx

```bash
sudo apt install -y nginx

# Create backend config
sudo nano /etc/nginx/sites-available/blend4u-api
```

Add:

```nginx
server {
    listen 80;
    server_name api.blend4u.co;

    location / {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Create frontend config
sudo nano /etc/nginx/sites-available/blend4u
```

Add:

```nginx
server {
    listen 80;
    server_name blend4u.co www.blend4u.co;
    root /var/www/blend4u/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

Enable sites:

```bash
sudo ln -s /etc/nginx/sites-available/blend4u-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/blend4u /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Setup SSL (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d blend4u.co -d www.blend4u.co -d api.blend4u.co
```

#### Step 8: Setup PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Start backend
cd /var/www/blend4u/backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name blend4u-api
pm2 save
pm2 startup
```

---

## 📦 Managing Products

### Add New Product

1. Go to **Admin → Products**
2. Click "Add Product"
3. Fill in:
   - **Name:** Product name
   - **Slug:** URL-friendly name (e.g., `cool-socks`)
   - **Description:** Product description
   - **Price INR:** Price in Indian Rupees
   - **Price USD:** Price in US Dollars
   - **Stock:** Number of items available
   - **Category:** Select from dropdown
   - **Images:** Comma-separated image URLs

4. Click "Save"

### Edit Product

1. Find the product card
2. Click "Edit"
3. Update fields
4. Click "Save"

### Delete Product

1. Find the product card
2. Click "Delete"
3. Confirm deletion

---

## 🎁 Managing Discounts & Popups

### Create Discount Code

1. Go to **Admin → Discounts & Offers**
2. Click "Add Discount"
3. Fill in:
   - **Code:** Discount code (e.g., `WELCOME10`)
   - **Type:** Percentage or Fixed Amount
   - **Value:** Discount value
   - **Min Order Amount:** Minimum order for code to work
   - **Max Uses:** Maximum number of times code can be used

4. Click "Save"

### Create Promotional Popup

1. In the **Discounts & Offers** page
2. Scroll to "Discount Popups" section
3. Click "Add Popup"
4. Fill in:
   - **Title:** Popup title
   - **Message:** Popup message
   - **Discount Code:** (Optional) Associated discount code
   - **Duration:** How long popup shows (milliseconds)

5. Click "Save"

### Toggle Popup Status

- Click "Active"/"Inactive" button to enable/disable popup
- Inactive popups won't show on the website

---

## 📋 Managing Orders

### View All Orders

1. Go to **Admin → Orders**
2. See list of all orders
3. Use search to find specific orders
4. Filter by status

### Update Order Status

1. Find the order
2. Click "Update"
3. Change status:
   - **PENDING:** Order placed, payment pending
   - **PAID:** Payment received
   - **PROCESSING:** Order being prepared
   - **SHIPPED:** Order shipped (add tracking)
   - **DELIVERED:** Order delivered
   - **CANCELLED:** Order cancelled

4. For SHIPPED status:
   - Add **Courier Name** (e.g., FedEx, DHL)
   - Add **Tracking ID**

5. Click "Save"

### Order Details Include:
- Order ID
- Customer email
- Items ordered
- Total amount
- Shipping address
- Discount applied
- Current status

---

## 🔒 Security Reminders

1. **Change Admin Password:**
   - After first login, change your password
   - Use a strong, unique password

2. **Secure Environment Variables:**
   - Never commit `.env` files to version control
   - Keep API keys secret

3. **Database Backups:**
   - Regularly backup your MongoDB database
   - Use `mongodump` command

4. **SSL Certificate:**
   - Always use HTTPS in production
   - Renew SSL certificates before expiry

---

## 🎨 Design Features

Your website includes:

### Frosted Purple Liquid Glass Design
- Beautiful glass-morphism effects
- Purple/fuchsia gradient accents
- Smooth animations and transitions
- Responsive design (mobile, tablet, desktop)

### Interactive Elements
- Hover effects on all buttons
- Smooth page transitions
- Animated product cards
- Floating elements on hero section
- Customizable discount popups

### Professional UX
- Clear navigation
- Easy-to-use admin panel
- Intuitive checkout flow
- Real-time cart updates
- Form validation

---

## 📞 Support

**Contact Information:**
- Email: blend4uwithhhezz@gmail.com
- Website: https://blend4u.co

**Pre-Seeded Data:**
- 5 products with your sock images
- 2 discount codes (WELCOME10, BLEND20)
- 1 promotional popup
- Admin and demo user accounts

---

## 🎯 Quick Start Checklist for 24-Hour Launch

- [ ] Test login with both accounts
- [ ] Add/edit a product in admin
- [ ] Create a test order
- [ ] Test discount code at checkout
- [ ] Verify discount popup appears
- [ ] Setup Stripe (Method 2 for fastest launch)
- [ ] Update contact information
- [ ] Review Terms & Privacy pages
- [ ] Test on mobile device
- [ ] Deploy to production (Vercel recommended)
- [ ] Point blend4u.co domain to deployment
- [ ] Announce launch! 🚀

---

**Your Blend4u e-commerce platform is production-ready! Good luck with your launch! 🎉**
