# 🗄️ TiaraVault

**TiaraVault** is a modern, self-hosted web backup and cloud storage application designed to store, manage, and protect files and folders with Role-Based Access Control (RBAC).

Featuring an **Apple-inspired glassmorphism UI**, full support for **Dark & Light Modes**, and powered by **Next.js 16 (App Router)** and **Prisma ORM**.

---

## ✨ Key Features

- **🚀 Flexible Uploads (Files & Folders)**
  - Seamless multi-file upload support.
  - Complete directory/folder upload preserving internal hierarchy (`webkitdirectory`).
  - Intuitive drag-and-drop interface powered by `react-dropzone` with drag highlights and per-file animated progress bars.
- **👁️ Built-in File Viewer & Streaming**
  - Instant inline previews for popular file formats:
    - **Images**: Fast and responsive image display via `next/image`.
    - **PDF Documents**: Embedded interactive viewer via secure blob streaming.
    - **Videos**: Built-in HTML5 video player with standard playback controls.
  - Secure downloads proxied through authenticated Route Handlers with ownership validation.
- **🛡️ Multi-Layered Security & Access Control**
  - Session and JWT authentication managed via **NextAuth.js v5 (Auth.js)**.
  - Secure password hashing using **bcrypt**.
  - Files are stored outside the public web root (`public/`), preventing unauthorized direct URL access.
  - Built-in rate limiting on the upload endpoint to safeguard against abuse.
- **📊 Storage Analytics & Dashboard**
  - Real-time overview of total storage utilized, total files, and upload sessions.
  - Storage usage progress bar and recent upload history.
  - Polished interactive animations using MagicUI (`NumberTicker`, `AnimatedList`, `BorderBeam`, `ShimmerButton`).
- **👥 User & Access Management (RBAC)**
  - **USER Role**: Upload, browse, preview, and download their own files.
  - **ADMIN Role**: Global system oversight (view files across all users, inspect global storage) and comprehensive user management (add, edit, change roles, reset passwords, delete accounts).
- **🎨 Modern, Responsive Design**
  - Clean and minimalist Apple-inspired aesthetic with translucent glass surfaces (`ReactBits GlassSurface`, `SideRays`).
  - Floating glass bottom navigation optimized for both mobile and desktop screens.
  - Smooth animated theme switcher between Dark and Light mode.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) v4 |
