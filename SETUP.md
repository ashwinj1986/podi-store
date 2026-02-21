# Podi Store — Complete Setup Guide

Follow these steps in order to get your website running.

---

## Step 1 — Install Node.js

Node.js is the runtime that powers your website.

1. Go to https://nodejs.org
2. Download the **LTS** version (recommended for most users)
3. Run the installer and follow the prompts
4. Open a new terminal / command prompt and verify:
   ```
   node --version   # should print v20.x.x or higher
   npm --version    # should print 10.x.x or higher
   ```

---

## Step 2 — Install Project Dependencies

Open a terminal in this project folder and run:

```bash
npm install
```

This downloads all the libraries needed (Next.js, Tailwind, Supabase SDK, etc.).

---

## Step 3 — Create a Supabase Account & Project

Supabase is your free database + storage provider.

1. Go to https://supabase.com and sign up (free)
2. Click **New Project** → give it a name (e.g. `podi-store`) → set a password → choose a region close to India (e.g. **ap-south-1 Mumbai**)
3. Wait for the project to be created (~1 minute)

---

## Step 4 — Set Up the Database

1. In your Supabase project, go to **SQL Editor** → click **New Query**
2. Copy the entire contents of `supabase/schema.sql` and paste it into the editor
3. Click **Run** — this creates all your tables, policies, and default settings

---

## Step 5 — Create Storage Buckets

You need two storage buckets for images.

1. In Supabase, go to **Storage** → click **New Bucket**
2. Create bucket named: `product-images` — set it to **Public**
3. Create another bucket named: `payment-screenshots` — set it to **Public**

---

## Step 6 — Get Your API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (long string)
   - **service_role** key (long string — keep this secret!)

---

## Step 7 — Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and fill in your values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

---

## Step 8 — Create Your Admin Account

1. In Supabase, go to **Authentication** → **Users** → click **Add User**
2. Enter your email and a strong password
3. This is the account you'll use to log in to `/admin`

---

## Step 9 — Update Your Business Details

Before running, update these two files with your actual information:

**WhatsApp number** — search for `919876543211` in the codebase and replace with your number (include country code, no +).

Files to update:
- `src/app/page.tsx` (two places)
- `src/app/cart/page.tsx`
- `src/app/order-confirmed/page.tsx`
- `src/components/Footer.tsx`
- `src/app/products/[slug]/page.tsx` — update `WHATSAPP_PHONE`

Then go to `/admin/settings` after login to update UPI ID and WhatsApp number in the database.

---

## Step 10 — Run Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser. Your site is running!

- Visit `/admin` to log in and add your products
- Add a product first, then add SKUs to it

---

## Step 11 — Deploy to Vercel (Free Hosting)

1. Push your code to GitHub (create a free account at github.com)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on GitHub, then:
   git remote add origin https://github.com/your-username/podi-store.git
   git push -u origin main
   ```

2. Go to https://vercel.com → sign up with GitHub → click **New Project**
3. Import your GitHub repo
4. In the **Environment Variables** section, add the same 3 variables from your `.env.local`
5. Click **Deploy**

Your site will be live at a free URL like `podi-store.vercel.app`!

---

## Step 12 — Add Your First Product

1. Go to `yoursite.vercel.app/admin`
2. Log in with the email/password you created in Step 8
3. Go to **Products** → click **+ Add Product**
4. Fill in the name, description, ingredients, shelf life, and upload a photo
5. After saving, click **+ Add SKU** to add sizes (e.g. 100g for ₹80, 250g for ₹180)
6. Your product is now live on the website!

---

## Customising Your Brand

To update the site name from "Podi Store" to your actual brand name:
- `src/app/layout.tsx` — update `title` and `description` in metadata
- `src/components/Navbar.tsx` — update the logo text
- `src/components/Footer.tsx` — update the brand name and address

---

## Quick Reference

| URL | What it does |
|-----|-------------|
| `/` | Home page |
| `/products` | All products |
| `/products/idli-podi` | Individual product page |
| `/cart` | Shopping cart |
| `/checkout` | Checkout with UPI payment |
| `/about` | About your business |
| `/contact` | Contact / enquiry form |
| `/admin` | Admin login |
| `/admin/orders` | View and manage orders |
| `/admin/products` | Add / edit products and SKUs |
| `/admin/enquiries` | View customer enquiries |
| `/admin/settings` | Update UPI ID and WhatsApp number |
