# ATSForge AI

AI-powered resume and career platform designed for a Vercel-only serverless architecture.

## Features

- **Resume Builder:** Interactive multi-section resume builder with live A4 preview.
- **Resume Management:** Create, duplicate, edit, version, and export resumes.
- **ATS Scanner:** Deterministic 8-factor ATS scoring algorithm with real-time feedback.
- **AI Resume Tailor:** Align resume bullets and summaries with job descriptions.
- **Job Description Analyzer:** Extract requirements, keywords, and match rates.
- **Cover Letter Generator:** Generate role-specific cover letters (Professional, Confident, Concise).
- **LinkedIn Profile Generator:** Optimized headlines, summaries, and experience bullets.
- **Interview Preparation:** Behavioral, technical, and STAR interview questions with answers.
- **Skills Gap Analysis:** Identify missing competencies with personalized learning paths.
- **Job Search:** Explore open roles with keyword and remote filters (no automation).
- **Job Matching:** Real-time resume-to-job compatibility analysis.
- **Saved Jobs:** Bookmark and organize job opportunities.
- **Manual Application Tracker:** Track applications, interview stages, and notes.
- **Google Authentication:** Secure OAuth 2.0 / OpenID Connect with PKCE and signed JWT cookies.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS & Vanilla CSS
- **Icons:** Lucide React
- **Authentication:** Google OAuth 2.0 / OpenID Connect (PKCE) + Jose JWT
- **Database:** Vercel Postgres / Neon Serverless (`@neondatabase/serverless`, `@vercel/postgres`)
- **File Storage:** Vercel Blob (`@vercel/blob`)
- **Document Processing:** Mammoth (DOCX) & pdf-parse (PDF)
- **AI Integration:** Serverless AI Provider Gateway (Google Gemini / OpenAI compatible)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure local environment variables
cp .env.example .env.local

# 3. Start development server
npm run dev

# 4. Run test suite
npm test

# 5. Build for production
npm run build
```

## Environment Variables

Configure these in `.env.local` for local development or in Vercel Project Settings for production:

```env
# Vercel Serverless Postgres Database
POSTGRES_URL=
DATABASE_URL=

# Google OAuth 2.0 / OpenID Connect
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Session Security
AUTH_SECRET=

# Application URL
AUTH_URL=

# Vercel Blob File Storage (Optional)
BLOB_READ_WRITE_TOKEN=

# AI Provider Configuration
AI_PROVIDER=gemini
AI_API_KEY=
AI_MODEL=gemini-1.5-flash
```

## Production

The application is architected specifically for deployment on **Vercel**:
- Deploy directly by connecting the GitHub repository to Vercel.
- Connect **Vercel Postgres (Neon)** in 1 click under the Storage tab.
- Set required environment variables in Vercel Project Settings.
- Zero external servers, VPS, or background workers required.

## License

ISC
