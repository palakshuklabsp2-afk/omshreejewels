# OM SHREE JEWELS

Premium imitation jewellery store: Next.js + Neon (Postgres) + Razorpay + Cloudinary.

## Run on this PC

```bash
npm install
npm run dev
```

Open:

- Shop: http://localhost:3000
- Admin: http://localhost:3000/admin/login

Put `DATABASE_URL` from Neon in `.env.local` before starting. Customer login uses on-screen OTP.

Until Razorpay keys are added, checkout uses a local demo payment.

## Keys you need (and which are free)

| What | Why | Where to get it (free tier) | Required to start locally? |
| --- | --- | --- | --- |
| `DATABASE_URL` | Products, customers, orders | [Neon](https://console.neon.tech) → New Project → Connect → copy URI | Yes |
| `SESSION_SECRET` | Login cookies | Any 32+ random characters | Yes (already set in `.env.local`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Admin portal | You choose; set in `.env.local` | Yes |
| `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` + `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Real payments + ₹200 COD advance | [Razorpay Dashboard](https://dashboard.razorpay.com/) → API Keys. **Test mode is free**. Live mode needs KYC. | No (demo checkout works) |
| `CLOUDINARY_CLOUD_NAME` + `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` | Product and category photo hosting | [Cloudinary](https://cloudinary.com/users/register_free) free plan | Yes for live photo hosting (already set locally) |
| `MSG91_AUTH_KEY` + `MSG91_TEMPLATE_ID` | SMS OTP later | [MSG91](https://msg91.com/) (India). Leave unused while `OTP_PROVIDER=display`. | No |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL / cookies | Your live URL, e.g. `https://your-app.vercel.app` | Use `http://localhost:3000` locally |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Floating WhatsApp button | Store number with country code | Optional |

**Do not use Twilio.** OTP is on-screen until you switch `OTP_PROVIDER=msg91`.

Never put `RAZORPAY_KEY_SECRET`, Neon passwords, or Cloudinary secrets in frontend code. Only `NEXT_PUBLIC_*` values are visible in the browser.

## Where to host for free

Best free combo for this Next.js app:

1. **Website: [Vercel](https://vercel.com)** (Hobby) — made for Next.js. Connect GitHub, import this folder, add the env vars from `.env.example`, deploy.
2. **Database: [Neon](https://console.neon.tech)** — free Postgres. Copy the connection string into `DATABASE_URL`.
3. **Images: [Cloudinary](https://cloudinary.com)** — free CDN + compression + WebP for product/category photos.
4. **Payments: Razorpay test keys** on Vercel until KYC is done, then swap to live keys.
5. **OTP:** keep `OTP_PROVIDER=display` on Vercel until MSG91 is ready (customers will see the code on the login page).

Other free options if you do not want Vercel:

- **Netlify** also runs Next.js; Neon + Cloudinary stay the same.
- **Render** free web service works but sleeps on idle.

HTTPS is automatic on Vercel. Set `NEXT_PUBLIC_APP_URL` to the `https://` URL.

## Production checklist

- Paste a real Neon `DATABASE_URL` (must include `sslmode=require` or Neon’s URI as shown in the dashboard).
- Change `SESSION_SECRET` to a long random value.
- Add Razorpay live/test keys.
- Keep Cloudinary keys so admin image upload goes to the CDN.
- Keep admin password only in environment variables.

Homepage never loads more than 20 featured products. Shop, search, admin lists, and orders are paginated.
