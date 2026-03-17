# School ERP System

A full-stack School ERP system with Admin, Teacher, and Student portals, featuring an AI-powered chatbot for reports and workflow automation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| UI | Tailwind CSS + shadcn/ui |
| Chatbot | Vercel AI SDK + Groq (Llama 3.3) |
| Auth | JWT (jose) + bcryptjs |
| Deployment | Vercel + Supabase |

## Features

### Admin Portal
- Dashboard with overview stats (students, teachers, classes, attendance)
- Student management (CRUD with search/filter)
- Teacher management (CRUD + assign to classes/subjects)
- Class & subject management (Classes 1-12 with sections)
- Exam management

### Teacher Portal
- Dashboard with assigned classes overview
- Mark attendance (per class, per date, toggle Present/Absent/Late)
- Enter/edit marks for exams

### Student Portal
- Dashboard with attendance %, average score, recent results
- Attendance history view
- Marks/results table with pass/fail status

### AI Chatbot (Admin & Teacher)
- Natural language queries powered by Llama 3.3 via Groq
- Tools: search students, attendance summaries, class performance analytics, report card generation, school statistics
- Floating chat widget with streaming responses

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier: [supabase.com](https://supabase.com))
- A Groq API key (free tier: [console.groq.com](https://console.groq.com))

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/charizard00001/school-erp.git
   cd school-erp
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase `DATABASE_URL`, `JWT_SECRET`, and `GROQ_API_KEY` in `.env`.

3. **Setup database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

4. **Run dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | admin123 |
| Teacher | teacher@school.com | teacher123 |
| Student | student@school.com | student123 |

## Project Structure

```
school-erp/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data seeder
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── admin/         # Admin portal pages
│   │   │   ├── teacher/       # Teacher portal pages
│   │   │   ├── student/       # Student portal pages
│   │   │   └── layout.tsx     # Shared sidebar layout
│   │   ├── api/
│   │   │   ├── auth/          # Login/logout endpoints
│   │   │   ├── chat/          # AI chatbot streaming endpoint
│   │   │   ├── marks/         # Marks data API
│   │   │   ├── reports/       # Report generation API
│   │   │   └── students/      # Students data API
│   │   ├── login/page.tsx     # Login page
│   │   └── page.tsx           # Root redirect
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── chat-widget.tsx    # AI chatbot widget
│   │   └── sidebar.tsx        # Navigation sidebar
│   ├── lib/
│   │   ├── auth.ts            # JWT session management
│   │   ├── chatbot-tools.ts   # AI tool definitions
│   │   ├── prisma.ts          # Prisma client singleton
│   │   └── utils.ts           # Utilities
│   └── middleware.ts          # Route protection
├── .env.example
└── package.json
```

## Deployment

### Vercel
1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables (DATABASE_URL, JWT_SECRET, GROQ_API_KEY)
4. Deploy

### Database
Run migrations on your production Supabase database:
```bash
npx prisma db push
```

## License

MIT
