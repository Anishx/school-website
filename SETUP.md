# Setup & Deploy Instructions

## On your other PC

### 1. Copy the `frontend/` folder (excluding node_modules)

The folder to copy: `SchoolTest/frontend/`  
Do NOT copy `node_modules/` or `.next/` — they'll be regenerated.

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Run locally

```bash
npx next dev --port 6017
```

Open http://localhost:6017

### 4. Push to GitHub

```bash
cd frontend
git init
git add -A
git commit -m "School website initial"
gh repo create school-website --public --source=. --push
```

Or create the repo manually on github.com, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/school-website.git
git branch -M main
git push -u origin main
```

### 5. Deploy on Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `school-website` repo
4. Vercel auto-detects Next.js — click Deploy
5. Done. Every future push to `main` auto-deploys.

### 6. Custom domain (optional)

Vercel dashboard → Project → Settings → Domains → Add your domain.

## Tech stack

- Next.js 16 + TypeScript + Tailwind CSS v4
- No environment variables needed
- Node 18+ required
