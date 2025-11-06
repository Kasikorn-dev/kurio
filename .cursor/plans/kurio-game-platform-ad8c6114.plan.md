<!-- ad8c6114-1ba3-4ecc-a3e1-f265da07c164 1f3f425f-2585-4681-a4d7-0034880ca77e -->
# Kurio Game Platform - Implementation Plan

## Overview

สร้างแอปพลิเคชัน kurio สำหรับสร้างเกมด้วย AI โดยใช้ Next.js 15 + tRPC + Drizzle ORM + Supabase

## Tech Stack Decisions

### State Management

- **Zustand**: สำหรับ client state (forms, UI state, game state)
- **tRPC + React Query**: สำหรับ server state (kurios, exercises, user data)
- **Supabase Auth Client**: สำหรับ auth state (ไม่ใช้ Zustand)

### UI Theme

เลือกใช้ **Dark theme (เทาดำ)** เพราะเหมาะกับแอปเกม/การศึกษา

## Database Schema Design

### Schema Structure (Supabase + Drizzle)

```
auth.users (Supabase built-in)
  ↓
user_profiles
  - id (uuid, PK)
  - user_id (uuid, FK -> auth.users.id, unique)
  - display_name (varchar(255))
  - avatar_url (varchar, nullable)
  - created_at (timestamp with timezone)
  - updated_at (timestamp with timezone)
  ↓
kurios (เกมหลัก)
  - id (uuid, PK)
  - user_id (uuid, FK -> user_profiles.id)
  - title (varchar(255))
  - description (text, nullable)
  - difficulty_level (enum: 'easy', 'medium', 'hard', 'mixed')
  - auto_gen_enabled (boolean, default: true)
  - auto_gen_threshold (integer, default: 75) // 70-80% สำหรับ lifelong learning
  - ai_model (varchar(50), default: 'gpt-4o-mini')
  - status (enum: 'draft', 'generating', 'ready', 'error')
  - total_exercises (integer, default: 0)
  - created_at (timestamp with timezone)
  - updated_at (timestamp with timezone)
  ↓
kurio_resources (input หลายแบบที่ผู้ใช้ใส่เข้ามา - 1 kurio มีได้หลาย resources)
  - id (uuid, PK)
  - kurio_id (uuid, FK -> kurios.id, onDelete: cascade)
  - resource_type (enum: 'text', 'file', 'image')
  - resource_content (text, nullable) // สำหรับ text input
  - resource_file_url (varchar, nullable) // สำหรับ file/image storage
  - resource_file_type (varchar(50), nullable) // 'pdf', 'docx', 'png', 'jpg', etc.
  - order_index (integer) // ลำดับของ resource
  - created_at (timestamp with timezone)
  ↓
units (หน่วยการเรียนรู้)
  - id (uuid, PK)
  - kurio_id (uuid, FK -> kurios.id, onDelete: cascade)
  - title (varchar(255))
  - order_index (integer)
  - is_auto_generated (boolean, default: false)
  - created_at (timestamp with timezone)
  ↓
lessons (บทเรียน)
  - id (uuid, PK)
  - unit_id (uuid, FK -> units.id, onDelete: cascade)
  - title (varchar(255))
  - order_index (integer)
  - is_auto_generated (boolean, default: false)
  - created_at (timestamp with timezone)
  ↓
exercises (แบบฝึกหัด/เกม)
  - id (uuid, PK)
  - lesson_id (uuid, FK -> lessons.id, onDelete: cascade)
  - title (varchar(255))
  - exercise_type (enum: 'quiz', 'matching', 'fill_blank', 'multiple_choice')
  - content (jsonb) // เก็บเนื้อหาเกมที่ AI generate
  - difficulty_level (enum: 'easy', 'medium', 'hard')
  - is_auto_generated (boolean, default: false)
  - order_index (integer)
  - created_at (timestamp with timezone)
  ↓
player_exercise_plays (ประวัติการเล่นแต่ละ exercise)
  - id (uuid, PK)
  - player_id (uuid, FK -> user_profiles.id)
  - exercise_id (uuid, FK -> exercises.id)
  - user_answer (jsonb) // คำตอบที่ผู้ใช้เลือก
  - is_correct (boolean)
  - score (integer)
  - time_spent (integer) // วินาที
  - played_at (timestamp with timezone)
  ↓
player_lesson_progress (ความคืบหน้าของผู้เล่นในแต่ละ lesson)
  - id (uuid, PK)
  - player_id (uuid, FK -> user_profiles.id)
  - lesson_id (uuid, FK -> lessons.id)
  - completed_exercises (integer, default: 0)
  - total_exercises (integer)
  - is_completed (boolean, default: false)
  - last_played_at (timestamp with timezone)
  - created_at (timestamp with timezone)
  - updated_at (timestamp with timezone)
  // Unique constraint: (player_id, lesson_id)
```

