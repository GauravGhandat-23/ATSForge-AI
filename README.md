# ATSForge AI

AI-powered resume, ATS, and career platform built for production deployment on **Vercel** with real Google OAuth 2.0 authentication and Neon PostgreSQL persistence.

- **Production URL:** [https://ats-forge-ai.vercel.app](https://ats-forge-ai.vercel.app)
- **Repository:** [https://github.com/GauravGhandat-23/ATSForge-AI.git](https://github.com/GauravGhandat-23/ATSForge-AI.git)

---

## Features

- **Resume Builder:** Interactive multi-section builder with live A4 preview, drag-and-drop ordering, and PDF/DOCX export.
- **Resume Management:** Create, duplicate, edit, version, and export user-isolated resumes.
- **ATS Scanner:** Real-time 8-factor ATS scoring algorithm with keyword gap analysis and actionable recommendations.
- **AI Resume Tailor:** Align resume bullet points and summaries with job descriptions.
- **Job Description Analyzer:** Extract requirements, skills, technologies, and match percentages.
- **Cover Letter Generator:** Generate tailored, recruiter-ready cover letters with configurable tone (Professional, Confident, Concise).
- **LinkedIn Profile Generator:** Optimized headlines, summaries, and experience bullets.
- **Interview Preparation:** Behavioral, technical, and STAR interview question practice with AI feedback.
- **Skills Gap Analysis:** Identify missing competencies with personalized learning roadmaps.
- **Job Search:** Explore curated open roles with keyword and remote filters.
- **Job Matching:** Real-time resume-to-job compatibility analysis.
- **Saved Jobs:** Bookmark and organize job opportunities.
- **Manual Application Tracker:** Track applications, interview stages, salaries, contacts, and follow-ups.
- **Google Authentication:** Real Google OAuth 2.0 / OpenID Connect with PKCE, CSRF state verification, and secure signed JWT session cookies.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, Serverless Routes)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS & Vanilla CSS
- **Icons:** Lucide React
- **Authentication:** Google OAuth 2.0 / OpenID Connect (PKCE) + Jose JWT sessions
- **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`) connected via Vercel integration
- **File Storage:** Vercel Blob (`@vercel/blob`)
- **Document Processing:** Mammoth (DOCX) & pdf-parse (PDF)
- **AI Integration:** Multi-provider gateway (Google Gemini / OpenAI compatible)

---

## Google OAuth Configuration

In your Google Cloud Console (APIs & Services -> Credentials -> OAuth 2.0 Client IDs):

### Authorized JavaScript Origins
- Production: `https://ats-forge-ai.vercel.app`
- Local Development: `http://localhost:3000`

### Authorized Redirect URIs
- Production: `https://ats-forge-ai.vercel.app/auth/callback`
- Local Development: `http://localhost:3000/auth/callback`

---

## Environment Variables

Configure these in `.env.local` for local development or in Vercel Project Settings for production:

```env
# Database (Neon PostgreSQL automatically configured via Vercel integration)
DATABASE_URL=
POSTGRES_URL=

# Real Google OAuth 2.0 / OpenID Connect
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Session Security (32+ character random secret)
AUTH_SECRET=

# Production Application Origin & Callback
AUTH_URL=https://ats-forge-ai.vercel.app
AUTH_CALLBACK_URL=https://ats-forge-ai.vercel.app/auth/callback

# AI Provider Configuration
AI_PROVIDER=gemini
AI_API_KEY=
AI_MODEL=gemini-1.5-flash

# Vercel Blob Storage (Optional)
BLOB_READ_WRITE_TOKEN=
```

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start local development server
npm run dev

# 4. Run TypeScript checks / lint
npm run lint

# 5. Build for production
npm run build
```

---

## Production Deployment on Vercel

The application is architected specifically for deployment on **Vercel**:
1. Connect the GitHub repository `https://github.com/GauravGhandat-23/ATSForge-AI.git` to Vercel.
2. In the Vercel project **Storage** tab, connect **Neon PostgreSQL** (automatically populates `DATABASE_URL` and `POSTGRES_URL`).
3. Under **Settings -> Environment Variables**, add:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `AUTH_SECRET`
   - `AUTH_URL` (`https://ats-forge-ai.vercel.app`)
   - `AUTH_CALLBACK_URL` (`https://ats-forge-ai.vercel.app/auth/callback`)
   - `AI_API_KEY`
4. Deploy. Zero external servers, VPS, or long-running background workers required.

---

## License

ISC
