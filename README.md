# SlideForge AI - Premium AI Presentation SaaS Platform

SlideForge AI is a premium, modern, and clean AI-powered presentation generation SaaS platform. Inspired by the design ethics of Linear, Framer, Vercel, and Notion, it provides a high-contrast dark theme landing page, minimalist typography, and fluid micro-interactions. Users can input any topic or raw notes and instantly generate structured slide decks featuring auto-balanced layouts, context-matched 16:9 AI-generated illustrations, and high-fidelity PowerPoint (PPTX) exports.

---

## 🎨 Design System & Style

- **Premium Aesthetic**: Clean dark mode utilizing rich deep shades (`#050506` / `bg-zinc-950`), thin, elegant borders (`border-zinc-800`), and generous whitespace.
- **Accents**: Subtle orange/amber highlights (`text-orange-500` / `bg-orange-500` / `hover:border-orange-500/20`) to map cleanly to the workspace's default peach palette.
- **Typography**: Clean, readable typography using Geist or Inter with a robust layout hierarchy.
- **Animations**: Driven by `framer-motion` to produce subtle, high-performance card scaling, fade-in loading steps, and smooth state updates without cluttering the screen.

---

## 🚀 Key Features

### 1. AI Slide Outline Generation
- Utilizes **Google Gemini (gemini-3.5-flash)** to synthesize topics or notes into a structured narrative presentation.
- Dynamically generates distinct layouts (Hero, Stats, Quote, Grid, Split layouts, Full-Image, and Standard) matching premium design standards.

### 2. Sequential Widescreen Image Pipeline
- Sequentially processes widescreen (`1024x576`) 16:9 slide images via **Inngest** background jobs.
- Integrates with the **FLUX.1-schnell** model on Hugging Face.
- Uploads images to **ImageKit** with retry capabilities and stores URLs in the database.

### 3. Dynamic Visual Layout Balancer
- Performs text density analysis. If text is brief, fonts scale up and layouts automatically balance margins and spacing to eliminate awkward gaps.
- Renders premium mesh background gradients if image models fail or are disabled.

### 4. Native PowerPoint (PPTX) & PDF Export
- Leverages `pptxgenjs` to compile widescreen presentations directly into vector shapes, native text blocks, and embedded image files.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript, Tailwind CSS (v4 via `@tailwindcss/vite`)
- **Routing & Framework**: TanStack Router (file-based routing), TanStack Start (Nitro dev server)
- **State & Action Manager**: TanStack Query (React Query)
- **Database / ORM**: Prisma ORM with SQLite (development) or PostgreSQL (production)
- **Authentication**: Better Auth
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Background Orchestration**: Inngest

---

## 📂 Folder Structure & Component Architecture

```
slideforge-ai/
├── app/
│   └── globals.css           # Global CSS variables & assets
├── prisma/
│   ├── schema.prisma         # Database schemas for users, accounts, decks
│   └── dev.db                # SQLite local development database
├── src/
│   ├── components/            # Shared UI components
│   │   ├── auth/             # Login & Signup view components
│   │   ├── ui/               # Lower-level design tokens (buttons, cards, sliders)
│   │   ├── landing-page.tsx  # Redesigned premium SaaS landing page
│   │   └── navbar.tsx        # Global header navigation and theme switcher
│   ├── features/
│   │   ├── actions/          # Database mutations and queries
│   │   ├── components/       # Presentation lists, slide editors, previews
│   │   ├── constant/         # Brand definitions and theme options
│   │   └── presentation/     # Layout options and PowerPoint compiler
│   ├── integrations/
│   │   └── inngest/          # Background event loops and handlers
│   ├── lib/                  # Auth clients, API clients, Query client
│   ├── routes/               # TanStack File-Based routing
│   │   ├── __root.tsx        # Shell layout & Toasters
│   │   ├── index.tsx         # Main entry point (redirects to /dashboard if logged in)
│   │   └── dashboard.tsx     # Workspace console for deck generations
│   ├── styles.css            # Custom glassmorphism, animations, styles
│   └── router.tsx            # TanStack Router config
├── package.json              # Project dependencies and script runners
├── tsconfig.json             # TypeScript configurations
└── vite.config.ts            # Vite compile environment & Tailwind plugin
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Connection (Prisma)
DATABASE_URL="file:./dev.db"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-super-secret-auth-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Hugging Face AI Image Generation
HF_TOKEN="hf_your_hugging_face_token_here"
VITE_USE_REAL_AI_IMAGES="true" # Set to true to call FLUX, false for fallbacks

# ImageKit Integration (Media Hosting)
IMAGEKIT_PUBLIC_KEY="public_your_imagekit_public_key"
IMAGEKIT_PRIVATE_KEY="private_your_imagekit_private_key"
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_endpoint_id"

# Inngest Event Processing
INNGEST_EVENT_KEY="local"
```

---

## 💻 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize database schemas
```bash
npx prisma db push
```

### 3. Run Inngest Dev Server
SlideForge AI uses Inngest for background orchestration. Open a separate terminal and run:
```bash
npx inngest-cli@latest dev
```

### 4. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🏗️ Deployment Instructions

To compile SlideForge AI for production deployment:

```bash
# Check TypeScript types and Prettier styling
npm run check

# Create production bundles
npm run build
```

The build compiles into an optimized Node.js server using **Nitro**. Start the production server locally by running:

```bash
node dist/server/index.mjs
```

---

## 🔮 Future Roadmap

- [ ] **Collaborative Live Rooms**: Add multiplayer cursors and real-time co-authoring using WebSockets.
- [ ] **Custom Style Lora Fine-Tuning**: Allow teams to fine-tune image models on their company style guides.
- [ ] **Speech-to-Presentation Mode**: Generate an entire presentation deck from a recorded audio note or meeting transcript.
- [ ] **AI-driven Chart Engine**: Insert live spreadsheets and automatically format bar charts, line graphs, and pie slices in brand colors.

---

## 📄 License

This project is licensed under the MIT License. See individual code headers for detail.