## File Structure

### New Folders & Files

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── kurios/
│   │   │   ├── page.tsx (list)
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx (detail)
│   │   │   │   └── edit/
│   │   │   │       └── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── api/
│   │   ├── trpc/
│   │   │   └── [trpc]/
│   │   │       └── route.ts (existing)
│   │   └── upload/
│   │       └── route.ts (สำหรับ file/image upload)
│   └── middleware.ts (Next.js middleware สำหรับ route protection)
├── components/
│   ├── custom/
│   │   ├── kurio/
│   │   │   ├── kurio-form.tsx
│   │   │   ├── kurio-card.tsx
│   │   │   ├── kurio-list.tsx
│   │   │   ├── input-selector.tsx (text/file/image input - รองรับหลาย input)
│   │   │   └── difficulty-selector.tsx
│   │   ├── game/
│   │   │   ├── exercise-renderer.tsx
│   │   │   ├── game-player.tsx
│   │   │   └── progress-tracker.tsx
│   │   └── auth/
│   │       ├── login-form.tsx
│   │       └── signup-form.tsx
│   └── ui/ (existing shadcn components)
├── hooks/
│   ├── use-kurio.ts
│   ├── use-game.ts
│   └── use-auth.ts
├── lib/
│   ├── ai/
│   │   ├── openai-client.ts
│   │   └── game-generator.ts
│   ├── storage/
│   │   └── supabase-storage.ts
│   └── supabase/
│       ├── client.ts (Supabase client-side)
│       ├── server.ts (Supabase server-side)
│       └── middleware.ts (Supabase middleware)
├── server/
│   ├── api/
│   │   └── routers/
│   │       ├── kurio.ts
│   │       ├── game.ts
│   │       └── auth.ts
│   └── db/
│       └── schemas/
│           ├── user-profiles.ts
│           ├── kurios.ts
│           ├── kurio-resources.ts
│           ├── units.ts
│           ├── lessons.ts
│           ├── exercises.ts
│           ├── player-exercise-plays.ts
│           └── player-lesson-progress.ts
└── stores/
    ├── kurio-store.ts (Zustand)
    └── game-store.ts (Zustand)
