# SlideForge AI

<div align="center">

![SlideForge AI Banner](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.jpg)

# ⚡ SlideForge AI

### Autonomous, Full-Stack AI Presentation SaaS Platform

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-Nitro-FF4154?style=for-the-badge&logo=tanstack&logoColor=white)](https://tanstack.com/start)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Inngest](https://img.shields.io/badge/Inngest-Durable_Workflows-000000?style=for-the-badge&logo=inngest&logoColor=white)](https://www.inngest.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-OAuth_%26_Credentials-0A0A0A?style=for-the-badge&logo=auth0&logoColor=white)](https://better-auth.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>SlideForge AI</strong> is an enterprise-grade presentation platform that transforms raw ideas, bullet points, and prompts into widescreen (16:9) slide decks. Featuring context-aware narrative generation, 8 responsive slide layouts, 9 curated design themes, real-time fullscreen slideshow presentation, and native 1:1 PowerPoint (<code>.pptx</code>) vector exports.
</p>

[Explore Features](#-key-features) • [System Architecture](#-system-architecture) • [Design Themes](#-design-system--themes) • [Slide Layouts](#-slide-layout-engine) • [Quick Start](#-local-development-setup) • [Environment Reference](#%EF%B8%8F-environment-configuration) • [Deployment](#-production-deployment)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Slide Layout Engine](#-slide-layout-engine)
- [Design System & Themes](#-design-system--themes)
- [Resilience & Reliability Mechanisms](#-resilience--reliability-mechanisms)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Repository Structure](#-repository-structure)
- [Environment Configuration](#%EF%B8%8F-environment-configuration)
- [Local Development Setup](#-local-development-setup)
- [NPM Scripts Reference](#-npm-scripts-reference)
- [Production Deployment](#-production-deployment)
- [License](#-license)

---

## 🌟 Overview

SlideForge AI bridges the gap between raw unstructured notes and executive-ready presentations. Built on **TanStack Start** with **React 19** and compiled via **Nitro**, it combines durable background job execution, dual AI image generation pipelines, resilient serverless database connection handling, and direct vector PowerPoint compilation.

### Why SlideForge AI?

- **Intelligent Deck Synthesis**: Synthesizes prompts into cohesive presentation arcs using **Google Gemini 2.5 Flash** with strict JSON schema outputs.
- **8 Dynamic Slide Archetypes**: Rather than generic static templates, slides dynamically adapt to content density (Hero, Split, Full-Image, Quotes, Metrics, Grids, and Standard).
- **Dual AI Image Engine + Zero-Downtime Fallback**: Uses **Hugging Face FLUX.1-schnell** or **Google Imagen 3**, backed by a procedural SVG/mesh fallback generator to ensure presentations never break.
- **Native 16:9 PowerPoint Export**: Generates editable `.pptx` files with real vector shapes, typography, colors, and embedded images via `pptxgenjs`.
- **Fullscreen Slideshow Mode**: Practice and present live decks with keyboard-controlled presentation tools directly inside the browser.
- **Resilient Infrastructure**: Engineered for serverless environments with automated exponential retries for PostgreSQL connection pooling and pre-flight diagnostics for media CDNs.

---

## 🏗️ System Architecture

SlideForge AI utilizes an asynchronous, event-driven architecture to guarantee high throughput and resilience during heavy AI synthesis and media rendering:

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (React 19 & TanStack Router)"]
        UI["Modern Dark-Mode UI"]
        Editor["Interactive Slide Deck Editor"]
        Presenter["Fullscreen Slideshow Mode"]
        ExportBtn["Native PPTX Export (.pptx)"]
    end

    subgraph Server["Server Layer (TanStack Start & Nitro)"]
        Auth["Better Auth (Google, GitHub, Credentials)"]
        ServerActions["Server Functions & Mutations"]
        InngestEndpoint["/api/inngest Webhook Handler"]
    end

    subgraph Background["Durable Background Pipeline (Inngest)"]
        Orchestrator["Inngest Event: generatePresentation"]
        StepGemini["Step 1: Gemini 2.5 Flash Narrative Synthesis"]
        StepParser["Step 2: Content & Layout Sanitizer"]
        StepImages["Step 3: Sequential 16:9 Image Generation"]
        StepCDN["Step 4: ImageKit CDN Upload & Verification"]
        StepDB["Step 5: Database Commit with Pool Retry"]
    end

    subgraph AIProviders["AI & Media Infrastructure"]
        GeminiAI["Google Gemini 2.5 Flash (AI SDK)"]
        FLUX["Hugging Face FLUX.1-schnell"]
        Imagen["Google Imagen 3 (Google Gen AI)"]
        FallbackSVG["Procedural SVG / Mesh Gradient Mapper"]
        ImageKitCDN["ImageKit Global CDN"]
    end

    subgraph DatabaseLayer["Data Persistence"]
        Prisma["Prisma ORM"]
        NeonDB[("Neon Serverless PostgreSQL (PgBouncer Pool)")]
    end

    UI -->|1. Submit Topic / Notes| ServerActions
    ServerActions -->|2. Dispatch Event| Orchestrator
    Orchestrator --> StepGemini
    StepGemini -->|AI SDK| GeminiAI
    GeminiAI -->|Structured Slide JSON| StepParser
    StepParser --> StepImages
    StepImages -->|Primary| FLUX
    StepImages -.->|Alternative| Imagen
    StepImages -.->|Fallback on error / rate-limit| FallbackSVG
    StepImages --> StepCDN
    StepCDN -->|Upload & Optimize| ImageKitCDN
    StepCDN --> StepDB
    StepDB -->|runDbQueryWithRetry| Prisma
    Prisma --> NeonDB
    Editor <-->|TanStack Query Polling| ServerActions
    Editor --> ExportBtn
    ExportBtn -->|Vector Compilation| Client
```

---

## 🚀 Key Features

### 1. 🤖 AI Narrative Synthesis (Google Gemini 2.5 Flash)

- Accepts unstructured notes, business goals, or simple prompts.
- Synthesizes topic structures with clear beginnings, middle narratives, and executive conclusions.
- Enforces strict JSON formatting containing slide metadata: `title`, `layoutType`, `body`, `bullets`, `quoteText`, `quoteAuthor`, `stats`, and `gridItems`.

### 2. 🖼️ Sequential Widescreen Image Pipeline

- Automatically synthesizes custom, context-specific image prompts matching the presentation's style.
- Generates widescreen 16:9 (`1024x576`) illustrations via **Hugging Face FLUX.1-schnell** or **Google Imagen 3**.
- Uploads images to **ImageKit CDN** with unique slugs and persistent hosting.
- **Smart Procedural Fallback Engine**: If an AI API token is missing, rate-limited, or disabled (`VITE_USE_REAL_AI_IMAGES !== 'true'`), the engine generates tailored SVG vector illustrations and ambient mesh gradients matching the active theme.

### 3. 📊 Dynamic Visual Layout Balancer

- Performs real-time content density analysis.
- Automatically scales font sizes up or down and balances vertical and horizontal whitespace, preventing awkward empty gaps.
- Renders rich visual cards, translucent glassmorphic surfaces, and responsive metric counters.

### 4. 🖥️ Fullscreen Slideshow Presenter

- Built-in presentation modal (`SlideshowModal`) with zero-latency slide transitions.
- Native keyboard navigation:
  - `→` / `Space`: Advance to next slide
  - `←`: Return to previous slide
  - `Esc`: Exit presentation mode
  - `F`: Toggle true browser fullscreen via `useFullscreen` hook
- Progress indicator showing current slide index and total slides.

### 5. 📦 Native PowerPoint (.pptx) Vector Export

- Client-side compilation powered by `pptxgenjs`.
- Maintains 100% fidelity with the web preview:
  - 16:9 widescreen master slides
  - Exact theme colors (backgrounds, text, card surfaces, borders, and accent highlights)
  - Native typography and proportional font scaling
  - Vector layout cards, bullet lists, metric stats, and quote blocks
  - Embedded widescreen image files

### 6. 🔐 Robust Authentication (Better Auth)

- Multi-provider authentication with session management:
  - Email & Password with secure password hashing
  - Google OAuth single sign-on
  - GitHub OAuth single sign-on
- Protected route middleware guarding `/dashboard`, `/presentations/*`, `/export`, and `/settings`.

---

## 📐 Slide Layout Engine

SlideForge AI includes **8 specialized slide archetypes** handled by `parseSlideContent` and rendered with custom visual logic:

| Layout Type   | Visual Anatomy                                                                | Best Used For                                                 |
| :------------ | :---------------------------------------------------------------------------- | :------------------------------------------------------------ |
| `hero`        | Prominent title, uppercase kicker badge, narrative statement, visual accent   | Opening slides, title decks, mission statements               |
| `split-left`  | 16:9 widescreen visual on the left, structured content & bullets on the right | Feature highlights, product demonstrations                    |
| `split-right` | Structured content on the left, high-impact illustration on the right         | Problem/solution overviews, operational deep dives            |
| `full-image`  | Full-bleed widescreen visual backdrop with high-contrast text overlay card    | Emotional hooks, key takeaways, impactful chapter transitions |
| `quote`       | Stylized large quotation mark, italic statement, and author attribution badge | Customer testimonials, executive endorsements, vision quotes  |
| `stats`       | Grid of high-contrast metric callouts with values, labels, and summaries      | Financial updates, KPI dashboards, growth metrics             |
| `grid`        | Multi-card grid containing card titles, icons, and succinct descriptions      | Feature suites, 3-pillar architectures, product comparisons   |
| `standard`    | Balanced header, structured narrative paragraph, and stylized bullet list     | Detailed insights, agendas, roadmaps, technical explanations  |

---

## 🎨 Design System & Themes

SlideForge AI supports **9 handcrafted themes** defined in `src/features/presentation/utils/theme-mapper.ts`. Every theme specifies web Tailwind classes and matching hexadecimal values for native PowerPoint exports:

| Theme Name          | Dominant Colors              | Accent Highlight             | Typography Style | Aesthetic Personality                      |
| :------------------ | :--------------------------- | :--------------------------- | :--------------- | :----------------------------------------- |
| **`professional`**  | Slate 900 (`#0f172a`)        | Sky Blue (`#38bdf8`)         | Sans-serif       | Clean, corporate, executive                |
| **`futuristic`**    | Deep Black (`#000000`)       | Neon Pink (`#ec4899`)        | Monospace        | Cyberpunk, synthetic, high-tech            |
| **`creative`**      | Deep Violet (`#2e1065`)      | Rose Pink (`#fb7185`)        | Serif (Italic)   | Editorial, artistic, thought-leadership    |
| **`minimal`**       | Crisp Light Zinc (`#fafafa`) | Slate Zinc (`#18181b`)       | Modern Sans      | Clean, airy, monochrome, gallery           |
| **`dark-mode`**     | Zinc 950 (`#09090b`)         | Emerald Mint (`#10b981`)     | Sans-serif       | Developer-first, high contrast, sleek      |
| **`corporate`**     | Slate 950 (`#020617`)        | Warm Amber (`#fbbf24`)       | Bold Uppercase   | Financial, enterprise, structured          |
| **`startup-pitch`** | Neutral 900 (`#171717`)      | Mint Green (`#34d399`)       | Bold Modern      | High-growth, venture, product launch       |
| **`education`**     | Blue 950 (`#172554`)         | Cyan (`#06b6d4`)             | Friendly Sans    | Academic, informative, research            |
| **`bold`**          | Indigo 950 (`#1e1b4b`)       | Energetic Orange (`#fb923c`) | Heavyweight Sans | High energy, marketing, direct-to-consumer |

### Presentation Tuning Options

In addition to visual themes, presentations can be customized across:

- **Tone**: `formal`, `casual`, `persuasive`, or `informative`
- **Layout Strategy**: `balanced`, `visual`, `text-heavy`, or `bullet-points`
- **Slide Count**: Configurable slider from **1 to 15 slides** per generation

---

## 🛡️ Resilience & Reliability Mechanisms

Production applications must handle third-party latency, network timeouts, and database connection limits gracefully. SlideForge AI implements several dedicated resilience mechanisms:

### 1. Exponential Backoff DB Retry (`runDbQueryWithRetry`)

Neon serverless PostgreSQL pools can experience brief cold starts or connection pool limits. The background worker wraps database queries in an automated retry handler:

- Intercepts transient errors: connection timeouts (`P2024`), closed connections, and pool exhaustion (`P2025`).
- Executes up to **3 retry attempts** with exponential backoff (`delay * 2^attempt`).

### 2. Pre-flight CDN Diagnostics (`checkImageKitAvailability`)

Before processing slide images, the pipeline sends a lightweight probe to the ImageKit Upload API:

- Verifies that credentials, endpoints, and authentication headers are valid.
- Logs detailed diagnostic telemetry to aid in environment troubleshooting.

### 3. Fail-Safe SVG Placeholder Engine

If image generation APIs are unavailable or Hugging Face rate limits are reached:

- Bypasses external calls without halting presentation creation.
- Dynamically creates themed SVG vectors with matching color gradients and contextual labels.

### 4. Resilient Slide Content Parsing (`parseSlideContent`)

If the AI model produces unstructured text instead of strict JSON:

- Parses the input into standard sections.
- Extracts bullet points and narrative text into a clean fallback layout without throwing runtime exceptions.

---

## 🛠️ Technology Stack

```
Frontend:
├── React 19.2 (Concurrent rendering & Server Functions)
├── TypeScript 6.0 (Strict mode type safety)
├── Tailwind CSS v4.1 (Vite plugin `@tailwindcss/vite`)
├── Framer Motion 12.4 (Micro-interactions & transitions)
├── Lucide React (Design system icons)
└── Radix UI & Base UI (Accessible primitive components)

Full-Stack Framework & Routing:
├── TanStack Start (Full-stack SSR & server actions)
├── TanStack Router (Type-safe file-based routing)
├── TanStack Query v5 (Server state caching & synchronization)
└── Nitro (Fast, portable server engine)

AI & Media:
├── Google Gemini 2.5 Flash (via `@ai-sdk/google` & `ai`)
├── Hugging Face FLUX.1-schnell (16:9 widescreen inference)
├── Google Gen AI SDK (`@google/genai` Imagen 3)
└── ImageKit (Cloud media storage, optimization & CDN)

Data & Authentication:
├── Prisma ORM 6.19 (Type-safe database client)
├── PostgreSQL on Neon (Serverless connection pooling)
└── Better Auth 1.6 (OAuth SSO & credentials)

Export & Background Workflows:
├── Inngest 4.3 (Event-driven durable background jobs)
└── PptxGenJS 4.0 (Client-side native PowerPoint generation)
```

---

## 📂 Repository Structure

```
slideforge-ai/
├── app/
│   └── globals.css                 # Global CSS variables & token definitions
├── prisma/
│   ├── migrations/                 # PostgreSQL database migrations
│   └── schema.prisma               # Prisma schema (User, Account, Presentation, Slide)
├── scripts/
│   └── generate-icons.js           # Asset icon & favicon generation utility
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── auth/                   # Authentication layouts & login/signup forms
│   │   ├── provider/               # ThemeProvider & app context providers
│   │   ├── ui/                     # Primitives (buttons, dialogs, sliders, cards)
│   │   ├── Footer.tsx              # Global application footer
│   │   ├── landing-page.tsx        # High-converting SaaS landing page
│   │   └── navbar.tsx              # Header navigation, auth status & user profile
│   ├── features/                   # Core domain features
│   │   ├── actions/                # Server mutations & queries
│   │   │   ├── presentation-mutation.ts
│   │   │   └── presentation-query.ts
│   │   ├── components/             # Presentation-specific UI modules
│   │   │   ├── generation-status.tsx
│   │   │   ├── presentation-card.tsx
│   │   │   ├── presentation-list-section.tsx
│   │   │   ├── slide-card.tsx
│   │   │   ├── slide-preview.tsx
│   │   │   └── slideshow-model.tsx
│   │   ├── constant/               # Templates, styles, and options
│   │   │   ├── presentation-options.tsx
│   │   │   └── presentation-templates.tsx
│   │   ├── presentation/           # Export engines, parsers, and hooks
│   │   │   ├── hooks/              # `use-fullscreen.ts`, `usePresentation-detail.ts`
│   │   │   └── utils/              # `export-pptx.ts`, `slide-content-parser.ts`, `theme-mapper.ts`, `placeholder-mapper.ts`
│   │   ├── types/                  # Domain TypeScript interfaces and Zod schemas
│   │   └── utils/                  # Shared helper functions
│   ├── hooks/                      # Custom hooks (e.g. `use-mobile.ts`)
│   ├── integrations/
│   │   └── inngest/                # Inngest client, event schemas & background workflows
│   │       ├── client.ts
│   │       ├── functions.ts
│   │       └── functions/index.ts
│   ├── lib/                        # Auth client, database client, query client
│   ├── middleware/                 # Route guards & auth middleware
│   ├── routes/                     # TanStack Router file-based pages
│   │   ├── __root.tsx              # Root layout, shell, and toasters
│   │   ├── _auth/                  # Auth route group (`login.tsx`, `signup.tsx`)
│   │   ├── api/                    # API endpoints (`inngest.ts`, `auth/$.ts`, `test-image.tsx`)
│   │   ├── index.tsx               # Landing page / Home
│   │   ├── dashboard.tsx           # Dashboard view with presentation creator & deck lists
│   │   ├── export.tsx              # Dedicated slide deck export console
│   │   ├── presentations.$presentationId.tsx # Live slide editor & presentation viewer
│   │   ├── presentations.index.tsx # Redirects to dashboard
│   │   └── settings.tsx            # Account settings & API configuration
│   ├── server/                     # Standalone server functions
│   │   ├── gemini-image.ts         # Hugging Face FLUX image generator
│   │   └── generate-image.ts       # Google Imagen 3 image generator
│   ├── styles.css                  # Custom styling, glassmorphism & animations
│   ├── routeTree.gen.ts            # Auto-generated TanStack route tree
│   └── router.tsx                  # TanStack Router initialization
├── package.json                    # Project metadata, dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
├── vercel.json                     # Vercel deployment configuration
└── vite.config.ts                  # Vite, Nitro, TanStack Start & Tailwind plugins
```

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `slideforge-ai/` directory (refer to `.env.example`):

```env
# ==========================================
# Database Connection (Neon PostgreSQL)
# ==========================================
# Use the pooled connection string (port 6543) with PgBouncer enabled
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"

# ==========================================
# Better Auth Configuration
# ==========================================
BETTER_AUTH_SECRET="your-32-character-random-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
VITE_PUBLIC_APP_URL="http://localhost:3000"

# ==========================================
# OAuth Providers (Optional, credentials mode works without these)
# ==========================================
GOOGLE_CLIENT_ID="your-google-oauth-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
GITHUB_CLIENT_ID="your-github-oauth-client-id"
GITHUB_CLIENT_SECRET="your-github-oauth-client-secret"

# ==========================================
# Google AI (Gemini Narrative Synthesis & Imagen 3)
# ==========================================
GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyYourGoogleGenerativeAiApiKey"

# ==========================================
# Hugging Face (FLUX.1-schnell Image Pipeline)
# ==========================================
HF_TOKEN="hf_your_hugging_face_user_access_token"
# Set to "true" to generate real AI images; set to "false" to use procedural SVG fallbacks
VITE_USE_REAL_AI_IMAGES="true"

# ==========================================
# ImageKit (Media Hosting & Global CDN)
# ==========================================
IMAGEKIT_PUBLIC_KEY="public_your_imagekit_public_key="
IMAGEKIT_PRIVATE_KEY="private_your_imagekit_private_key="
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_endpoint_id"

# ==========================================
# Inngest Background Orchestration
# ==========================================
INNGEST_DEV=1
```

> [!TIP]
> If you don't have a Hugging Face or ImageKit account right away, set `VITE_USE_REAL_AI_IMAGES="false"`. SlideForge AI will automatically use its built-in SVG placeholder generator without errors!

---

## 💻 Local Development Setup

Follow these steps to run SlideForge AI on your local machine:

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm** (or `pnpm`)
- **PostgreSQL Database** (We recommend a free tier on [Neon](https://neon.tech))

### 1. Clone Repository & Install Dependencies

```bash
cd slideforge-ai
npm install
```

### 2. Configure Environment Variables

Create your local `.env` file:

```bash
cp .env.example .env
```

Fill in your database URL and Google Gemini API key.

### 3. Initialize the Database

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
```

_(Optional) Inspect the database using Prisma Studio:_

```bash
npx prisma studio
```

### 4. Launch Inngest Background Worker

In a separate terminal window, start the Inngest local development server:

```bash
npm run inngest
```

This connects to `http://localhost:3000/api/inngest` and allows you to inspect background runs at `http://localhost:8288`.

### 5. Start the Development Server

In your main terminal, start the Vite & Nitro dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 NPM Scripts Reference

| Command                          | Action                                                              |
| :------------------------------- | :------------------------------------------------------------------ |
| `npm run dev`                    | Starts the local dev server on `http://localhost:3000` with HMR     |
| `npm run inngest`                | Launches the Inngest CLI dev server mapped to the local API         |
| `npm run build`                  | Compiles client and Nitro server production bundles into `.output/` |
| `npm run preview`                | Previews the compiled production build locally                      |
| `npm run test`                   | Executes the Vitest test suite                                      |
| `npm run lint`                   | Lints code using ESLint 9                                           |
| `npm run format`                 | Automatically formats files using Prettier and ESLint               |
| `npm run check`                  | Validates code formatting with Prettier                             |
| `node scripts/generate-icons.js` | Generates favicons and application icons                            |

---

## 🌐 Production Deployment

SlideForge AI is configured for seamless deployment on **Vercel** with **Neon**:

### 1. Vercel Configuration

The project root includes `vercel.json` and a Nitro serverless setup:

```json
{
  "framework": null,
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public"
}
```

In `vite.config.ts`, Nitro is configured with `maxDuration: 60` seconds for serverless functions.

### 2. Environment Variables on Vercel

Set the following in your **Vercel Project Settings → Environment Variables**:

- `BETTER_AUTH_URL`: `https://your-domain.vercel.app`
- `VITE_PUBLIC_APP_URL`: `https://your-domain.vercel.app`
- `DATABASE_URL`: Pooled connection string with `?sslmode=require&pgbouncer=true`
- `BETTER_AUTH_SECRET`: Strong 32+ character random string
- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Gemini API key
- `HF_TOKEN`: Hugging Face access token
- `VITE_USE_REAL_AI_IMAGES`: `"true"`
- `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`

### 3. OAuth Callback URLs

Add your production URL to OAuth dashboards:

- **Google Cloud Console**: `https://your-domain.vercel.app/api/auth/callback/google`
- **GitHub Developer Settings**: `https://your-domain.vercel.app/api/auth/callback/github`

### 4. Production Build & Test

```bash
# Verify formatting
npm run check

# Create production bundles
npm run build

# Start local production server
node .output/server/index.mjs
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
