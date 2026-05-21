# MewMew Cat Toys BD

A free-plan friendly ecommerce starter for a Bangladesh cat-toy store.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS
- UI: custom premium components + Lucide icons + Framer Motion-ready setup
- Auth: Supabase Auth
- Database: Supabase Postgres
- Orders: Next.js API route saves orders to Supabase
- Automation: Google Sheets API append after order creation
- AI Chatbot: FastAPI service, deployable on Render
- Deploy: Vercel for Next.js, Render for FastAPI, Supabase for DB/Auth

## Important security note

Do **not** commit real service keys to GitHub.

You should paste secrets into Vercel/Render environment variables, not into public frontend code.

Because private credentials were shared during setup, rotate/regenerate these before a real production launch:

- Supabase service role key
- Google service account private key

## 1. Install frontend

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

## 2. Create env file

Copy:

```bash
cp .env.example .env.local
```

Then fill these values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://crkmwxtqpyvigspjvdje.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAILS=washifur.mail@gmail.com
GOOGLE_SHEETS_ID=11uLTsgZSkjCRS0KnKG5lIaNanB9-WTmEW7nAy5LKlk0
GOOGLE_SHEETS_CLIENT_EMAIL=washifur@enhanced-digit-496906-d2.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FASTAPI_CHAT_URL=http://localhost:8000/chat
NEXT_PUBLIC_DELIVERY_FEE=80
```

## 3. Setup Supabase

1. Go to Supabase SQL Editor.
2. Open `supabase/schema.sql` from this project.
3. Run the full SQL.
4. In Supabase Auth settings, configure email confirmation depending on your preference.
5. For admin dashboard, signup/login with the email inside `ADMIN_EMAILS`.

## 4. Setup Google Sheet

1. Open your Google Sheet.
2. Create a sheet tab named exactly:

```txt
Orders
```

3. Add this header row:

```txt
Order ID | Created At | Customer Name | Email | Phone | Address | City | Items | Subtotal | Delivery Fee | Total | Status | Notes
```

4. Share the Google Sheet with your service account email as Editor:

```txt
washifur@enhanced-digit-496906-d2.iam.gserviceaccount.com
```

## 5. Run FastAPI chatbot locally

```bash
cd fastapi-chatbot
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Then the Next.js chat widget will call:

```txt
http://localhost:8000/chat
```

## 6. Deploy frontend on Vercel

1. Push this project to GitHub.
2. Import the repo in Vercel.
3. Add environment variables from `.env.example`.
4. Deploy.

## 7. Deploy FastAPI on Render

- Root Directory: `fastapi-chatbot`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment:

```txt
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app
STORE_NAME=MewMew Cat Toys BD
```

Then update Vercel variable:

```txt
FASTAPI_CHAT_URL=https://your-render-url.onrender.com/chat
```

## Current MVP features

- Premium homepage
- Product listing
- Product details
- Cart
- Checkout
- Supabase order database
- Google Sheets order sync
- Supabase login/signup
- Customer order history
- Admin dashboard
- FAQ page
- Delivery/return policy page
- AI chat widget
- FastAPI chatbot service

## Next improvements

- Add real product images and inventory
- Add SSLCommerz, bKash, or ShurjoPay payment
- Add courier tracking
- Add product management inside admin dashboard
- Add email/SMS confirmation
