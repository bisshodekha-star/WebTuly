# WebTuly — পার্সোনাল পোর্টফোলিও ওয়েবসাইট

দ্রুত, আধুনিক, দ্বিভাষিক (বাংলা/English) পোর্টফোলিও ওয়েবসাইট — Next.js 16 + PostgreSQL (Neon) + Vercel।

## ✨ ফিচারসমূহ

| ফিচার | বিবরণ |
| --- | --- |
| 🌐 দ্বিভাষিক | বাংলা ⇄ English এক ক্লিকে, পেজ রিলোড ছাড়াই (কুকিতে সেভ থাকে) |
| 📥 কন্টাক্ট মেসেজ | ভিজিটর ফর্ম পূরণ করে মেসেজ পাঠায় — Neon ডাটাবেসে সেভ হয় |
| 🔐 অ্যাডমিন প্যানেল | `/admin` — সব মেসেজ দেখা, পঠিত/অপঠিত, সার্চ, ফিল্টার, উত্তর, ডিলিট, লাইভ স্ট্যাটস |
| 👤 সাইন-আপ সিস্টেম | ভিজিটর অ্যাকাউন্ট খুলতে পারে (`/signup`); লগইন থাকলে মেসেজ অ্যাকাউন্টের সাথে যুক্ত হয় |
| 🚀 সুপারফাস্ট | স্ট্যাটিক জেনারেশন, সেলফ-হোস্টেড ফন্ট (কোনো এক্সটার্নাল ফন্ট রিকোয়েস্ট নেই), Vercel Edge CDN |
| 🛡 নিরাপত্তা | bcrypt পাসওয়ার্ড হ্যাশ, JWT httpOnly কুকি, রেট-লিমিট, হানিপট, বট-প্রুফ ভ্যালিডেশন |

---

## 🚀 Vercel + Neon-এ ডিপ্লয় গাইড (ধাপে ধাপে)

### ধাপ ১ — GitHub-এ কোড তুলুন

1. GitHub-এ একটা নতুন **Private** রিপো খুলুন (যেমন `webtuly-website`)।
2. এই প্রজেক্টের সব ফাইল আপলোড করুন (নিচের ফাইলগুলো **বাদ দেবেন**):
   `node_modules/`, `.next/`, `.env`, `pgdata/`, `db/`, `dev.log`
   (`.env.example` কপি করে নিজের কম্পিউটারে `.env` বানিয়ে লোকাল টেস্ট করতে পারেন, তবে `.env` কখনো GitHub-এ দেবেন না।)

### ধাপ ২ — Neon ডাটাবেস তৈরি করুন

1. https://neon.tech -এ যান → **Sign up** (GitHub দিয়ে লগইন করা সবচেয়ে সহজ)।
2. **Create project** → নাম দিন `webtuly` → Region: কাছের কোনোটা (যেমন `Singapore`) → Create।
3. ড্যাশবোর্ডে **Connection string** পাবেন — অবশ্যই **"Pooled connection"** টগল করে কপি করুন।
   দেখতে এমন হবে:
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```

### ধাপ ৩ — Vercel-এ ডিপ্লয় করুন

1. https://vercel.com → GitHub দিয়ে **Sign up / Log in**।
2. **Add New → Project** → আপনার `webtuly-website` রিপো **Import** করুন।
3. Framework Preset অটোমেটিক **Next.js** ধরা হবে — ঠিক আছে।
4. **Environment Variables** সেকশনে ৪টা ভ্যারিয়েবল যোগ করুন:

   | Name | Value |
   | --- | --- |
   | `DATABASE_URL` | (ধাপ ২-এ কপি করা Neon pooled URL) |
   | `AUTH_SECRET` | দীর্ঘ এলোমেলো স্ট্রিং (তৈরি করতে টার্মিনালে: `openssl rand -base64 32`) |
   | `ADMIN_SETUP_KEY` | নিজের পছন্দের একটা গোপন কী, যেমন `webtuly-setup-2024` |
   | `NEXT_PUBLIC_SITE_URL` | `https://আপনার-প্রজেক্ট.vercel.app` (পরে ঠিক করতে পারেন) |

5. **Deploy** চাপুন — ১-২ মিনিটে সাইট লাইভ! 🎉

### ধাপ ৪ — ডাটাবেসে টেবিল তৈরি করুন (একবার)

