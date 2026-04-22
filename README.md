# 📋 Claude Project Tracker

A collaborative project tracker for teams to share what they're working on, discover overlaps, and collaborate asynchronously through notes and comments.

## Features

✨ **Core Features:**
- 📊 **Project Listing** — Browse all team projects with search and filters
- 📝 **Project Details** — View full descriptions, status, tags, and ownership
- 💬 **Notes & Comments** — Anyone can add notes to any project
- 🏷️ **Tags & Categories** — Organize projects (Frontend, Backend, AI/ML, etc.)
- 🔄 **Status Tracking** — Mark projects as Draft, Active, Paused, or Completed
- 📈 **Analytics Dashboard** — See trending projects and team activity
- 🎯 **Open Access** — No login needed; just share a URL with your team

## Tech Stack

- **Frontend:** React 18 + Vite + React Router
- **Backend:** Supabase (PostgreSQL + managed REST API)
- **Hosting:** Vercel (frontend) + Supabase Cloud (database)
- **Styling:** Tailwind CSS

## Quick Start

### 1. Clone & Install
```bash
cd /path/to/Claude\ Project\ Tracker
npm install
```

### 2. Setup Supabase Database
- Follow the **[SETUP_GUIDE.md](SETUP_GUIDE.md)** for detailed Supabase setup
- Run the SQL from `supabase-schema.sql` in your Supabase SQL editor

### 3. Add Environment Variables
Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```
Open http://localhost:5173

### 5. Build & Deploy to Vercel
```bash
npm run build
```
Then push to GitHub and connect to Vercel. See [SETUP_GUIDE.md](SETUP_GUIDE.md) for details.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── ProjectCard.jsx # Individual project card
│   ├── ProjectList.jsx # Grid with search/filters
│   ├── ProjectForm.jsx # Create/edit form
│   └── NotesList.jsx   # Comments section
├── pages/              # Page-level components (full routes)
│   ├── Home.jsx        # Project listing page
│   ├── CreateProject.jsx
│   ├── EditProject.jsx
│   ├── ProjectDetail.jsx
│   └── Analytics.jsx   # Team insights
├── hooks/              # Custom React hooks
│   └── useData.js      # Supabase queries & mutations
├── lib/
│   └── supabaseClient.js # Supabase configuration
├── App.jsx             # Router setup
├── main.jsx            # Entry point
└── index.css           # Tailwind styles
```

## Database Schema

```
users
├── id (UUID)
├── name
├── email (unique)
└── created_at

projects
├── id (UUID)
├── owner_id (FK → users)
├── title
├── description
├── status (draft|active|paused|completed)
├── created_at
└── updated_at

tags
├── id (UUID)
└── name

project_tags (many-to-many)
├── project_id (FK)
└── tag_id (FK)

notes
├── id (UUID)
├── project_id (FK)
├── author_name
├── content
└── created_at
```

## Access Control

- **Read:** Everyone can view all projects, tags, and notes
- **Create:** Anyone can create a new project (no auth required)
- **Edit:** Only the project owner can edit/update
- **Delete:** Only the project owner can delete
- **Notes:** Anyone can add notes to any project

## Available Scripts

- `npm run dev` — Start development server with hot reload
- `npm run build` — Build for production (`dist/` folder)
- `npm run preview` — Preview production build locally

## Deployment

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for:
- Step-by-step Supabase setup
- Local development instructions
- Vercel deployment guide
- Sharing with your team

## Roadmap (Future Enhancements)

- [ ] Real-time collaboration (Supabase subscriptions)
- [ ] User authentication (email or SSO)
- [ ] User profiles with contribution stats
- [ ] Email notifications
- [ ] Full-text search
- [ ] Project history & audit logs
- [ ] Custom tags per team
- [ ] Export/import functionality

## Contributing

This is a team project tracker. Feel free to:
- Add projects and notes
- Suggest improvements via comments
- Extend features locally

## License

Open source for your team's use.

---

**Built with ❤️ for collaborative teams**

Questions? See [SETUP_GUIDE.md](SETUP_GUIDE.md#troubleshooting) for troubleshooting.