| **UI & Animations** | [Framer Motion](https://www.framer.com/motion/), [MagicUI](https://magicui.design/), [ReactBits](https://www.reactbits.dev/), [Lucide React](https://lucide.dev/) |
| **ORM & Database** | [Prisma ORM](https://www.prisma.io/) & [MySQL](https://www.mysql.com/) 8.0+ |
| **Authentication** | [NextAuth.js](https://authjs.dev/) v5 (Credentials Provider + JWT) |
| **File Handling** | [react-dropzone](https://react-dropzone.js.org/) |
| **Container & Proxy**| [Docker](https://www.docker.com/), Docker Compose, [Nginx](https://nginx.org/) |

---

## 📁 Project Structure

```text
tiaravault/
├── app/
│   ├── (auth)/
│   │   └── login/                 # Authentication & login page
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Dashboard shell layout (Header + BottomNav)
│   │   ├── dashboard/             # Overview metrics & storage analytics
│   │   ├── upload/                # Drag-and-drop file/folder uploader
│   │   ├── files/                 # User file explorer & inline viewer
│   │   ├── profile/               # User profile & password settings
│   │   └── admin/
│   │       ├── page.tsx           # Admin Panel: Global file overview
│   │       └── users/page.tsx     # Admin Panel: User management (CRUD)
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth authentication handlers
│   │   ├── upload/                # POST: File and folder upload processor
│   │   ├── files/                 # GET: User/Admin file list
│   │   │   └── [id]/              # GET/DELETE: Individual file details and deletion
│   │   │       └── download/      # GET: Secure streaming and download proxy
│   │   ├── summary/               # GET: Storage statistics aggregation
│   │   ├── admin/users/           # GET/POST/PUT/DELETE: User management API
│   │   └── user/profile/          # GET/PUT: Current user profile API
│   ├── globals.css                # Global CSS variables and base styles
│   └── layout.tsx                 # Root layout & ThemeProvider
├── components/
│   ├── dashboard/                 # Storage statistics cards & bars
│   ├── files/                     # File grid, cards, and modal viewer
│   ├── layout/                    # Header, Floating BottomNav, guards
│   ├── magicui/                   # Visual components (NumberTicker, AnimatedList, etc.)
│   ├── reactbits/                 # GlassSurface and SideRays components
│   ├── ui/                        # Atomic primitives (Button, Card, Modal, Badge)
│   └── upload/                    # DropZone & UploadProgress indicators
├── lib/
│   ├── actions.ts                 # Server Actions for authentication
│   ├── auth.ts                    # NextAuth.js configuration
│   ├── fileUtils.ts               # Byte formatting, MIME detection, validations
│   ├── permissions.ts             # Access validation helpers (Owner vs. Admin)
│   ├── prisma.ts                  # PrismaClient singleton instance
│   ├── rateLimit.ts               # In-memory sliding rate limiter
│   └── storage.ts                 # Local server file storage operations
├── nginx/
│   └── nginx.conf                 # Nginx reverse proxy configuration
├── prisma/
│   ├── schema.prisma              # Database schema definitions
│   └── seed.ts                    # Initial seed data (admin & demo user)
├── Dockerfile                     # Multi-stage production container build
├── docker-compose.yml             # Docker compose configuration
└── package.json
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **Package Manager**: `npm` or `pnpm`
- **Database**: MySQL 8.0+ or compatible MariaDB instance

### 2. Clone Repository & Install Dependencies
```bash
git clone https://github.com/username/tiaravault.git
cd tiaravault

npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` to fit your environment:
```env
# MySQL Database Connection String
DATABASE_URL="mysql://tiaravault:your_password@localhost:3306/tiaravault"

# NextAuth Secret (Generate via: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Storage Settings
UPLOAD_DIR="D:/tiaravault_storage/uploads" # or /var/tiaravault/uploads on Linux
MAX_FILE_SIZE_MB=500

# Application Metadata
APP_NAME="TiaraVault"
APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Synchronize the Prisma schema with your database and seed initial test accounts:
```bash
# Push schema changes to MySQL
npm run db:push

# Generate Prisma Client
npm run db:generate

# Seed initial accounts
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Default Credentials

Running `npm run db:seed` provisions the following ready-to-use accounts:

| Role | Username | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Full system access (global file browser, user management, system metrics) |
| **Demo User** | `user` | `user123` | Standard access (personal dashboard, upload, manage own files) |

> ⚠️ **IMPORTANT**: Always update default passwords immediately when deploying to production!

---

## 🐳 Docker Deployment

TiaraVault includes a ready-to-use **Dockerfile** (optimized multi-stage build) and a **docker-compose.yml** configuration.

### Deploying via Docker Compose:
1. Ensure your `.env.production` file is configured.
2. Build and run containers:
```bash
docker compose up -d --build
```
The startup process automatically applies pending database migrations, runs seed scripts, and boots the standalone Next.js server on port `3000`.

---

## 🐧 Bare-Metal Deployment (Ubuntu Server)

To deploy directly to an Ubuntu VPS or dedicated server:

1. **Create Storage Directory**:
   ```bash
   sudo mkdir -p /var/tiaravault/uploads
   sudo chown -R $USER:$USER /var/tiaravault
   ```
2. **Build the Application**:
   ```bash
   npm run build
   ```
3. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "tiaravault" -- start
   pm2 save
   pm2 startup
   ```
4. **Configure Nginx as a Reverse Proxy**:
   Ensure `client_max_body_size` accommodates your configured `MAX_FILE_SIZE_MB`:
   ```nginx
   server {
       listen 80;
       server_name vault.yourdomain.com;
       client_max_body_size 600M;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 📜 Available NPM Scripts

- `npm run dev`: Starts the Next.js development server with hot-reload.
- `npm run build`: Generates the optimized production build.
- `npm run start`: Launches the compiled production application.
- `npm run lint`: Runs ESLint to check for code quality and syntax issues.
- `npm run db:push`: Synchronizes the Prisma schema directly to MySQL without creating migration files.
- `npm run db:migrate`: Creates and applies database migrations.
- `npm run db:seed`: Executes the seed script to create initial accounts.
- `npm run db:studio`: Opens the Prisma Studio GUI to inspect database records.