নিজের কম্পিউটারে প্রজেক্ট ফোল্ডারে টার্মিনাল খুলে:

```bash
npm install
set DATABASE_URL=আপনার-নিওন-পুলড-URL   # Windows (CMD)
# export DATABASE_URL='আপনার-নিওন-পুলড-URL'   # Mac/Linux

npx prisma db push
```

✅ Neon-এ `users` ও `messages` টেবিল তৈরি হয়ে যাবে।

### ধাপ ৫ — নিজের অ্যাডমিন অ্যাকাউন্ট তৈরি করুন (একবার)

ব্রাউজারে যান: **`https://আপনার-সাইট.vercel.app/admin/setup`**

1. Setup key চাইলে ধাপ ৩-এর `ADMIN_SETUP_KEY` ভ্যালুটা দিন।
2. নাম, ইমেইল, পাসওয়ার্ড দিন → **অ্যাডমিন তৈরি করুন**।
3. অটো-লগইন হয়ে অ্যাডমিন ড্যাশবোর্ডে ঢুকে যাবেন।

> ⚠️ একবার অ্যাডমিন তৈরি হলে `/admin/setup` পেজটি আর খোলা যাবে না (সবসময় লগইন পেজে রিডাইরেক্ট হবে)।
> পরে ঢুকতে: `/admin/login`

---

## 🔗 গুরুত্বপূর্ণ লিংক (ডিপ্লয়ের পর)

| পেজ | URL |
| --- | --- |
| হোমপেজ | `/` |
| সাইন আপ | `/signup` |
| লগইন | `/login` |
| অ্যাডমিন প্যানেল | `/admin` (লগইন ছাড়া `/admin/login`-এ যাবে) |
| প্রথমবার অ্যাডমিন তৈরি | `/admin/setup` |

## 📝 নিজের তথ্য আপডেট করুন

`src/content/bn.ts` ও `src/content/en.ts` ফাইলে:

- `contact.email_val` — আপনার আসল ইমেইল (এখন `hello@example.com` প্লেসহোল্ডার)
- `contact.phone_val` — আপনার আসল ফোন/হোয়াটসঅ্যাপ নম্বর (এখন `+880 1XXX-XXXXXX` প্লেসহোল্ডার)
- সোশ্যাল লিংক — `src/components/site/PortfolioPage.tsx`-এ `socials` অংশে `href="#"`-এর জায়গায় আসল লিংক
- প্রজেক্ট/অভিজ্ঞতা — একই ফাইলে `projects.items` ও `experience.items` এডিট করুন

এডিট করে GitHub-এ পুশ করলেই Vercel নিজে থেকেই নতুন ভার্সন ডিপ্লয় করে দেবে।

## 💻 লোকাল ডেভেলপমেন্ট

```bash
npm install                 # ডিপেন্ডেন্সি
cp .env.example .env        # .env বানিয়ে ভ্যালু দিন
npx prisma db push          # টেবিল তৈরি
npm run dev                 # http://localhost:3000
```

ডেমো অ্যাকাউন্ট চাইলে: `npm run seed` → অ্যাডমিন: `admin@webtuly.com` / `Admin@12345`

## ⚡ পারফরম্যান্স নোট

- হোমপেজ **স্ট্যাটিক** — সার্ভার ছাড়াই Vercel-এর Edge CDN থেকে সার্ভ হয় (মিলিসেকেন্ডে লোড)
- ফন্ট **সেলফ-হোস্টেড** (`next/font`) — Google Fonts-এর এক্সটার্নাল রিকোয়েস্ট নেই, লেআউট শিফট নেই
- পার্টিকেল অ্যানিমেশন ট্যাব লুকালে **অটো-পজ**, মোবাইলে কম পার্টিকেল, `prefers-reduced-motion` সাপোর্ট
- কোনো হেভি লাইব্রেরি নেই — পাবলিক পেজে শুধু React + ছোট CSS
- ভাষা সুইচ **ইনস্ট্যান্ট** (কুকি + ক্লায়েন্ট স্টেট), পুরনো PHP সাইটের মতো পেজ রিলোড নেই

## 🛠 টেক স্ট্যাক

Next.js 16 (App Router) · TypeScript · React 19 · Prisma ORM · PostgreSQL (Neon) · JWT (jose) · bcryptjs · Tailwind CSS 4 + কাস্টম ডিজাইন সিস্টেম
