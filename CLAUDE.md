# TiaraVault — Backup Application

TiaraVault adalah aplikasi backup berbasis web yang berjalan di server Ubuntu. Aplikasi ini memungkinkan pengguna untuk mengupload, menyimpan, dan mengelola file atau folder secara aman dengan kontrol akses berbasis peran.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js (versi terbaru, App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | ReactBits (https://www.reactbits.dev/) & MagicUI (https://magicui.design/) |
| ORM | Prisma |
| Database | MySQL |
| Authentication | NextAuth.js v5 (Auth.js) |
| File Storage | Lokal di server Ubuntu (volume mount, e.g. /var/tiaravault/uploads) |
| Drag & Drop | react-dropzone |
| Icons | lucide-react |
| Animations | Framer Motion (sudah bundled di MagicUI/ReactBits) |

---

## Aturan Umum Pengembangan

- Gunakan **App Router** (/app directory), bukan Pages Router.
- Semua komponen UI wajib menggunakan **Tailwind CSS**; tidak boleh ada inline style atau CSS module kecuali untuk animasi khusus.
- Gunakan komponen dari **ReactBits** (https://www.reactbits.dev/) atau **MagicUI** (https://magicui.design/) untuk elemen interaktif dan animasi.
- Semua server-side logic (upload, auth check, file access) harus menggunakan **Next.js Route Handlers** (/app/api/...).
- Gunakan **Prisma** sebagai satu-satunya cara berinteraksi dengan database. Tidak ada raw SQL kecuali melalui prisma.$queryRaw yang terjustifikasi.
- Selalu validasi akses pada setiap Route Handler dan Server Action — jangan pernah mengandalkan hanya client-side check.
- Gunakan next/font untuk loading font (disarankan: **Inter** atau **Geist**).
- Pastikan semua halaman memiliki metadata (title, description) untuk SEO.
- Kode harus berjalan di **Ubuntu Server** (Linux-compatible path separator dan file system calls).

---

## Desain & UI/UX

- Tema: **Dark mode by default**, dengan aksen warna **indigo/violet** (modern dan premium).
- Tampilan harus **simple, clean, dan modern** — hindari clutter.
- Gunakan **animasi halus** untuk:
  - Drag-and-drop zone (highlight saat hover/drag).
  - Progress upload (animated progress bar).
  - Transisi halaman (fade-in/slide-up).
  - Komponen kartu file (hover lift effect).
- **Drag & Drop** wajib ada di halaman upload menggunakan react-dropzone.
- Gunakan komponen dari ReactBits/MagicUI seperti:
  - AnimatedList untuk daftar file terbaru.
  - NumberTicker untuk statistik ukuran storage.
  - BorderBeam atau MagicCard untuk card file/folder.
  - ShimmerButton atau RainbowButton untuk tombol utama.
  - BlurFade atau FadeText untuk animasi teks heading.
  - Meteors atau Particles untuk background dekoratif halaman login.

---

## Struktur Proyek

```
tiaravault/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                  # Halaman login
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Layout dashboard (sidebar + header)
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Halaman summary/overview
│   │   ├── upload/
│   │   │   └── page.tsx                  # Halaman upload file/folder
│   │   ├── files/
│   │   │   ├── page.tsx                  # Daftar semua file milik user
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Detail & viewer file
│   │   └── admin/
│   │       ├── page.tsx                  # Admin: semua file semua user
│   │       └── users/
│   │           └── page.tsx              # Admin: manajemen user
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts              # NextAuth handler
│   │   ├── upload/
│   │   │   └── route.ts                  # POST: upload file/folder
│   │   ├── files/
│   │   │   ├── route.ts                  # GET: list file milik user
│   │   │   └── [id]/
│   │   │       ├── route.ts              # GET: metadata file | DELETE: hapus
│   │   │       └── download/
│   │   │           └── route.ts          # GET: download file (dengan auth check)
│   │   └── summary/
│   │       └── route.ts                  # GET: summary statistik user
│   ├── globals.css
│   └── layout.tsx                        # Root layout
├── components/
│   ├── ui/                               # Komponen UI dasar (shadcn-compatible)
│   ├── upload/
│   │   ├── DropZone.tsx                  # Komponen drag & drop utama
│   │   ├── FilePreview.tsx               # Preview file sebelum upload
│   │   └── UploadProgress.tsx            # Progress bar upload
│   ├── files/
│   │   ├── FileCard.tsx                  # Kartu file/folder
│   │   ├── FileGrid.tsx                  # Grid tampilan file
│   │   ├── FileViewer.tsx                # Viewer untuk PDF, gambar, video
│   │   └── FileTypeIcon.tsx              # Ikon berdasarkan tipe file
│   ├── dashboard/
│   │   ├── StatsCard.tsx                 # Kartu statistik (total size, jumlah file)
│   │   ├── RecentUploads.tsx             # Daftar upload terbaru
│   │   └── StorageBar.tsx                # Visual storage usage
│   └── layout/
│       ├── Sidebar.tsx                   # Sidebar navigasi
│       ├── Header.tsx                    # Header dengan user info
│       └── AuthGuard.tsx                 # Wrapper proteksi rute
├── lib/
│   ├── prisma.ts                         # Prisma client singleton
│   ├── auth.ts                           # NextAuth config
│   ├── storage.ts                        # Helper: simpan/hapus file di disk
│   ├── fileUtils.ts                      # Helper: format size, detect MIME type
│   └── permissions.ts                    # Helper: cek akses file (owner/admin)
├── prisma/
│   ├── schema.prisma                     # Schema database
│   └── seed.ts                           # Seed data (admin user)
├── types/
│   └── index.ts                          # TypeScript types/interfaces
├── middleware.ts                          # Auth middleware (protect routes)
├── next.config.ts
├── tailwind.config.ts
├── .env.example
└── package.json
```

---

## Database Schema (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
  relationMode = "prisma"   // opsional: aktifkan jika menggunakan PlanetScale / MySQL tanpa FK native
}

// ─────────────────────────────────────────────
// MODEL: User
// ─────────────────────────────────────────────
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String                        // hashed dengan bcrypt
  role      Role     @default(USER)
  avatar    String?                       // path avatar (opsional)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  uploads   Upload[]
  sessions  Session[]
  accounts  Account[]

  @@map("users")
}

enum Role {
  USER
  ADMIN
}

// ─────────────────────────────────────────────
// MODEL: Upload
// Merepresentasikan satu sesi upload
// (bisa berupa satu file, multi-file, atau satu folder)
// ─────────────────────────────────────────────
model Upload {
  id          String       @id @default(cuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  uploadType  UploadType                  // FILE | FOLDER
  folderName  String?                     // nama folder jika uploadType = FOLDER
  totalSize   BigInt       @default(0)    // total ukuran semua file dalam upload ini (bytes)
  fileCount   Int          @default(0)    // jumlah file dalam upload ini
  status      UploadStatus @default(PENDING)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  files       File[]

  @@map("uploads")
}

enum UploadType {
  FILE    // upload satu atau lebih file lepas
  FOLDER  // upload satu folder (dengan sub-struktur)
}

enum UploadStatus {
  PENDING
  COMPLETED
  FAILED
}

// ─────────────────────────────────────────────
// MODEL: File
// Merepresentasikan satu file individual
// ─────────────────────────────────────────────
model File {
  id           String   @id @default(cuid())
  uploadId     String
  upload       Upload   @relation(fields: [uploadId], references: [id], onDelete: Cascade)

  originalName String                     // nama asli file saat diupload
  storedName   String                     // nama file yang disimpan di disk (uuid-based)
  storagePath  String                     // absolute path di server
  relativePath String?                    // path relatif dalam folder (untuk struktur folder)
  mimeType     String                     // MIME type (e.g. image/png, application/pdf)
  extension    String                     // ekstensi file (e.g. .pdf, .mp4)
  size         BigInt                     // ukuran file dalam bytes
  checksum     String?                    // MD5/SHA256 hash untuk verifikasi integritas
  isViewable   Boolean  @default(false)   // true jika bisa dipreview (PDF, gambar, video)
  downloadCount Int     @default(0)       // berapa kali file didownload
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("files")
}

// ─────────────────────────────────────────────
// MODEL: Session (NextAuth)
// ─────────────────────────────────────────────
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expires      DateTime

  @@map("sessions")
}

// ─────────────────────────────────────────────
// MODEL: Account (NextAuth)
// ─────────────────────────────────────────────
model Account {
  id                String  @id @default(cuid())
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.MediumText
  access_token      String? @db.MediumText
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.MediumText
  session_state     String?

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

// ─────────────────────────────────────────────
// MODEL: VerificationToken (NextAuth)
// ─────────────────────────────────────────────
model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

---

## Fitur Utama

### 1. Autentikasi & Otorisasi

- Login menggunakan **email + password** (Credentials provider NextAuth.js).
- Password di-hash menggunakan **bcrypt** sebelum disimpan.
- Session menggunakan **database session** (lebih aman untuk server-side).
- Role: USER dan ADMIN.
- middleware.ts wajib memproteksi semua rute /dashboard/** dan /admin/**.
- Admin dapat melihat semua file milik semua user.

### 2. Upload File & Folder

#### Aturan Upload

| Mode | Ketentuan |
|---|---|
| File | Boleh multi-file (multiple files sekaligus) |
| Folder | Hanya satu folder saja per upload |

#### Implementasi Drag & Drop

- Gunakan react-dropzone untuk area drop.
- Drop zone menampilkan animasi highlight saat file/folder di-drag ke atasnya.
- Saat file di-drop, tampilkan preview daftar file (nama, ukuran, tipe).
- Tombol toggle antara mode **"Upload File"** dan **"Upload Folder"**.
  - Mode File: `<input type="file" multiple />` — terima banyak file.
  - Mode Folder: `<input type="file" webkitdirectory />` — terima satu folder.
- Progress upload ditampilkan per-file dengan animated progress bar.
- Validasi sisi client: batas ukuran file per item (konfigurasikan via .env, default 500MB).
- Validasi sisi server di Route Handler: verifikasi session, cek ukuran, simpan ke disk.

#### Storage di Server

```
/var/tiaravault/uploads/
├── {userId}/
│   ├── files/
│   │   └── {storedName}              # file lepas (nama uuid)
│   └── folders/
│       └── {uploadId}/
│           └── {relativePath}/{storedName}  # struktur folder dipertahankan
```

### 3. Akses & Tampilan File

#### Aturan Akses

- File hanya bisa diakses oleh **pemilik (userId yang upload)** atau **ADMIN**.
- Setiap request download/view wajib dicek session + kepemilikan di server-side.
- Tidak ada URL file yang bisa diakses publik secara langsung.

#### File Viewer (berdasarkan MIME type)

| Tipe | Tampilan |
|---|---|
| image/* | Preview langsung menggunakan next/image |
| application/pdf | Ditampilkan menggunakan iframe via blob URL |
| video/* | Player video menggunakan tag video dengan controls |
| Lainnya | Hanya tombol **Download** saja |

- File viewer dibuka di modal atau halaman detail (/files/[id]).
- Untuk PDF dan video, file di-stream dari server melalui Route Handler (/api/files/[id]/download) dengan header Content-Type yang tepat dan autentikasi.

### 4. Halaman Summary (Dashboard)

Halaman utama dashboard setelah login. Menampilkan:

| Komponen | Detail |
|---|---|
| Total Storage Used | Total ukuran semua file user (format KB/MB/GB) — gunakan NumberTicker dari MagicUI |
| Total Files | Jumlah total file yang diupload user |
| Total Uploads | Jumlah sesi upload (file + folder) |
| Recent Uploads | 5-10 upload terakhir — tampilkan nama, tipe, ukuran, tanggal |
| Storage Bar | Visual progress bar penggunaan storage |
| Quick Upload | Shortcut button langsung ke halaman upload |

- Admin melihat statistik global (semua user) + per-user breakdown.
- Gunakan AnimatedList dari MagicUI untuk menampilkan recent uploads.
- Gunakan NumberTicker untuk animasi angka total storage.

---

## Environment Variables

Buat file .env.example dengan variabel berikut:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/tiaravault"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Storage
UPLOAD_DIR="/var/tiaravault/uploads"
MAX_FILE_SIZE_MB=500

# App
APP_NAME="TiaraVault"
APP_URL="http://localhost:3000"
```

---

## Halaman & Routes

| Route | Akses | Deskripsi |
|---|---|---|
| /login | Public (redirect jika sudah login) | Form login |
| /dashboard | USER + ADMIN | Summary & statistik |
| /upload | USER + ADMIN | Upload file/folder |
| /files | USER + ADMIN | Daftar file milik user |
| /files/[id] | USER (owner) + ADMIN | Detail & viewer file |
| /admin | ADMIN only | Semua file semua user |
| /admin/users | ADMIN only | Manajemen user |

---

## Komponen UI yang Direkomendasikan

### Dari ReactBits (https://www.reactbits.dev/)
- Magnet — efek magnet pada tombol upload
- PixelCard — kartu file dengan efek pixel/glitch
- Aurora — background animasi halaman login
- Ribbons — aksen dekoratif
- VariableProximity — efek teks interaktif pada judul

### Dari MagicUI (https://magicui.design/)
- NumberTicker — animasi angka untuk statistik storage
- AnimatedList — daftar upload terbaru dengan animasi
- BorderBeam — border animasi pada kartu file aktif
- MagicCard — kartu dengan efek hover glow
- ShimmerButton — tombol upload utama
- BlurFade — fade-in animasi untuk elemen dashboard
- Meteors — background dekoratif halaman login
- Marquee — scrolling ticker nama file (opsional)

---

## Keamanan

- Semua file disimpan di luar direktori public/ — tidak dapat diakses langsung via URL.
- Download file diproksikan melalui Route Handler dengan validasi sesi.
- Gunakan Content-Disposition: attachment untuk file download.
- Gunakan Content-Type yang tepat untuk file viewer (inline display).
- Rate limiting pada endpoint upload (gunakan upstash/ratelimit atau middleware sederhana).
- Validasi tipe file di server (jangan hanya percaya ekstensi client).
- CSRF protection sudah ditangani oleh NextAuth.js.

---

## Deployment di Ubuntu Server

### Prerequisites

```bash
# Install Node.js (via nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts

# Install MySQL
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# Setup user dan database
sudo mysql -e "CREATE DATABASE tiaravault CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'tiaravault'@'localhost' IDENTIFIED BY 'your_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON tiaravault.* TO 'tiaravault'@'localhost'; FLUSH PRIVILEGES;"

# Buat direktori storage
sudo mkdir -p /var/tiaravault/uploads
sudo chown -R $USER:$USER /var/tiaravault
```

### Build & Run

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run build
npm start
```

### PM2 (Production Process Manager)

```bash
npm install -g pm2
pm2 start npm --name "tiaravault" -- start
pm2 startup
pm2 save
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Increase upload size limit
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

## Docker Configuration

Konfigurasi Docker untuk menjalankan TiaraVault via container atau image Docker. Stack mencakup tiga service: **app** (Next.js), **db** (MySQL), dan **nginx** (reverse proxy).

### File: `Dockerfile`

```dockerfile
# ─────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# ─────────────────────────────────────────────
# Stage 2: Builder
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3: Runner (Production image)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user untuk keamanan
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Buat direktori storage uploads di dalam container
RUN mkdir -p /var/tiaravault/uploads && \
    chown -R nextjs:nodejs /var/tiaravault

# Copy file yang dibutuhkan dari builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Script entrypoint: jalankan migrasi lalu start server
CMD ["node", "server.js"]
```

> **Catatan:** Aktifkan `output: 'standalone'` di `next.config.ts` agar build menghasilkan folder `standalone` yang ringan:
> ```ts
> // next.config.ts
> const nextConfig = {
>   output: 'standalone',
> };
> export default nextConfig;
> ```

---

### File: `docker-compose.yml`

```yaml
version: '3.9'

services:
  # ─── MySQL Database ────────────────────────
  db:
    image: mysql:8.0
    container_name: tiaravault_db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD:-rootsecret}
      MYSQL_USER: ${MYSQL_USER:-tiaravault}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD:-supersecret}
      MYSQL_DATABASE: ${MYSQL_DATABASE:-tiaravault}
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - tiaravault_net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${MYSQL_ROOT_PASSWORD:-rootsecret}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # ─── Next.js Application ──────────────────
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    container_name: tiaravault_app
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: mysql://${MYSQL_USER:-tiaravault}:${MYSQL_PASSWORD:-supersecret}@db:3306/${MYSQL_DATABASE:-tiaravault}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3000}
      UPLOAD_DIR: /var/tiaravault/uploads
      MAX_FILE_SIZE_MB: ${MAX_FILE_SIZE_MB:-500}
      APP_NAME: TiaraVault
      APP_URL: ${APP_URL:-http://localhost:3000}
    volumes:
      # Mount volume storage agar data persist saat container di-restart
      - uploads_data:/var/tiaravault/uploads
    networks:
      - tiaravault_net
    expose:
      - "3000"

  # ─── Nginx Reverse Proxy ──────────────────
  nginx:
    image: nginx:alpine
    container_name: tiaravault_nginx
    restart: unless-stopped
    depends_on:
      - app
    ports:
      - "80:80"
      - "443:443"   # aktifkan jika menggunakan SSL
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro   # letakkan sertifikat SSL di sini (opsional)
    networks:
      - tiaravault_net

  # ─── Database Migration (one-shot) ────────
  migrate:
    build:
      context: .
      dockerfile: Dockerfile
      target: deps
    container_name: tiaravault_migrate
    command: sh -c "npx prisma migrate deploy && npx prisma db seed"
    environment:
      DATABASE_URL: mysql://${MYSQL_USER:-tiaravault}:${MYSQL_PASSWORD:-supersecret}@db:3306/${MYSQL_DATABASE:-tiaravault}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - tiaravault_net
    restart: "no"   # hanya jalan sekali

volumes:
  mysql_data:
    driver: local
  uploads_data:
    driver: local

networks:
  tiaravault_net:
    driver: bridge
```

---

### File: `nginx/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;

    # Tingkatkan batas ukuran upload (sesuaikan dengan MAX_FILE_SIZE_MB)
    client_max_body_size 600M;

    # Proxy ke Next.js app
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout untuk upload file besar
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_connect_timeout 600s;
    }
}
```

---

### File: `.dockerignore`

```dockerignore
# Dependencies
node_modules
npm-debug.log*

# Build output
.next
out
dist

# Environment files (jangan di-copy ke image!)
.env
.env.local
.env.production
.env.*.local

# Version control
.git
.gitignore

# Development tools
.eslintrc*
.prettierrc*
README.md
CLAUDE.md

# Docker files sendiri (tidak perlu di-copy)
Dockerfile
docker-compose.yml
.dockerignore

# OS artifacts
.DS_Store
Thumbs.db

# Test files
__tests__
*.test.ts
*.spec.ts
coverage
```

---

### File: `.env.docker` (Template untuk Docker)

Buat file `.env.docker` (atau copy dari `.env.example`) dan isi variabel berikut sebelum menjalankan container:

```env
# ─── MySQL ────────────────────────────────────
MYSQL_ROOT_PASSWORD=ganti_dengan_root_password_kuat
MYSQL_USER=tiaravault
MYSQL_PASSWORD=ganti_dengan_password_kuat
MYSQL_DATABASE=tiaravault

# ─── NextAuth ─────────────────────────────────
# Generate dengan: openssl rand -base64 32
NEXTAUTH_SECRET=ganti_dengan_secret_acak_panjang
NEXTAUTH_URL=http://yourdomain.com

# ─── Storage ──────────────────────────────────
MAX_FILE_SIZE_MB=500

# ─── App ──────────────────────────────────────
APP_URL=http://yourdomain.com
```

---

### Cara Menjalankan via Docker

#### 1. Jalankan Pertama Kali (Setup Lengkap)

```bash
# 1. Copy dan isi environment variables
cp .env.example .env.docker

# 2. Edit .env.docker dengan nilai yang sesuai
nano .env.docker

# 3. Build image dan jalankan semua service
docker compose --env-file .env.docker up -d --build

# 4. Jalankan migrasi database + seed (sekali saja)
docker compose --env-file .env.docker run --rm migrate

# 5. Cek status semua container
docker compose ps
```

#### 2. Perintah Umum

```bash
# Start semua service (tanpa rebuild)
docker compose --env-file .env.docker up -d

# Stop semua service
docker compose down

# Stop dan hapus semua data (HATI-HATI: menghapus volume database!)
docker compose down -v

# Rebuild image setelah ada perubahan kode
docker compose --env-file .env.docker up -d --build app

# Lihat logs Next.js app secara real-time
docker logs -f tiaravault_app

# Lihat logs semua service
docker compose logs -f

# Masuk ke shell container app
docker exec -it tiaravault_app sh

# Jalankan Prisma Studio (untuk inspect database)
docker exec -it tiaravault_app npx prisma studio
```

#### 3. Jalankan Tanpa Nginx (Development / Testing)

Jika hanya ingin menjalankan app dan database saja tanpa nginx:

```bash
docker compose --env-file .env.docker up -d db app
```

Akses aplikasi di: `http://localhost:3000`

#### 4. Update Aplikasi (Deploy Ulang)

```bash
# Pull kode terbaru
git pull origin main

# Rebuild dan restart hanya service app
docker compose --env-file .env.docker up -d --build app

# Jalankan migrasi jika ada schema baru
docker compose --env-file .env.docker run --rm migrate
```

---

### Struktur File Docker

Tambahkan file-file berikut ke dalam proyek:

```
tiaravault/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.docker              # (jangan di-commit! tambahkan ke .gitignore)
└── nginx/
    ├── nginx.conf
    └── ssl/                 # letakkan sertifikat SSL di sini (opsional)
        ├── cert.pem
        └── key.pem
```

> **Penting:** Tambahkan `.env.docker` ke `.gitignore` agar tidak ter-commit ke repository:
> ```bash
> echo ".env.docker" >> .gitignore
> ```

---

## Konvensi Kode

- Gunakan **TypeScript strict mode**.
- Semua fungsi async wajib menggunakan try/catch dan return error yang informatif.
- Nama komponen: **PascalCase** (e.g., FileCard.tsx).
- Nama fungsi/variabel: **camelCase**.
- Nama konstanta global: **UPPER_SNAKE_CASE**.
- Gunakan zod untuk validasi input di Route Handler dan Server Action.
- Gunakan @ alias untuk import (configured in tsconfig.json).

---

## Catatan Tambahan

- Aplikasi ini dirancang untuk **single-tenant** (satu instance untuk satu organisasi/tim).
- Tidak ada fitur sharing publik — semua akses harus melalui login.
- Jika ada kebutuhan quota per user di masa depan, tambahkan kolom storageQuotaBytes pada model User.
- Untuk skala besar, pertimbangkan mengganti local storage dengan **MinIO** (S3-compatible) yang bisa dihosting sendiri di Ubuntu.
