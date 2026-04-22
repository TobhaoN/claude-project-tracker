# Claude Project Tracker - Setup & Deployment Guide

## Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Local Development](#local-development)
3. [Environment Variables](#environment-variables)
4. [Deployment to Vercel](#deployment-to-vercel)
5. [Sharing with Your Team](#sharing-with-your-team)
6. [Troubleshooting](#troubleshooting)

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Sign in with your GitHub, Google, or Supabase account
4. Fill in:
   - **Project Name:** `claude-project-tracker` (or your preferred name)
   - **Password:** Create a secure password (you'll need this)
   - **Region:** Choose the region closest to you (or `us-east-1`)
5. Click **"Create New Project"** (this takes ~1 minute)

### Step 2: Create the Database Schema

Once your project is ready:

1. In the Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql` (from this repo)
4. Paste it into the SQL editor
5. Click **"Run"** (the play button)
6. ✅ Your database is now set up!

**What was created:**
- `users` — Track project owners
- `projects` — Store all projects
- `tags` — Categories (Frontend, Backend, etc.)
- `project_tags` — Link projects to multiple tags
- `notes` — Comments/notes on projects

All tables have Row Level Security (RLS) enabled so:
- **Everyone can see** all projects and notes
- **Only the owner can edit/delete** their own projects
- **Anyone can add notes** without authentication

### Step 3: Get Your API Keys

1. In Supabase dashboard, click **"Settings"** (left sidebar, bottom)
2. Click **"API"**
3. Copy these values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **Anon Public** → This is your `VITE_SUPABASE_ANON_KEY`

Keep these handy for the next steps!

---

## Local Development

### Prerequisites
- Node.js (v16+) and npm installed
- Your Supabase API credentials from above

### Step 1: Install Dependencies

```bash
cd /path/to/Claude\ Project\ Tracker
npm install
```

This installs:
- React & React Router
- Vite (fast dev server)
- Supabase client
- TanStack Query (data fetching)
- Tailwind CSS (styling)

### Step 2: Configure Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholders:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```
3. Save the file

⚠️ **Security note:** The `VITE_SUPABASE_ANON_KEY` is intentionally public (for frontend use). It only allows reads; writes are protected by RLS policies.

### Step 3: Start the Dev Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Step 4: Test It Out

1. **Create a project:**
   - Click "+ New Project"
   - Fill in: title, description, status, tags, your name, and email
   - Click "Create Project"

2. **View all projects:**
   - Go to the home page
   - You should see your new project!

3. **Add a note:**
   - Click on a project
   - Enter your name and a comment
   - Click "Post Note"

4. **Try filters:**
   - Search by title
   - Filter by status
   - Filter by tags
   - Sort by newest/trending

✅ If everything works locally, you're ready to deploy!

---

## Environment Variables

### Development (.env.local)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Production (Vercel)
You'll set these in the Vercel dashboard (see Deployment section).

**Why `VITE_` prefix?**
Vite only exposes env vars that start with `VITE_` to the frontend (safety feature).

---

## Deployment to Vercel

### Prerequisites
- A GitHub account
- Your project pushed to GitHub

### Step 1: Push to GitHub

```bash
cd /path/to/Claude\ Project\ Tracker

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Project tracker app"

# Create a repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/claude-project-tracker.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"New Project"**
4. Find and import your `claude-project-tracker` repo
5. Click **"Import"**

### Step 3: Configure Environment Variables

In the Vercel import dialog:

1. Scroll to **"Environment Variables"**
2. Add:
   - **Name:** `VITE_SUPABASE_URL` | **Value:** `https://your-project.supabase.co`
   - **Name:** `VITE_SUPABASE_ANON_KEY` | **Value:** `your_anon_key_here`
3. Click **"Deploy"**

Vercel will build and deploy automatically (takes ~2-3 minutes).

### Step 4: Get Your Live URL

Once deployed, Vercel gives you a URL like:
```
https://claude-project-tracker.vercel.app
```

✅ Your app is now live!

---

## Sharing with Your Team

### Share the Live URL

Send this link to your 10 colleagues:
```
https://claude-project-tracker.vercel.app
```

**No setup needed!** They just:
1. Click the link
2. Create/view/comment on projects
3. No login, no downloads

### Optional: Custom Domain

If you want a branded URL (e.g., `projects.yourcompany.com`):
1. In Vercel dashboard, go to your project's settings
2. Navigate to "Domains"
3. Add your custom domain (requires DNS setup)

---

## How Your Team Uses It

1. **Browse projects:** Visit the home page to see all ongoing work
2. **Create project:** Click "+ New Project" and fill in details
3. **Discover overlaps:** Search/filter to find related projects
4. **Collaborate:** Add notes to projects you're interested in
5. **Track progress:** View project status (Active, Paused, Completed, Draft)
6. **Analytics:** Check trending projects and team activity

---

## Troubleshooting

### "VITE_SUPABASE_URL is undefined"
- Check `.env.local` exists in your project root
- Restart `npm run dev`
- Make sure you've pasted the correct URL and key

### "Cannot read properties of undefined (reading 'eq')"
- This means Supabase client isn't initialized
- Verify your env vars are correct
- Check that your Supabase project is active

### Projects not appearing after creation
- Check Supabase dashboard → Tables → "projects" (does data exist?)
- Check browser console for errors (F12)
- Try refreshing the page
- Verify RLS policies are enabled (see supabase-schema.sql)

### "Email already exists" error
- You're creating a project with the same email twice
- This is by design (same person = same user record)
- Use a different email or check the current user

### Deployment fails on Vercel
- Go to Vercel dashboard → your project → Deployments
- Click the failed deployment to see error logs
- Common issues:
  - Missing environment variables (re-add them)
  - Missing dependencies in package.json (run `npm install` locally)
  - Incorrect Node.js version (Vercel defaults to v18, which is fine)

### Notes not saving
- Check browser dev tools (F12) → Network tab
- Look for failed requests to Supabase
- Verify project_id is being passed correctly

---

## Next Steps

### Enhance the app:
1. **Real-time updates** — Use Supabase subscriptions so changes appear instantly
2. **User profiles** — Add profile pages for each team member
3. **Email notifications** — Notify project owner when someone adds a note
4. **Search full-text** — Use Supabase full-text search for better search
5. **Project history** — Track who changed what and when

### Scale for security:
1. **Add authentication** — Use Supabase Auth (email or SSO)
2. **Fine-grained permissions** — Role-based access control (admin, member, viewer)
3. **Audit logs** — Track all changes for compliance

### Operational:
1. **Backups** — Enable Supabase automated backups
2. **Monitoring** — Set up Vercel performance monitoring
3. **CI/CD** — Automatically run tests on push

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **React Router Docs:** https://reactrouter.com
- **Tailwind CSS Docs:** https://tailwindcss.com

Good luck with your project tracker! 🚀
