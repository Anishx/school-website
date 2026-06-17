# Deploy to Vercel via GitHub

## 1. Push to GitHub

```bash
cd /Users/ar/Documents/TestCCCode/SchoolTest/frontend

# Create a new repo on GitHub (use gh CLI or github.com)
gh repo create school-website --public --source=. --push

# Or manually:
git remote add origin https://github.com/YOUR_USERNAME/school-website.git
git branch -M main
git push -u origin main
```

## 2. Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `school-website` repo
4. Vercel auto-detects Next.js — no config needed
5. Click **Deploy**

## 3. Auto-deployment

Once connected, every push to `main` triggers an automatic deployment. PRs get preview URLs.

## 4. Custom domain (optional)

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add your domain (e.g., `schoolname.edu.in`)
3. Update DNS records as shown by Vercel

## Notes

- **Framework:** Next.js 16 (auto-detected)
- **Build command:** `next build` (default)
- **Output dir:** `.next` (default)
- **Node version:** 18+ required
- **No environment variables needed** for this build
