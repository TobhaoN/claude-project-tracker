# 🚀 Quick Start Checklist

Follow these steps to get your Claude Project Tracker running in ~15 minutes.

## Step 1: Create Supabase Project (5 minutes)

- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Click "New Project"
- [ ] Sign in with GitHub/Google
- [ ] Name it `claude-project-tracker`
- [ ] Create a strong password
- [ ] Select your region
- [ ] Wait for project to initialize (it'll email you)

## Step 2: Set Up Database (5 minutes)

- [ ] Open your Supabase project dashboard
- [ ] Go to **SQL Editor** → **New Query**
- [ ] Open `supabase-schema.sql` in this repo
- [ ] Copy the entire SQL file
- [ ] Paste into Supabase SQL editor
- [ ] Click **Run**
- [ ] ✅ Database is ready!

## Step 3: Get Your API Keys (2 minutes)

- [ ] In Supabase, go to **Settings** → **API**
- [ ] Copy **Project URL** → save it
- [ ] Copy **Anon Public** key → save it

## Step 4: Configure Your React App (2 minutes)

- [ ] Open `.env.local` in your project folder
- [ ] Paste:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your_anon_key_here
  ```
- [ ] Save the file

## Step 5: Start Development Server (1 minute)

```bash
npm install        # if not done
npm run dev        # starts at http://localhost:5173
```

## Step 6: Test It Works

- [ ] Click **+ New Project**
- [ ] Create a test project
- [ ] Go back home — you should see it!
- [ ] Click on it and add a note
- [ ] Check **Analytics** page

✅ **Local development is working!**

## Step 7: Deploy to Vercel (Optional, ~5 minutes)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/claude-project-tracker
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Add environment variables (same as `.env.local`)
   - Click "Deploy"

3. **Share with your team:**
   ```
   https://your-project.vercel.app
   ```

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| `VITE_SUPABASE_URL is undefined` | Restart `npm run dev` after adding `.env.local` |
| Projects not appearing | Refresh browser, check Supabase dashboard |
| "Email already exists" error | Use a different email for the project owner |
| RLS policy errors | Re-run the SQL from `supabase-schema.sql` |

---

## Next Steps

1. **Share the URL** with your 10 colleagues
2. **Create sample projects** to show the value
3. **Encourage teams** to post their work
4. **Check Analytics** page to see activity

---

## Need Help?

- **Full setup guide:** See `SETUP_GUIDE.md`
- **Supabase docs:** https://supabase.com/docs
- **Vercel docs:** https://vercel.com/docs
- **React docs:** https://react.dev

---

**You're all set! Start creating projects. 🎉**
