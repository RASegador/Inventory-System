# Stock It — Stock Manifest

A warehouse inventory tracker: items, categories, reorder alerts, and a stock movement ledger.

Data is saved in the browser's `localStorage`, so it's private to whoever is using that browser — nothing is synced between visitors. If you later want everyone on your team to see the same inventory, that requires swapping `localStorage` for a real database (see note at the bottom).

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

## Deploy to Vercel

**Option A — no GitHub account needed, from your computer:**

```bash
npm install -g vercel
cd depot-app
vercel
```

Follow the prompts (log in / sign up when asked). It'll give you a live URL in under a minute. Running `vercel --prod` promotes it to your permanent production URL.

**Option B — via GitHub (recommended if you'll keep editing it):**

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), sign in, and import that repo.
3. Vercel auto-detects Vite — leave the defaults (Build Command: `npm run build`, Output Directory: `dist`) and click **Deploy**.
4. Every future push to the repo redeploys automatically.

## Multi-user / shared data

Right now each browser has its own separate inventory (via `localStorage`). If you want one shared inventory that a whole team sees and edits, you'll need a backend — something like [Supabase](https://supabase.com) or [Firebase](https://firebase.google.com) both have generous free tiers and plug into React in an afternoon. Ask if you'd like help wiring one in.