```

## Implementation Steps

### Phase 1: Setup & Database

1. Install dependencies: zustand, @supabase/supabase-js, @supabase/ssr, openai, framer-motion
2. Update env.js: เพิ่ม OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
3. สร้าง database schemas ทั้งหมด (user_profiles, kurios, kurio_resources, units, lessons, exercises, player_exercise_plays, player_lesson_progress)
4. Setup Supabase Auth Client (client-side และ server-side)
5. เพิ่ม auth middleware ใน tRPC context สำหรับ protected routes

### Phase 2: Authentication

1. สร้าง tRPC auth router สำหรับ user profile operations
2. สร้าง login/signup pages และ forms (ใช้ Supabase Auth Client โดยตรง)
3. สร้าง Next.js middleware สำหรับ route protection
4. สร้าง user profile creation on signup (ผ่าน tRPC mutation)

### Phase 3: Kurio Creation Flow

1. สร้าง kurio store (Zustand) สำหรับ manage form state
2. สร้าง kurio creation page และ form
3. สร้าง input selector component (text/file/image) - รองรับหลาย input
4. สร้าง difficulty selector component
5. สร้าง file upload API route (Supabase Storage)
6. สร้าง tRPC kurio router สำหรับ CRUD operations และ kurio_resources management

### Phase 4: AI Integration

1. สร้าง OpenAI client utility
2. สร้าง AI service สำหรับ generate game content จาก kurio_resources
3. สร้าง background job/API route สำหรับ async AI generation
4. สร้าง progress tracking สำหรับ generation status

### Phase 5: Game Player & Auto-gen (Lifelong Learning)

1. สร้าง game store (Zustand) สำหรับ game state
2. สร้าง exercise renderer components
3. สร้าง game player page
4. สร้าง player_lesson_progress tracking system
5. คำนวณ kurio progress จาก player_lesson_progress (ไม่ใช้ table แยก)
6. Implement auto-gen logic: เมื่อผู้เล่นเล่นไปถึง 70-80% ของเกม (คำนวณจาก lesson progress) จะ trigger การสร้างเกมใหม่อัตโนมัติ
7. สร้าง background job สำหรับ auto-generate games เมื่อถึง threshold
8. สร้าง tRPC game router สำหรับ exercise operations และ progress tracking

### Phase 6: UI/UX Polish

1. Update global CSS สำหรับ dark theme
2. สร้าง loading states และ transitions
3. สร้าง error boundaries
4. เพิ่ม animations สำหรับ seamless UX (framer-motion)
5. Responsive design

## Key Files to Create/Modify

### New Files

- `src/server/db/schemas/user-profiles.ts`
- `src/server/db/schemas/kurios.ts`
- `src/server/db/schemas/kurio-resources.ts`
- `src/server/db/schemas/units.ts`
- `src/server/db/schemas/lessons.ts`
- `src/server/db/schemas/exercises.ts`
- `src/server/db/schemas/player-exercise-plays.ts`
- `src/server/db/schemas/player-lesson-progress.ts`
- `src/server/api/routers/kurio.ts`
- `src/server/api/routers/game.ts`
- `src/server/api/routers/auth.ts`
- `src/lib/ai/openai-client.ts`
- `src/lib/ai/game-generator.ts`
- `src/lib/storage/supabase-storage.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/stores/kurio-store.ts`
- `src/stores/game-store.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(dashboard)/kurios/page.tsx`
- `src/app/(dashboard)/kurios/create/page.tsx`
- `src/app/(dashboard)/kurios/[id]/page.tsx`
- `src/app/(dashboard)/kurios/[id]/edit/page.tsx`
- `src/app/(dashboard)/profile/page.tsx`
- `src/app/api/upload/route.ts`
- `src/app/middleware.ts`
- `src/components/custom/kurio/kurio-form.tsx`
- `src/components/custom/kurio/kurio-card.tsx`
- `src/components/custom/kurio/kurio-list.tsx`
- `src/components/custom/kurio/input-selector.tsx`
- `src/components/custom/kurio/difficulty-selector.tsx`
- `src/components/custom/game/exercise-renderer.tsx`
- `src/components/custom/game/game-player.tsx`
- `src/components/custom/game/progress-tracker.tsx`
- `src/components/custom/auth/login-form.tsx`
- `src/components/custom/auth/signup-form.tsx`
- `src/hooks/use-kurio.ts`
- `src/hooks/use-game.ts`
- `src/hooks/use-auth.ts`

### Files to Modify

- `src/env.js` - เพิ่ม env variables
- `src/server/api/trpc.ts` - เพิ่ม auth middleware และ protectedProcedure
- `src/server/api/root.ts` - เพิ่ม routers (auth, kurio, game)
- `src/server/db/schemas/index.ts` - export schemas ทั้งหมด
- `src/styles/globals.css` - update dark theme
- `package.json` - เพิ่ม dependencies

## Dependencies to Add

- zustand (^4.5.0)
- @supabase/supabase-js (^2.39.0)
- @supabase/ssr (^0.1.0)
- openai (^4.20.0)
- framer-motion (^11.0.0)

## Environment Variables

- OPENAI_API_KEY (server-side)
- NEXT_PUBLIC_SUPABASE_URL (client-side)
- NEXT_PUBLIC_SUPABASE_ANON_KEY (client-side)
- SUPABASE_SERVICE_ROLE_KEY (server-side)

### To-dos

- [ ] Install dependencies: zustand, @supabase/supabase-js, @supabase/ssr, openai, framer-motion
- [ ] Update src/env.js to add OpenAI and Supabase environment variables (OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY)
- [ ] Create database schema: user-profiles.ts with id, user_id, display_name, avatar_url, created_at, updated_at
- [ ] Create database schema: kurios.ts with all fields including difficulty_level enum, auto_gen settings, status enum
- [ ] Create database schema: kurio-resources.ts with resource_type enum, file_url, content fields, order_index
- [ ] Create database schema: units.ts, lessons.ts, exercises.ts with proper relationships and enums
- [ ] Create database schema: player-exercise-plays.ts and player-lesson-progress.ts with proper relationships
- [ ] Update src/server/db/schemas/index.ts to export all schemas
- [ ] Create src/lib/supabase/client.ts for client-side Supabase Auth Client
- [ ] Create src/lib/supabase/server.ts for server-side Supabase Auth Client
- [ ] Create src/lib/supabase/middleware.ts for Next.js middleware Supabase client
- [ ] Update src/server/api/trpc.ts to add auth middleware and create protectedProcedure
- [ ] Create src/server/api/routers/auth.ts with user profile operations
- [ ] Create src/app/middleware.ts for Next.js route protection
- [ ] Create src/components/custom/auth/login-form.tsx using Supabase Auth Client
- [ ] Create src/components/custom/auth/signup-form.tsx using Supabase Auth Client
- [ ] Create src/app/(auth)/login/page.tsx and signup/page.tsx
- [ ] Create tRPC mutation in auth router for user profile creation on signup
- [ ] Create src/server/api/routers/kurio.ts with CRUD operations and kurio_resources management
- [ ] Create src/stores/kurio-store.ts (Zustand) for kurio form state management
- [ ] Create src/components/custom/kurio/input-selector.tsx that supports multiple resources (text/file/image)
- [ ] Create src/components/custom/kurio/difficulty-selector.tsx
- [ ] Create src/app/api/upload/route.ts for file/image upload using Supabase Storage
- [ ] Create src/components/custom/kurio/kurio-form.tsx with form validation
- [ ] Create src/components/custom/kurio/kurio-card.tsx and kurio-list.tsx
- [ ] Create src/app/(dashboard)/kurios/page.tsx (list), create/page.tsx, [id]/page.tsx, [id]/edit/page.tsx
- [ ] Create src/lib/ai/openai-client.ts with OpenAI client setup
- [ ] Create src/lib/ai/game-generator.ts for generating game content from kurio_resources
- [ ] Create background job/API route for async AI generation with progress tracking
- [ ] Create src/server/api/routers/game.ts for exercise operations and player_lesson_progress tracking
- [ ] Create src/stores/game-store.ts (Zustand) for game state management
- [ ] Create src/components/custom/game/exercise-renderer.tsx for rendering different exercise types
- [ ] Create src/components/custom/game/game-player.tsx and progress-tracker.tsx
- [ ] Implement player_lesson_progress tracking system that updates on exercise completion
- [ ] Implement auto-generation logic: calculate kurio progress from player_lesson_progress and trigger AI generation when reaching 70-80% threshold
- [ ] Update src/styles/globals.css for dark theme with proper color variables
- [ ] Add loading states, error boundaries, and framer-motion animations for seamless UX