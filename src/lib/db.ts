import fs from "fs";
import path from "path";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import {
  ResumeData,
  ResumeVersion,
  ATSAnalysisResult,
  CoverLetter,
  UserRecord,
  JobApplication,
} from "./types";

interface StorageSchema {
  users: UserRecord[];
  resumes: (ResumeData & { userId?: string })[];
  versions: (ResumeVersion & { userId?: string })[];
  scans: {
    id: string;
    userId?: string;
    resumeId?: string;
    jobTitle: string;
    score: number;
    result: ATSAnalysisResult;
    createdAt: string;
  }[];
  coverLetters: (CoverLetter & { userId?: string })[];
  applications: JobApplication[];
}

// In Vercel serverless environment, local filesystem outside /tmp is read-only
const DATA_FILE = process.env.VERCEL
  ? path.join("/tmp", "atsforge-data.json")
  : path.join(process.cwd(), "atsforge-data.json");

export class DatabaseManager {
  private isPostgres: boolean = false;
  private sqlClient: NeonQueryFunction<false, false> | null = null;
  private initPromise: Promise<void> | null = null;
  private localData: StorageSchema;

  constructor() {
    this.initPostgresClient();
    this.localData = this.getLocalData();
  }

  private initPostgresClient(): NeonQueryFunction<false, false> | null {
    if (this.sqlClient) return this.sqlClient;

    const rawDbUrl =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.NEON_DATABASE_URL;

    const dbUrl = rawDbUrl?.trim().replace(/^["']|["']$/g, "");

    if (dbUrl && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
      try {
        this.sqlClient = neon(dbUrl);
        this.isPostgres = true;
        return this.sqlClient;
      } catch (err) {
        console.warn(
          "[DatabaseManager] Could not initialize Neon Postgres connection. Falling back to local store.",
          err
        );
      }
    } else if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
      console.warn(
        "[DatabaseManager] WARNING: No PostgreSQL connection URL found in production. Ensure Neon Postgres is connected in Vercel project settings."
      );
    }
    return null;
  }

  private async ensureTables(): Promise<void> {
    const sql = this.initPostgresClient();
    if (!this.isPostgres || !sql) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            google_id VARCHAR(128) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            first_name VARCHAR(128),
            last_name VARCHAR(128),
            avatar_url TEXT,
            email_verified BOOLEAN DEFAULT TRUE,
            settings JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            last_login_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        // Migrate settings column if table existed previously without it
        try {
          await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;`;
        } catch {
          // Ignored if column already exists
        }

        await sql`
          CREATE TABLE IF NOT EXISTS resumes (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            target_role VARCHAR(255),
            target_company VARCHAR(255),
            ats_score INTEGER,
            template_id VARCHAR(64) DEFAULT 'ats-classic',
            data JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            last_edited TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS resume_versions (
            id VARCHAR(64) PRIMARY KEY,
            resume_id VARCHAR(64) NOT NULL,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            version_number INTEGER NOT NULL,
            label VARCHAR(255),
            target_role VARCHAR(255),
            ats_score INTEGER,
            snapshot JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS ats_scans (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            resume_id VARCHAR(64),
            job_title VARCHAR(255) NOT NULL,
            score INTEGER NOT NULL,
            result JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS cover_letters (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            resume_id VARCHAR(64),
            job_title VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            tone VARCHAR(64) DEFAULT 'Professional',
            content TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS applications (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            company VARCHAR(255) NOT NULL,
            job_title VARCHAR(255) NOT NULL,
            job_url TEXT,
            location VARCHAR(255),
            application_date VARCHAR(64),
            status VARCHAR(64) NOT NULL DEFAULT 'Applied',
            notes TEXT,
            interview_date VARCHAR(64),
            salary VARCHAR(128),
            contact VARCHAR(255),
            follow_up_date VARCHAR(64),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS saved_jobs (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            job_id VARCHAR(64) NOT NULL,
            title VARCHAR(255) NOT NULL,
            company VARCHAR(255) NOT NULL,
            location VARCHAR(255),
            salary VARCHAR(128),
            url TEXT,
            description TEXT,
            skills JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS interview_prep (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            resume_id VARCHAR(64),
            job_description TEXT,
            questions JSONB NOT NULL,
            practice_sessions JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        await sql`
          CREATE TABLE IF NOT EXISTS skills_gap (
            id VARCHAR(64) PRIMARY KEY,
            user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            resume_id VARCHAR(64),
            job_description TEXT,
            gap_items JSONB NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `;

        // Ensure performance indexes exist
        await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON resume_versions(user_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_ats_scans_user_id ON ats_scans(user_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);`;
      } catch (e) {
        console.warn("[DatabaseManager] Table auto-provisioning note:", e);
      }
    })();

    return this.initPromise;
  }

  // --- LOCAL FALLBACK FILE PERSISTENCE ---
  private getLocalData(): StorageSchema {
    try {
      const exists = fs.existsSync(DATA_FILE);
      if (exists) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        this.localData = {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          resumes: Array.isArray(parsed.resumes) ? parsed.resumes : [],
          versions: Array.isArray(parsed.versions) ? parsed.versions : [],
          scans: Array.isArray(parsed.scans) ? parsed.scans : [],
          coverLetters: Array.isArray(parsed.coverLetters) ? parsed.coverLetters : [],
          applications: Array.isArray(parsed.applications) ? parsed.applications : [],
        };
        return this.localData;
      } else {
        console.warn("[DatabaseManager] DATA_FILE does not exist at:", DATA_FILE);
      }
    } catch (e) {
      console.error("[DatabaseManager] Error reading DATA_FILE:", e);
    }

    if (!this.localData) {
      this.localData = {
        users: [],
        resumes: [],
        versions: [],
        scans: [],
        coverLetters: [],
        applications: [],
      };
    }
    return this.localData;
  }

  private saveLocalData(dataToSave?: StorageSchema) {
    try {
      const data = dataToSave || this.localData;
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("[DatabaseManager] Could not save to local file:", e);
    }
  }

  // ==========================================
  // --- USER AUTHENTICATION & PROFILE OPS ---
  // ==========================================
  async findOrCreateGoogleUser(profile: {
    google_id: string;
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    email_verified?: boolean;
  }): Promise<UserRecord> {
    const normalizedEmail = profile.email.toLowerCase().trim();
    const now = new Date().toISOString();

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const sql = this.sqlClient;

      // 1. Check existing
      const existing = await sql`
        SELECT * FROM users
        WHERE google_id = ${profile.google_id} OR LOWER(email) = ${normalizedEmail}
        LIMIT 1;
      `;

      if (existing.length > 0) {
        const row = existing[0];
        const updated = await sql`
          UPDATE users
          SET google_id = ${profile.google_id},
              name = ${profile.name || row.name},
              first_name = ${profile.first_name || row.first_name || profile.name.split(" ")[0] || ""},
              last_name = ${profile.last_name || row.last_name || profile.name.split(" ").slice(1).join(" ") || ""},
              avatar_url = ${profile.avatar_url || row.avatar_url || ""},
              email_verified = ${profile.email_verified ?? true},
              last_login_at = NOW(),
              updated_at = NOW()
          WHERE id = ${row.id}
          RETURNING *;
        `;
        const u = updated[0];
        return {
          id: u.id,
          google_id: u.google_id,
          email: u.email,
          name: u.name,
          first_name: u.first_name || "",
          last_name: u.last_name || "",
          avatar_url: u.avatar_url || "",
          email_verified: Boolean(u.email_verified),
          settings: u.settings || {},
          created_at: u.created_at,
          updated_at: u.updated_at,
          last_login_at: u.last_login_at,
        };
      }

      // 2. Create new user
      const newId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const inserted = await sql`
        INSERT INTO users (
          id, google_id, email, name, first_name, last_name, avatar_url, email_verified, settings, created_at, updated_at, last_login_at
        ) VALUES (
          ${newId},
          ${profile.google_id},
          ${normalizedEmail},
          ${profile.name || "ATSForge User"},
          ${profile.first_name || profile.name.split(" ")[0] || "User"},
          ${profile.last_name || profile.name.split(" ").slice(1).join(" ") || ""},
          ${profile.avatar_url || ""},
          ${profile.email_verified ?? true},
          ${JSON.stringify({})},
          NOW(),
          NOW(),
          NOW()
        )
        RETURNING *;
      `;
      const u = inserted[0];
      return {
        id: u.id,
        google_id: u.google_id,
        email: u.email,
        name: u.name,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        avatar_url: u.avatar_url || "",
        email_verified: Boolean(u.email_verified),
        settings: u.settings || {},
        created_at: u.created_at,
        updated_at: u.updated_at,
        last_login_at: u.last_login_at,
      };
    }

    // Local fallback
    const local = this.getLocalData();
    let user = local.users.find(
      (u) => u.google_id === profile.google_id || u.email.toLowerCase() === normalizedEmail
    );

    if (user) {
      user.google_id = profile.google_id;
      user.name = profile.name || user.name;
      user.first_name = profile.first_name || user.first_name || profile.name.split(" ")[0] || "";
      user.last_name = profile.last_name || user.last_name || profile.name.split(" ").slice(1).join(" ") || "";
      if (profile.avatar_url) user.avatar_url = profile.avatar_url;
      user.email_verified = profile.email_verified ?? true;
      user.last_login_at = now;
      user.updated_at = now;
      this.saveLocalData();
      return user;
    }

    const newUser: UserRecord = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      google_id: profile.google_id,
      email: normalizedEmail,
      name: profile.name || "ATSForge User",
      first_name: profile.first_name || profile.name.split(" ")[0] || "User",
      last_name: profile.last_name || profile.name.split(" ").slice(1).join(" ") || "",
      avatar_url: profile.avatar_url || "",
      email_verified: profile.email_verified ?? true,
      settings: {},
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };

    local.users.unshift(newUser);
    this.saveLocalData();
    return newUser;
  }

  async getUserById(id: string): Promise<UserRecord | undefined> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = await this.sqlClient`SELECT * FROM users WHERE id = ${id} LIMIT 1;`;
      if (rows.length === 0) return undefined;
      const u = rows[0];
      return {
        id: u.id,
        google_id: u.google_id,
        email: u.email,
        name: u.name,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        avatar_url: u.avatar_url || "",
        email_verified: Boolean(u.email_verified),
        settings: u.settings || {},
        created_at: u.created_at,
        updated_at: u.updated_at,
        last_login_at: u.last_login_at,
      };
    }
    return this.getLocalData().users.find((u) => u.id === id);
  }

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    const normalized = email.toLowerCase().trim();
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = await this.sqlClient`SELECT * FROM users WHERE LOWER(email) = ${normalized} LIMIT 1;`;
      if (rows.length === 0) return undefined;
      const u = rows[0];
      return {
        id: u.id,
        google_id: u.google_id,
        email: u.email,
        name: u.name,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        avatar_url: u.avatar_url || "",
        email_verified: Boolean(u.email_verified),
        settings: u.settings || {},
        created_at: u.created_at,
        updated_at: u.updated_at,
        last_login_at: u.last_login_at,
      };
    }
    return this.getLocalData().users.find((u) => u.email.toLowerCase() === normalized);
  }

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<UserRecord | null> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const existing = await this.getUserById(id);
      if (!existing) return null;

      const merged = { ...existing, ...updates };
      const rows = await this.sqlClient`
        UPDATE users
        SET name = ${merged.name},
            first_name = ${merged.first_name},
            last_name = ${merged.last_name},
            avatar_url = ${merged.avatar_url},
            settings = ${JSON.stringify(merged.settings || {})},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *;
      `;
      if (rows.length === 0) return null;
      const u = rows[0];
      return {
        id: u.id,
        google_id: u.google_id,
        email: u.email,
        name: u.name,
        first_name: u.first_name || "",
        last_name: u.last_name || "",
        avatar_url: u.avatar_url || "",
        email_verified: Boolean(u.email_verified),
        settings: u.settings || {},
        created_at: u.created_at,
        updated_at: u.updated_at,
        last_login_at: u.last_login_at,
      };
    }

    const local = this.getLocalData();
    const user = local.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
    this.saveLocalData();
    return user;
  }

  async deleteAccount(userId: string): Promise<boolean> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      // Cascading foreign keys will delete all associated resumes, scans, versions, etc.
      const result = await this.sqlClient`DELETE FROM users WHERE id = ${userId} RETURNING id;`;
      return result.length > 0;
    }

    const local = this.getLocalData();
    const userIdx = local.users.findIndex((u) => u.id === userId);
    if (userIdx === -1) return false;

    local.users.splice(userIdx, 1);
    const deletedResumeIds = new Set(
      local.resumes.filter((r) => r.userId === userId).map((r) => r.id)
    );
    local.resumes = local.resumes.filter((r) => r.userId !== userId);
    local.versions = local.versions.filter(
      (v) => v.userId !== userId && !deletedResumeIds.has(v.resumeId)
    );
    local.scans = local.scans.filter((s) => s.userId !== userId);
    local.coverLetters = local.coverLetters.filter((cl) => cl.userId !== userId);
    local.applications = local.applications.filter((a) => a.userId !== userId);
    this.saveLocalData();
    return true;
  }

  // ==========================================
  // --- RESUME OPERATIONS (USER-ISOLATED) ---
  // ==========================================
  async getResumes(userId?: string): Promise<ResumeData[]> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = userId
        ? await this.sqlClient`SELECT * FROM resumes WHERE user_id = ${userId} ORDER BY last_edited DESC;`
        : await this.sqlClient`SELECT * FROM resumes ORDER BY last_edited DESC;`;

      return rows.map((r: any) => ({
        ...r.data,
        id: r.id,
        userId: r.user_id,
        title: r.title,
        targetRole: r.target_role || "",
        targetCompany: r.target_company || "",
        atsScore: r.ats_score ?? 75,
        templateId: r.template_id || "ats-classic",
        createdAt: r.created_at,
        lastEdited: r.last_edited,
      }));
    }

    const local = this.getLocalData();
    if (userId) {
      return local.resumes.filter((r) => r.userId === userId);
    }
    return local.resumes;
  }

  async getResumeById(id: string, userId?: string): Promise<ResumeData | undefined> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = userId
        ? await this.sqlClient`SELECT * FROM resumes WHERE id = ${id} AND user_id = ${userId} LIMIT 1;`
        : await this.sqlClient`SELECT * FROM resumes WHERE id = ${id} LIMIT 1;`;

      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        ...r.data,
        id: r.id,
        userId: r.user_id,
        title: r.title,
        targetRole: r.target_role || "",
        targetCompany: r.target_company || "",
        atsScore: r.ats_score ?? 75,
        templateId: r.template_id || "ats-classic",
        createdAt: r.created_at,
        lastEdited: r.last_edited,
      };
    }

    const local = this.getLocalData();
    if (userId) {
      return local.resumes.find((r) => r.id === id && r.userId === userId);
    }
    return local.resumes.find((r) => r.id === id);
  }

  async saveResume(resume: ResumeData, userId?: string): Promise<ResumeData> {
    const ownerId = userId || resume.userId || "anonymous";
    resume.userId = ownerId;
    resume.lastEdited = new Date().toISOString();

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      await this.sqlClient`
        INSERT INTO resumes (
          id, user_id, title, target_role, target_company, ats_score, template_id, data, created_at, last_edited
        ) VALUES (
          ${resume.id},
          ${ownerId},
          ${resume.title || "Untitled Resume"},
          ${resume.targetRole || ""},
          ${resume.targetCompany || ""},
          ${resume.atsScore ?? 75},
          ${resume.templateId || "ats-classic"},
          ${JSON.stringify(resume)},
          ${resume.createdAt || new Date().toISOString()},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          target_role = EXCLUDED.target_role,
          target_company = EXCLUDED.target_company,
          ats_score = EXCLUDED.ats_score,
          template_id = EXCLUDED.template_id,
          data = EXCLUDED.data,
          last_edited = NOW();
      `;
      return resume;
    }

    const local = this.getLocalData();
    const index = local.resumes.findIndex((r) => r.id === resume.id);
    if (index >= 0) {
      local.resumes[index] = resume;
    } else {
      local.resumes.unshift(resume);
    }
    this.saveLocalData();
    return resume;
  }

  async deleteResume(id: string, userId?: string): Promise<boolean> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const res = userId
        ? await this.sqlClient`DELETE FROM resumes WHERE id = ${id} AND user_id = ${userId} RETURNING id;`
        : await this.sqlClient`DELETE FROM resumes WHERE id = ${id} RETURNING id;`;
      return res.length > 0;
    }

    const local = this.getLocalData();
    const index = local.resumes.findIndex(
      (r) => r.id === id && (!userId || r.userId === userId)
    );
    if (index >= 0) {
      local.resumes.splice(index, 1);
      this.saveLocalData();
      return true;
    }
    return false;
  }

  async duplicateResume(id: string, userId?: string): Promise<ResumeData | null> {
    const original = await this.getResumeById(id, userId);
    if (!original) return null;

    const duplicate: ResumeData = {
      ...JSON.parse(JSON.stringify(original)),
      id: `res-${Date.now()}`,
      userId: userId || original.userId,
      title: `${original.title} (Copy)`,
      createdAt: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
    };

    return await this.saveResume(duplicate, userId || original.userId);
  }

  // ==========================================
  // --- RESUME VERSIONS (USER-ISOLATED) ---
  // ==========================================
  async saveVersion(
    resumeId: string,
    label: string,
    targetRole: string,
    atsScore: number,
    snapshot: ResumeData,
    userId?: string
  ): Promise<ResumeVersion> {
    const ownerId = userId || snapshot.userId || "anonymous";
    const now = new Date().toISOString();

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const countRows = await this.sqlClient`
        SELECT COUNT(*)::int as count FROM resume_versions WHERE resume_id = ${resumeId};
      `;
      const versionNumber = (countRows[0]?.count || 0) + 1;
      const verId = `ver-${Date.now()}`;

      await this.sqlClient`
        INSERT INTO resume_versions (
          id, resume_id, user_id, version_number, label, target_role, ats_score, snapshot, created_at
        ) VALUES (
          ${verId},
          ${resumeId},
          ${ownerId},
          ${versionNumber},
          ${label || `Version ${versionNumber}`},
          ${targetRole || ""},
          ${atsScore || 0},
          ${JSON.stringify(snapshot)},
          NOW()
        );
      `;

      return {
        id: verId,
        resumeId,
        versionNumber,
        label: label || `Version ${versionNumber}`,
        targetRole,
        atsScore,
        snapshot,
        createdAt: now,
      };
    }

    const local = this.getLocalData();
    const existingVersions = local.versions.filter((v) => v.resumeId === resumeId);
    const newVersion: ResumeVersion & { userId?: string } = {
      id: `ver-${Date.now()}`,
      userId: ownerId,
      resumeId,
      versionNumber: existingVersions.length + 1,
      label: label || `Version ${existingVersions.length + 1}`,
      targetRole,
      atsScore,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      createdAt: now,
    };
    local.versions.unshift(newVersion);
    this.saveLocalData();
    return newVersion;
  }

  async getVersions(resumeId: string, userId?: string): Promise<ResumeVersion[]> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = userId
        ? await this.sqlClient`SELECT * FROM resume_versions WHERE resume_id = ${resumeId} AND user_id = ${userId} ORDER BY version_number DESC;`
        : await this.sqlClient`SELECT * FROM resume_versions WHERE resume_id = ${resumeId} ORDER BY version_number DESC;`;

      return rows.map((r: any) => ({
        id: r.id,
        resumeId: r.resume_id,
        versionNumber: r.version_number,
        label: r.label,
        targetRole: r.target_role || "",
        atsScore: r.ats_score,
        snapshot: r.snapshot,
        createdAt: r.created_at,
      }));
    }

    return this.getLocalData().versions.filter(
      (v) => v.resumeId === resumeId && (!userId || v.userId === userId)
    );
  }

  // ==========================================
  // --- ATS SCANS (USER-ISOLATED) ---
  // ==========================================
  async saveAtsScan(
    jobTitle: string,
    score: number,
    result: ATSAnalysisResult,
    resumeId?: string,
    userId?: string
  ) {
    const scanId = `scan-${Date.now()}`;
    const now = new Date().toISOString();
    const ownerId = userId || "anonymous";

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      await this.sqlClient`
        INSERT INTO ats_scans (
          id, user_id, resume_id, job_title, score, result, created_at
        ) VALUES (
          ${scanId},
          ${ownerId},
          ${resumeId || null},
          ${jobTitle || "Target Role"},
          ${score || 0},
          ${JSON.stringify(result)},
          NOW()
        );
      `;
      return {
        id: scanId,
        userId: ownerId,
        resumeId,
        jobTitle,
        score,
        result,
        createdAt: now,
      };
    }

    const scan = {
      id: scanId,
      userId: ownerId,
      resumeId,
      jobTitle,
      score,
      result,
      createdAt: now,
    };
    const local = this.getLocalData();
    local.scans.unshift(scan);
    this.saveLocalData();
    return scan;
  }

  async getAtsScans(userId?: string) {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = userId
        ? await this.sqlClient`SELECT * FROM ats_scans WHERE user_id = ${userId} ORDER BY created_at DESC;`
        : await this.sqlClient`SELECT * FROM ats_scans ORDER BY created_at DESC;`;

      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        resumeId: r.resume_id,
        jobTitle: r.job_title,
        score: r.score,
        result: r.result,
        createdAt: r.created_at,
      }));
    }

    const local = this.getLocalData();
    if (userId) {
      return local.scans.filter((s) => s.userId === userId);
    }
    return local.scans;
  }

  // ==========================================
  // --- COVER LETTERS (USER-ISOLATED) ---
  // ==========================================
  async saveCoverLetter(
    letter: Omit<CoverLetter, "id" | "createdAt"> & { userId?: string },
    userId?: string
  ): Promise<CoverLetter> {
    const clId = `cl-${Date.now()}`;
    const now = new Date().toISOString();
    const ownerId = userId || letter.userId || "anonymous";

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      await this.sqlClient`
        INSERT INTO cover_letters (
          id, user_id, resume_id, job_title, company, tone, content, created_at
        ) VALUES (
          ${clId},
          ${ownerId},
          ${letter.resumeId || null},
          ${letter.jobTitle || "General Role"},
          ${letter.company || "Target Company"},
          ${letter.tone || "Professional"},
          ${letter.content},
          NOW()
        );
      `;
      return {
        ...letter,
        id: clId,
        createdAt: now,
      };
    }

    const newLetter: CoverLetter & { userId?: string } = {
      ...letter,
      userId: ownerId,
      id: clId,
      createdAt: now,
    };
    const local = this.getLocalData();
    local.coverLetters.unshift(newLetter);
    this.saveLocalData();
    return newLetter;
  }

  async getCoverLetters(userId?: string): Promise<CoverLetter[]> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = userId
        ? await this.sqlClient`SELECT * FROM cover_letters WHERE user_id = ${userId} ORDER BY created_at DESC;`
        : await this.sqlClient`SELECT * FROM cover_letters ORDER BY created_at DESC;`;

      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        resumeId: r.resume_id,
        jobTitle: r.job_title,
        company: r.company,
        tone: r.tone,
        content: r.content,
        createdAt: r.created_at,
      }));
    }

    const local = this.getLocalData();
    if (userId) {
      return local.coverLetters.filter((cl) => cl.userId === userId);
    }
    return local.coverLetters;
  }

  async deleteCoverLetter(id: string, userId?: string): Promise<boolean> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const res = userId
        ? await this.sqlClient`DELETE FROM cover_letters WHERE id = ${id} AND user_id = ${userId} RETURNING id;`
        : await this.sqlClient`DELETE FROM cover_letters WHERE id = ${id} RETURNING id;`;
      return res.length > 0;
    }

    const local = this.getLocalData();
    const index = local.coverLetters.findIndex(
      (cl) => cl.id === id && (!userId || cl.userId === userId)
    );
    if (index >= 0) {
      local.coverLetters.splice(index, 1);
      this.saveLocalData();
      return true;
    }
    return false;
  }

  // ==========================================
  // --- MANUAL JOB APPLICATIONS (USER-ISOLATED) ---
  // ==========================================
  async getApplications(userId: string): Promise<JobApplication[]> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = await this.sqlClient`
        SELECT * FROM applications WHERE user_id = ${userId} ORDER BY updated_at DESC;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        company: r.company,
        jobTitle: r.job_title,
        jobUrl: r.job_url || "",
        location: r.location || "",
        applicationDate: r.application_date || "",
        status: r.status,
        notes: r.notes || "",
        interviewDate: r.interview_date || "",
        salary: r.salary || "",
        contact: r.contact || "",
        followUpDate: r.follow_up_date || "",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }

    return this.getLocalData().applications.filter((a) => a.userId === userId);
  }

  async getApplicationById(id: string, userId: string): Promise<JobApplication | undefined> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = await this.sqlClient`
        SELECT * FROM applications WHERE id = ${id} AND user_id = ${userId} LIMIT 1;
      `;
      if (rows.length === 0) return undefined;
      const r = rows[0];
      return {
        id: r.id,
        userId: r.user_id,
        company: r.company,
        jobTitle: r.job_title,
        jobUrl: r.job_url || "",
        location: r.location || "",
        applicationDate: r.application_date || "",
        status: r.status,
        notes: r.notes || "",
        interviewDate: r.interview_date || "",
        salary: r.salary || "",
        contact: r.contact || "",
        followUpDate: r.follow_up_date || "",
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    }

    return this.getLocalData().applications.find((a) => a.id === id && a.userId === userId);
  }

  async saveApplication(
    app: Partial<JobApplication> & { company: string; jobTitle: string },
    userId: string
  ): Promise<JobApplication> {
    const now = new Date().toISOString();
    const id = app.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      await this.sqlClient`
        INSERT INTO applications (
          id, user_id, company, job_title, job_url, location, application_date, status, notes, interview_date, salary, contact, follow_up_date, created_at, updated_at
        ) VALUES (
          ${id},
          ${userId},
          ${app.company.trim()},
          ${app.jobTitle.trim()},
          ${app.jobUrl?.trim() || ""},
          ${app.location?.trim() || ""},
          ${app.applicationDate || now.split("T")[0]},
          ${app.status || "Applied"},
          ${app.notes || ""},
          ${app.interviewDate || ""},
          ${app.salary || ""},
          ${app.contact || ""},
          ${app.followUpDate || ""},
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          company = EXCLUDED.company,
          job_title = EXCLUDED.job_title,
          job_url = EXCLUDED.job_url,
          location = EXCLUDED.location,
          application_date = EXCLUDED.application_date,
          status = EXCLUDED.status,
          notes = EXCLUDED.notes,
          interview_date = EXCLUDED.interview_date,
          salary = EXCLUDED.salary,
          contact = EXCLUDED.contact,
          follow_up_date = EXCLUDED.follow_up_date,
          updated_at = NOW();
      `;

      return {
        id,
        userId,
        company: app.company.trim(),
        jobTitle: app.jobTitle.trim(),
        jobUrl: app.jobUrl?.trim() || "",
        location: app.location?.trim() || "",
        applicationDate: app.applicationDate || now.split("T")[0],
        status: app.status || "Applied",
        notes: app.notes || "",
        interviewDate: app.interviewDate || "",
        salary: app.salary || "",
        contact: app.contact || "",
        followUpDate: app.followUpDate || "",
        createdAt: now,
        updatedAt: now,
      };
    }

    const local = this.getLocalData();
    const existingIndex = app.id
      ? local.applications.findIndex((a) => a.id === app.id && a.userId === userId)
      : -1;

    if (existingIndex >= 0) {
      const updated: JobApplication = {
        ...local.applications[existingIndex],
        ...app,
        userId,
        updatedAt: now,
      };
      local.applications[existingIndex] = updated;
      this.saveLocalData();
      return updated;
    }

    const newApp: JobApplication = {
      id,
      userId,
      company: app.company.trim(),
      jobTitle: app.jobTitle.trim(),
      jobUrl: app.jobUrl?.trim() || "",
      location: app.location?.trim() || "",
      applicationDate: app.applicationDate || now.split("T")[0],
      status: app.status || "Applied",
      notes: app.notes || "",
      interviewDate: app.interviewDate || "",
      salary: app.salary || "",
      contact: app.contact || "",
      followUpDate: app.followUpDate || "",
      createdAt: now,
      updatedAt: now,
    };

    local.applications.unshift(newApp);
    this.saveLocalData();
    return newApp;
  }

  async deleteApplication(id: string, userId: string): Promise<boolean> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const res = await this.sqlClient`
        DELETE FROM applications WHERE id = ${id} AND user_id = ${userId} RETURNING id;
      `;
      return res.length > 0;
    }

    const local = this.getLocalData();
    const index = local.applications.findIndex((a) => a.id === id && a.userId === userId);
    if (index >= 0) {
      local.applications.splice(index, 1);
      this.saveLocalData();
      return true;
    }
    return false;
  }

  // ==========================================
  // --- SAVED JOBS (USER-ISOLATED) ---
  // ==========================================
  async getSavedJobs(userId: string) {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = await this.sqlClient`
        SELECT * FROM saved_jobs WHERE user_id = ${userId} ORDER BY created_at DESC;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        jobId: r.job_id,
        title: r.title,
        company: r.company,
        location: r.location || "",
        salary: r.salary || "",
        url: r.url || "",
        description: r.description || "",
        skills: r.skills || [],
        createdAt: r.created_at,
      }));
    }
    return this.getApplications(userId).then((apps) =>
      apps
        .filter((a) => a.status === "Wishlist")
        .map((a) => ({
          id: a.id,
          userId: a.userId,
          jobId: a.id,
          title: a.jobTitle,
          company: a.company,
          location: a.location,
          salary: a.salary,
          url: a.jobUrl,
          description: a.notes,
          skills: [],
          createdAt: a.createdAt,
        }))
    );
  }

  async saveSavedJob(
    job: {
      jobId: string;
      title: string;
      company: string;
      location?: string;
      salary?: string;
      url?: string;
      description?: string;
      skills?: string[];
    },
    userId: string
  ) {
    const id = `sjob-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      await this.sqlClient`
        INSERT INTO saved_jobs (
          id, user_id, job_id, title, company, location, salary, url, description, skills, created_at
        ) VALUES (
          ${id},
          ${userId},
          ${job.jobId},
          ${job.title},
          ${job.company},
          ${job.location || ""},
          ${job.salary || ""},
          ${job.url || ""},
          ${job.description || ""},
          ${JSON.stringify(job.skills || [])},
          NOW()
        );
      `;
      return { id, userId, ...job, createdAt: now };
    }

    return await this.saveApplication(
      {
        company: job.company,
        jobTitle: job.title,
        jobUrl: job.url,
        location: job.location,
        salary: job.salary,
        notes: job.description,
        status: "Wishlist",
      },
      userId
    );
  }

  async deleteSavedJob(id: string, userId: string): Promise<boolean> {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const res = await this.sqlClient`
        DELETE FROM saved_jobs WHERE (id = ${id} OR job_id = ${id}) AND user_id = ${userId} RETURNING id;
      `;
      return res.length > 0;
    }
    return this.deleteApplication(id, userId);
  }

  // ==========================================
  // --- INTERVIEW PREP (USER-ISOLATED) ---
  // ==========================================
  async saveInterviewPrep(
    prep: {
      resumeId?: string;
      jobDescription?: string;
      questions: any[];
      practiceSessions?: any[];
    },
    userId: string
  ) {
    const id = `ip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      await this.sqlClient`
        INSERT INTO interview_prep (
          id, user_id, resume_id, job_description, questions, practice_sessions, created_at, updated_at
        ) VALUES (
          ${id},
          ${userId},
          ${prep.resumeId || null},
          ${prep.jobDescription || ""},
          ${JSON.stringify(prep.questions)},
          ${JSON.stringify(prep.practiceSessions || [])},
          NOW(),
          NOW()
        );
      `;
      return { id, userId, ...prep, createdAt: now, updatedAt: now };
    }
    return { id, userId, ...prep, createdAt: now, updatedAt: now };
  }

  async getInterviewPrep(userId: string) {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = await this.sqlClient`
        SELECT * FROM interview_prep WHERE user_id = ${userId} ORDER BY updated_at DESC;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        resumeId: r.resume_id,
        jobDescription: r.job_description,
        questions: r.questions,
        practiceSessions: r.practice_sessions,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    }
    return [];
  }

  // ==========================================
  // --- SKILLS GAP (USER-ISOLATED) ---
  // ==========================================
  async saveSkillsGap(
    gap: {
      resumeId?: string;
      jobDescription?: string;
      gapItems: any[];
    },
    userId: string
  ) {
    const id = `sg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      await this.sqlClient`
        INSERT INTO skills_gap (
          id, user_id, resume_id, job_description, gap_items, created_at
        ) VALUES (
          ${id},
          ${userId},
          ${gap.resumeId || null},
          ${gap.jobDescription || ""},
          ${JSON.stringify(gap.gapItems)},
          NOW()
        );
      `;
      return { id, userId, ...gap, createdAt: now };
    }
    return { id, userId, ...gap, createdAt: now };
  }

  async getSkillsGap(userId: string) {
    if (this.isPostgres && this.sqlClient) {
      await this.ensureTables();
      const rows = await this.sqlClient`
        SELECT * FROM skills_gap WHERE user_id = ${userId} ORDER BY created_at DESC;
      `;
      return rows.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        resumeId: r.resume_id,
        jobDescription: r.job_description,
        gapItems: r.gap_items,
        createdAt: r.created_at,
      }));
    }
    return [];
  }

  clearAllData(): void {
    this.localData = {
      users: [],
      resumes: [],
      versions: [],
      scans: [],
      coverLetters: [],
      applications: [],
    };
    this.saveLocalData();
  }
}

const globalForDb = global as unknown as { dbManager?: DatabaseManager };
export const db = globalForDb.dbManager || new DatabaseManager();
if (process.env.NODE_ENV !== "production") globalForDb.dbManager = db;
