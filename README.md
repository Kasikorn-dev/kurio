# 🎓 Kurio - AI-Powered Learning Platform

**Kurio** เป็นแพลตฟอร์มการเรียนรู้ที่ใช้ **Gemini AI** ในการสร้างบทเรียนและเกมทดสอบความรู้อัตโนมัติจากเอกสารที่ผู้ใช้อัปโหลด

## ✨ จุดเด่นของระบบ

### 🤖 AI-Powered Content Generation
- อัปโหลดเอกสาร (PDF, รูปภาพ, ข้อความ)
- **Gemini AI** วิเคราะห์เนื้อหาและสร้างบทเรียนอัตโนมัติ
- สร้างเกมทดสอบความรู้หลากหลายรูปแบบ (Quiz, Multiple Choice, Fill in the Blank, Matching)

### 📊 Real-time Progress Tracking
- ติดตามความคืบหน้าการเรียนแบบ real-time
- บันทึกประวัติการเล่นเกมและคะแนน
- แสดงสถานะการสร้างเนื้อหาแบบ live update

### 🔒 Security & Privacy
- Row Level Security (RLS) ทุก database table
- Type-safe API ด้วย tRPC
- Environment validation
- Supabase Authentication

## 🛠️ Tech Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Runtime**: React 19

### Backend
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **API**: tRPC (Type-safe API)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

### AI & Processing
- **AI Model**: Gemini AI
- **Content Analysis**: Automatic document parsing
- **Game Generation**: AI-powered quiz creation

### Frontend
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React, Tabler Icons
- **Drag & Drop**: Native HTML5

### DevOps
- **Deployment**: Vercel
- **Analytics**: Vercel Analytics
- **Linting**: Biome
- **Type Checking**: TypeScript ESNext

## 📁 Project Structure

```
kurio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (authenticated)/    # Protected routes
│   │   ├── (public)/           # Public routes
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── custom/             # Custom components
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & helpers
│   ├── server/                 # Server-side code
│   │   ├── api/                # tRPC routers
│   │   └── db/                 # Database schemas
│   ├── stores/                 # Zustand stores
│   └── trpc/                   # tRPC setup
├── supabase/
│   ├── functions/              # Edge Functions
│   ├── migrations/             # Database migrations
│   └── scripts/                # Database scripts
└── public/                     # Static files
```

## 🗄️ Database Schema

### Core Tables
- **user_profiles** - ข้อมูลผู้ใช้
- **kurios** - ชุดการเรียนรู้หลัก
- **resources** - เอกสารต้นทาง (text, files, images)
- **units** - บทเรียนย่อย
- **games** - เกมทดสอบความรู้
- **unit_progress** - ความคืบหน้าการเรียน
- **game_attempts** - ประวัติการเล่นเกม

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Supabase account
- Gemini AI API key

### Installation

```bash
# Clone repository
git clone <repository-url>
cd kurio

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env
# แก้ไข .env ตามค่าที่ได้จาก Supabase และ Gemini AI

# Setup database
pnpm db:push

# Run development server (local)
pnpm dev:local

# Run development server (Supabase production)
pnpm dev:sup
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://...

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

## 📝 Available Scripts

```bash
# Development
pnpm dev:local          # Development with local DB config
pnpm dev:sup            # Development with Supabase production

# Build & Production
pnpm build              # Build for production
pnpm start              # Start production server
pnpm preview            # Build and start (preview mode)

# Database
pnpm db:push            # Push schema to database
pnpm db:generate        # Generate migrations
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Drizzle Studio
pnpm db:setup           # Setup database
pnpm db:drop            # Drop all tables

# Code Quality
pnpm check              # Run Biome linter
pnpm check:write        # Fix linting issues
pnpm check:unsafe       # Fix with unsafe transformations
pnpm typecheck          # TypeScript type checking
```

## 🎯 Key Features

### 1. AI Content Generation
- อัปโหลดเอกสารหลายไฟล์พร้อมกัน
- Gemini AI วิเคราะห์และสร้างโครงร่างบทเรียน
- สร้างเกมทดสอบความรู้อัตโนมัติ (10 เกมต่อบทเรียน)
- ปรับระดับความยากได้ (Easy, Medium, Hard)

### 2. Interactive Learning
- เกมหลากหลายรูปแบบ (Quiz, Multiple Choice, Fill Blank, Matching)
- ระบบให้คะแนนทันที
- บันทึกเวลาที่ใช้ในแต่ละเกม
- แสดงเฉลยและคำอธิบาย

### 3. Progress Management
- Dashboard แสดงความคืบหน้าทั้งหมด
- ติดตามเปอร์เซ็นต์การทำเกมในแต่ละบทเรียน
- ประวัติคะแนนและการเล่นทั้งหมด

### 4. Modern UX
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Drag & drop file upload
- Real-time status updates
- Smooth animations

## 🔐 Security

- **Row Level Security (RLS)** บน Supabase
- **Type-safe API** ด้วย tRPC
- **JWT Authentication** จาก Supabase Auth
- **Environment validation** ด้วย @t3-oss/env-nextjs
- **Secure file upload** ผ่าน Supabase Storage

## 📚 Documentation

สำหรับข้อมูลเพิ่มเติมเกี่ยวกับโครงสร้างโค้ดและการทำงานของระบบ ดูได้ที่:
- [Walkthrough Document](file:///.gemini/antigravity/brain/8f57f37c-47fd-4226-bee4-728b8f750122/walkthrough.md)

## 🤝 Contributing

Built with [T3 Stack](https://create.t3.gg/) - The best way to start a full-stack, typesafe Next.js app.

## 📄 License

This project is private and proprietary.

---

