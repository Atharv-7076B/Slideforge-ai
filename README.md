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

[Explore Features](#-key-features) • [System Architecture](#-system-architecture) • [Database Schema](#%EF%B8%8F-database-design--schema) • [Design Themes](#-design-system--themes) • [Slide Layouts](#-slide-layout-engine) • [Quick Start](#-local-development-setup) • [Environment Reference](#%EF%B8%8F-environment-configuration) • [Deployment](#-production-deployment)

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
- [Database Design & Schema](#%EF%B8%8F-database-design--schema)
- [Invented APIs Reference](#14--invented-apis--services-reference)

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

---

# 🗄️ Database Design & Schema

An enterprise-grade, highly resilient database architecture powering the **SlideForge AI** autonomous presentation engine. This documentation provides a comprehensive, technically accurate guide to the database schema, data models, entity relationships, background synchronization pipelines, and production design decisions.

---

## 1. 🏗️ Database Overview

* **Database Engine**: **PostgreSQL 16** hosted on **Neon Serverless PostgreSQL** with an integrated PgBouncer connection pooler (`port 6543`, `sslmode=require&pgbouncer=true`).
* **ORM & Persistence Layer**: **Prisma ORM (v6.19)** utilizing `@prisma/client` with strict TypeScript bindings and migration tracking.
* **Authentication Storage**: **Better Auth (v1.6)** integrated directly via `prismaAdapter(prisma, { provider: 'postgresql' })`, managing sessions, multi-provider credentials, and verification tokens.
* **Main Persistent Data**:
  * **User & Security**: User profiles, active cryptographic session tokens, and OAuth/credential authentication records.
  * **Presentations**: Core generation metadata, prompts, design themes, tone, slide count targets, and lifecycle status transitions (`DRAFT` → `GENERATING` → `COMPLETED` / `FAILED`).
  * **Slides**: Ordered slide sequences, titles, JSON-serialized polymorphic layout bodies, speaker notes, AI visual generation prompts, and persistent ImageKit CDN media URLs.
* **Communication Architecture**:
  * **Client / Server Actions**: TanStack Start server functions (`createServerFn`) running inside Nitro execute type-safe Prisma client queries on demand.
  * **Durable Background Pipeline**: Asynchronous background workflows orchestrated by **Inngest** (`presentation/generate`) persist slides in multi-step execution blocks wrapped in an automated exponential retry handler (`runDbQueryWithRetry`).
* **Suitability for SlideForge AI**:
  * **Relational Integrity**: Enforces strict cascading foreign keys (`User` ➔ `Presentation` ➔ `Slide`), eliminating orphaned slides or presentation records upon account deletion.
  * **Hybrid Relational + Structured Document Model**: Relational tables power index-accelerated querying, sorting, and user tenant isolation, while structured JSON storage in `slide.content` accommodates 8 polymorphic layout archetypes without table bloat.
  * **Serverless Elasticity**: Neon's separation of compute and storage enables auto-scaling from zero, while PgBouncer pooling prevents socket exhaustion during high-concurrency background AI synthesis.

---

## 2. 🧩 Entity / Table Overview

| Entity / Table | Model Name | Primary Key | Purpose |
| :--- | :--- | :--- | :--- |
| **`user`** | `User` | `id` (TEXT) | Core authenticated user entity; stores identity, display name, email, verification state, and profile avatar. |
| **`session`** | `Session` | `id` (TEXT) | Active authentication sessions managed by Better Auth; stores session tokens, expiration, IP address, and user agent. |
| **`account`** | `Account` | `id` (TEXT) | Authentication provider linkages (BCrypt hashed local passwords, Google OAuth, and GitHub OAuth credentials/tokens). |
| **`verification`** | `Verification` | `id` (TEXT) | Ephemeral verification tokens and one-time secrets for email verification workflows. |
| **`presentation`** | `Presentation` | `id` (CUID) | Top-level presentation record; tracks user ownership, prompt, visual theme, narrative tone, slide count, and generation lifecycle status. |
| **`slide`** | `Slide` | `id` (CUID) | Individual slide node; stores sequence ordering, title headline, JSON-serialized layout payload, speaker notes, image prompts, and CDN asset URLs. |
| **`Test`** | `Test` | `id` (CUID) | Diagnostic table created in initial migration for verifying PostgreSQL connection pool responsiveness and health. |

> [!NOTE]
> **Implementation Scope & Architectural Boundaries:**
> * **Assets & Images**: Generated media is stored persistently on **ImageKit Global CDN**; the database stores only optimized HTTPS CDN URLs in `slide.imageUrl`, avoiding heavy binary BLOB storage in PostgreSQL.
> * **PowerPoint Exports**: Exports are compiled client-side on demand via `pptxgenjs` from live slide records; no temporary export rows or server files are persisted in the database.
> * **Customer Reviews & Complaints**: Reviews and support tickets are **not implemented** in the current schema. Dedicated sections (§7 & §8) document this reality along with production-ready future schema proposals.

---

## 3. 📋 Complete Table Structure

### 1. `user` (Prisma: `User`)
Stores authenticated user accounts. Linked to Better Auth.

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK** | Unique user identifier (Better Auth nanoid string) |
| `name` | `TEXT` | `NOT NULL` | Full display name of the user |
| `email` | `TEXT` | `NOT NULL`, **UNIQUE** | User email address; unique login identifier |
| `emailVerified` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Flag indicating whether the email has been verified |
| `image` | `TEXT` | `NULLABLE` | Remote avatar image URL |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Automatic last-updated timestamp |

* **Indexes**:
  * `user_email_key`: UNIQUE B-tree index on `("email")`

---

### 2. `session` (Prisma: `Session`)
Stores active user sessions with cryptographic tokens for stateless verification.

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK** | Unique session identifier |
| `token` | `TEXT` | `NOT NULL`, **UNIQUE** | Cryptographic session token matched against client cookie |
| `userId` | `TEXT` | `NOT NULL`, **FK** | References `user("id")` ON DELETE CASCADE ON UPDATE CASCADE |
| `expiresAt` | `TIMESTAMP(3)` | `NOT NULL` | Exact expiration timestamp of the session |
| `ipAddress` | `TEXT` | `NULLABLE` | Client IPv4/IPv6 address recorded at session generation |
| `userAgent` | `TEXT` | `NULLABLE` | Browser and device user agent string |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Session start timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Session heartbeat / update timestamp |

* **Indexes & Constraints**:
  * `session_token_key`: UNIQUE B-tree index on `("token")`
  * `session_userId_idx`: B-tree index on `("userId")`
  * `session_userId_fkey`: Foreign key to `user("id")` with `ON DELETE CASCADE`

---

### 3. `account` (Prisma: `Account`)
Stores third-party OAuth provider credentials and local email/password hashes.

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK** | Unique account record identifier |
| `accountId` | `TEXT` | `NOT NULL` | External OAuth account ID (or user identifier for credentials) |
| `providerId` | `TEXT` | `NOT NULL` | Provider slug (`credential`, `google`, `github`) |
| `userId` | `TEXT` | `NOT NULL`, **FK** | References `user("id")` ON DELETE CASCADE ON UPDATE CASCADE |
| `password` | `TEXT` | `NULLABLE` | BCrypt salted hash (for `credential` provider) |
| `accessToken` | `TEXT` | `NULLABLE` | OAuth access token from provider |
| `refreshToken` | `TEXT` | `NULLABLE` | OAuth refresh token for renewing credentials |
| `idToken` | `TEXT` | `NULLABLE` | OpenID Connect (OIDC) JWT identity token |
| `accessTokenExpiresAt` | `TIMESTAMP(3)` | `NULLABLE` | Expiration date of the OAuth access token |
| `refreshTokenExpiresAt` | `TIMESTAMP(3)` | `NULLABLE` | Expiration date of the OAuth refresh token |
| `scope` | `TEXT` | `NULLABLE` | Space-delimited provider authorization scopes |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Account link timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Account update timestamp |

* **Indexes & Constraints**:
  * `account_userId_idx`: B-tree index on `("userId")`
  * `account_userId_fkey`: Foreign key to `user("id")` with `ON DELETE CASCADE`

---

### 4. `verification` (Prisma: `Verification`)
Stores one-time verification tokens for email confirmation.

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK** | Unique verification record identifier |
| `identifier` | `TEXT` | `NOT NULL` | Subject identifier (e.g. user email address) |
| `value` | `TEXT` | `NOT NULL` | Encrypted or hashed one-time token |
| `expiresAt` | `TIMESTAMP(3)` | `NOT NULL` | Token expiration timestamp |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Record update timestamp |

* **Indexes**:
  * `verification_identifier_idx`: B-tree index on `("identifier")`

---

### 5. `presentation` (Prisma: `Presentation`)
The core domain entity representing an AI-generated presentation deck.

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK**, `DEFAULT cuid()` | Unique CUID presentation identifier |
| `userId` | `TEXT` | `NOT NULL`, **FK** | References `user("id")` ON DELETE CASCADE ON UPDATE CASCADE |
| `title` | `TEXT` | `NOT NULL` | Deck title (initialized with readable slug, editable by user) |
| `prompt` | `TEXT` | `NOT NULL` | Full unstructured prompt, topic notes, or outline entered by user |
| `slideCount` | `INTEGER` | `NOT NULL` | Requested target slide count (1 to 15) |
| `style` | `TEXT` | `NOT NULL` | Design theme key (e.g., `professional`, `dark-mode`, `futuristic`) |
| `tone` | `TEXT` | `NOT NULL` | Narrative tone (`formal`, `casual`, `persuasive`, `informative`) |
| `layout` | `TEXT` | `NOT NULL` | Layout density strategy (`balanced`, `visual`, `text-heavy`, `bullet-points`) |
| `status` | `PresentationStatus` | `NOT NULL`, `DEFAULT 'DRAFT'` | Deck lifecycle state enum (`DRAFT`, `GENERATING`, `COMPLETED`, `FAILED`) |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Presentation creation timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Last modification timestamp (used for dashboard sort) |

* **Enum Values (`PresentationStatus`)**:
  * `DRAFT`: Presentation created but generation not started.
  * `GENERATING`: Background worker is actively synthesizing narrative or rendering media.
  * `COMPLETED`: All slides and CDN media successfully generated and committed.
  * `FAILED`: Generation pipeline encountered an unrecoverable exception.
* **Indexes & Constraints**:
  * `presentation_userId_idx`: B-tree index on `("userId")`
  * `presentation_userId_fkey`: Foreign key to `user("id")` with `ON DELETE CASCADE`

---

### 6. `slide` (Prisma: `Slide`)
Individual presentation slides containing structured layout content and media assets.

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK**, `DEFAULT cuid()` | Unique CUID slide identifier |
| `presentationId` | `TEXT` | `NOT NULL`, **FK** | References `presentation("id")` ON DELETE CASCADE ON UPDATE CASCADE |
| `order` | `INTEGER` | `NOT NULL` | Zero-based sequential position index (0, 1, 2, ...) |
| `title` | `TEXT` | `NOT NULL` | Primary slide headline / header |
| `content` | `TEXT` | `NOT NULL` | Serialized JSON payload defining archetype layout and dense content |
| `notes` | `TEXT` | `NULLABLE` | AI-synthesized presenter / speaker notes |
| `imageUrl` | `TEXT` | `NULLABLE` | Persistent ImageKit CDN image URL or inline SVG fallback data URI |
| `imagePrompt` | `TEXT` | `NULLABLE` | Contextual visual prompt synthesized for image generation |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Slide creation timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Last update timestamp |

* **Internal JSON Structure of `content`**:
  ```json
  {
    "layoutType": "hero | split-left | split-right | full-image | quote | stats | grid | standard",
    "body": "Narrative paragraph...",
    "bullets": ["Bullet point 1", "Bullet point 2"],
    "quoteText": "Inspirational statement...",
    "quoteAuthor": "Attributed individual or source",
    "stats": [
      { "value": "99.9%", "label": "Uptime SLA", "type": "metric" }
    ],
    "gridItems": [
      { "title": "Card 1", "description": "Description of feature..." }
    ]
  }
  ```
* **Indexes & Constraints**:
  * `slide_presentationId_idx`: B-tree index on `("presentationId")`
  * `slide_presentationId_fkey`: Foreign key to `presentation("id")` with `ON DELETE CASCADE`

---

### 7. `Test` (Prisma: `Test`)
Diagnostic health check table.

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK**, `DEFAULT cuid()` | Test identifier |
| `name` | `TEXT` | `NOT NULL` | Diagnostic string value |

---

## 4. 🔗 Entity Relationships

```text
       ┌──────────────┐
       │     USER     │
       └──────┬───────┘
              │
              ├── 1 ───── N ─── SESSION
              │
              ├── 1 ───── N ─── ACCOUNT
              │
              └── 1 ───── N ─── PRESENTATION
                                    │
                                    └── 1 ───── N ─── SLIDE

   [VERIFICATION]   [Test]   <-- Standalone Tables
```

### Detailed Relationship Specifications

#### 1. `USER` ───( 1 : N )───> `PRESENTATION`
* **Relationship Type**: One-to-Many (Identifying Ownership)
* **Foreign Key**: `presentation.userId` references `user.id`
* **Cardinality**: One user can own zero or many presentations (`1 : 0..N`); each presentation belongs to exactly one user (`1 : 1`).
* **On Delete / Update**: `CASCADE` / `CASCADE`
* **Purpose**: Guarantees tenant isolation. Queries always scope presentations by authenticated user ID (`where: { userId }`). When a user account is deleted, all owned decks are automatically purged.

#### 2. `PRESENTATION` ───( 1 : N )───> `SLIDE`
* **Relationship Type**: One-to-Many (Compositional Aggregation)
* **Foreign Key**: `slide.presentationId` references `presentation.id`
* **Cardinality**: One presentation contains one or more slides (`1 : 1..N`); each slide belongs to exactly one presentation (`1 : 1`).
* **On Delete / Update**: `CASCADE` / `CASCADE`
* **Purpose**: Encapsulates presentation decks. Fetching a deck includes ordered slides (`orderBy: { order: 'asc' }`). If a presentation is deleted or regenerated, associated slides are deleted atomically via cascade or batch removal (`deleteMany`).

#### 3. `USER` ───( 1 : N )───> `SESSION`
* **Relationship Type**: One-to-Many
* **Foreign Key**: `session.userId` references `user.id`
* **Cardinality**: One user can maintain multiple active sessions across devices (`1 : 0..N`).
* **On Delete / Update**: `CASCADE` / `CASCADE`
* **Purpose**: Better Auth session lifecycle management. Logging out on all devices or deleting an account instantly invalidates all session tokens.

#### 4. `USER` ───( 1 : N )───> `ACCOUNT`
* **Relationship Type**: One-to-Many
* **Foreign Key**: `account.userId` references `user.id`
* **Cardinality**: One user can link multiple login methods (Email/Password, Google OAuth, GitHub OAuth) (`1 : 1..N`).
* **On Delete / Update**: `CASCADE` / `CASCADE`
* **Purpose**: Multi-provider single sign-on without duplicating user profiles.

---

## 5. 🗺️ Complete ER Diagram

```mermaid
erDiagram
    user ||--o{ session : "maintains"
    user ||--o{ account : "links"
    user ||--o{ presentation : "creates"
    presentation ||--|{ slide : "contains"

    user {
        TEXT id PK
        TEXT name
        TEXT email UK
        BOOLEAN emailVerified
        TEXT image
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    session {
        TEXT id PK
        TEXT token UK
        TEXT userId FK
        TIMESTAMP expiresAt
        TEXT ipAddress
        TEXT userAgent
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    account {
        TEXT id PK
        TEXT accountId
        TEXT providerId
        TEXT userId FK
        TEXT password
        TEXT accessToken
        TEXT refreshToken
        TEXT idToken
        TIMESTAMP accessTokenExpiresAt
        TIMESTAMP refreshTokenExpiresAt
        TEXT scope
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    verification {
        TEXT id PK
        TEXT identifier
        TEXT value
        TIMESTAMP expiresAt
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    presentation {
        TEXT id PK
        TEXT userId FK
        TEXT title
        TEXT prompt
        INTEGER slideCount
        TEXT style
        TEXT tone
        TEXT layout
        PresentationStatus status
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    slide {
        TEXT id PK
        TEXT presentationId FK
        INTEGER order
        TEXT title
        TEXT content
        TEXT notes
        TEXT imageUrl
        TEXT imagePrompt
        TIMESTAMP createdAt
        TIMESTAMP updatedAt
    }

    Test {
        TEXT id PK
        TEXT name
    }
```

---

## 6. 🎨 Presentation Data Flow

The lifecycle of presentation data spans user input, AI synthesis, CDN asset distribution, and database commits:

```text
1. User Submits Prompt & Deck Parameters (UI)
   │
   ▼
2. Server Action: createPresentation()
   ├── Inserts row into 'presentation' (status = 'GENERATING')
   └── Emits event: inngest.send("presentation/generate")
   │
   ▼
3. Inngest Background Pipeline Execution
   ├── Step 1: Gemini 2.5 Flash Narrative Synthesis (AI SDK)
   │   └── Produces structured slide JSON array (heading, bullets, quotes, stats, layoutType)
   ├── Step 2: Sequential Image Pipeline
   │   ├── Enriches prompt with theme visual aesthetics (FLUX / Imagen 3)
   │   ├── Generates 16:9 base64 illustration (or falls back to SVG mesh gradient)
   │   └── Uploads base64 to ImageKit CDN ➔ Returns persistent CDN HTTPS URL
   ├── Step 3: Atomic Slide Serialization
   │   ├── Encodes layout parameters into JSON string for 'slide.content'
   │   └── Executes prisma.slide.createMany() with retry wrapper
   └── Step 4: Status Finalization
       └── Updates 'presentation.status' to 'COMPLETED'
   │
   ▼
4. Frontend Real-Time Hydration
   ├── TanStack Query polls getPresentationWithSLiedes(presentationId)
   ├── UI parses 'slide.content' via parseSlideContent()
   └── Renders dynamic layout cards, metric counters, and CDN visuals
   │
   ▼
5. Client-Side PPTX Compilation
   └── User clicks "Export PPTX" ➔ pptxgenjs compiles vector slides in browser (0 DB load)
```

### Data Flow Details:
1. **Presentation Record Creation**: The `presentation` table immediately stores the user's intent (`prompt`, `style`, `slideCount`, `layout`, `tone`) with `status = 'GENERATING'`.
2. **Slide Linkage**: Slides are created with foreign keys `presentationId = presentation.id` and zero-based `order` indices (`0, 1, 2, ...`).
3. **Structured Content Storage**: The polymorphic layout data (quotes, metrics, bullets, cards) is stored in the `slide.content` column as a validated JSON string.
4. **Asset Decoupling**: Rather than storing heavy binary images in PostgreSQL, images are hosted on **ImageKit CDN**, and only the resulting CDN URLs (`https://ik.imagekit.io/...`) are stored in `slide.imageUrl`.
5. **On-Demand Export**: When exporting to PowerPoint, `exportPresentationToPPTX` fetches the presentation and slide records into the browser, compiles the `.pptx` file client-side using `pptxgenjs`, and triggers an instant file download without requiring database export tables.

---

## 7. ⭐ Customer Reviews Schema

> [!NOTE]
> **Implementation Status: Not Currently Implemented**
> Customer review and feedback collection is not implemented in the current production schema. Below is the proposed, production-ready schema design for when review capabilities are added.

### Future Schema Proposal

```text
USER (1) ───── (0..N) REVIEW (N) ───── (0..1) PRESENTATION
```

#### Proposed `review` Entity

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK**, `cuid()` | Unique review identifier |
| `userId` | `TEXT` | `NOT NULL`, **FK** | References `user("id")` ON DELETE CASCADE |
| `presentationId` | `TEXT` | `NULLABLE`, **FK** | References `presentation("id")` ON DELETE SET NULL |
| `rating` | `INTEGER` | `NOT NULL` | Rating score from 1 to 5 stars (`CHECK (rating BETWEEN 1 AND 5)`) |
| `comment` | `TEXT` | `NULLABLE` | User's qualitative testimonial or feedback text |
| `category` | `ReviewCategory` | `NOT NULL`, `DEFAULT 'GENERAL'` | Enum: `GENERATION_QUALITY`, `IMAGE_ACCURACY`, `EXPORT_FIDELITY`, `GENERAL` |
| `isPublic` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Flag indicating whether the review is approved for landing page display |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Submission timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Last update timestamp |

#### Why This Relationship Design?
* **`userId` (Mandatory FK)**: Binds the feedback to an authenticated author to prevent spam reviews and enable user-specific feedback histories.
* **`presentationId` (Nullable FK with `ON DELETE SET NULL`)**: Allows users to rate a specific generated deck. If the user subsequently deletes that presentation, the review remains preserved for platform analytics rather than being destroyed.
* **`isPublic` Flag**: Facilitates admin moderation before displaying testimonials on public landing pages.

---

## 8. 🛠️ Complaint Schema

> [!NOTE]
> **Implementation Status: Not Currently Implemented**
> A formal support ticket or complaint management entity is not implemented in the current production schema. Below is the proposed architecture for user issue tracking.

### Future Complaint Schema

```text
USER (1) ───── (0..N) COMPLAINT (N) ───── (0..1) PRESENTATION
```

#### Proposed `complaint` (Support Ticket) Entity

| Column | Data Type | Key / Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | **PK**, `cuid()` | Unique complaint / ticket identifier |
| `userId` | `TEXT` | `NOT NULL`, **FK** | References `user("id")` ON DELETE CASCADE |
| `presentationId` | `TEXT` | `NULLABLE`, **FK** | References `presentation("id")` ON DELETE SET NULL (optional issue context) |
| `category` | `ComplaintCategory` | `NOT NULL` | Enum: `GENERATION_FAILURE`, `BILLING_ISSUE`, `EXPORT_GLITCH`, `ACCOUNT_ACCESS`, `OTHER` |
| `subject` | `TEXT` | `NOT NULL` | Short summary headline of the problem |
| `description` | `TEXT` | `NOT NULL` | Detailed explanation of the error or complaint |
| `status` | `ComplaintStatus` | `NOT NULL`, `DEFAULT 'OPEN'` | Enum: `OPEN`, `UNDER_INVESTIGATION`, `RESOLVED`, `DISMISSED` |
| `priority` | `ComplaintPriority` | `NOT NULL`, `DEFAULT 'MEDIUM'` | Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `resolutionNotes` | `TEXT` | `NULLABLE` | Admin/support engineer's resolution commentary |
| `resolvedAt` | `TIMESTAMP(3)` | `NULLABLE` | Exact timestamp when issue was resolved |
| `createdAt` | `TIMESTAMP(3)` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Ticket creation timestamp |
| `updatedAt` | `TIMESTAMP(3)` | `NOT NULL` | Last update timestamp |

#### Why This Relationship Design?
* **Direct User Reference**: Enables support agents to inspect the user's tier, session history, and account status.
* **Nullable Presentation Reference**: Correlates errors directly with specific failed generation runs (`presentationId`), giving engineers instant access to the prompt, style, and slide state that triggered the failure.
* **State & Audit Fields**: `status`, `resolutionNotes`, and `resolvedAt` support SLA tracking and support escalation workflows.

---

## 9. 🔄 Database Flow

```text
┌──────────────┐       1. Request        ┌──────────────────────┐
│  Client UI   │ ──────────────────────> │  TanStack Start      │
│  (React 19)  │ <────────────────────── │  Server Action       │
└──────────────┘       6. Poll / Data    └──────────┬───────────┘
                                                    │
                               2. Insert Draft      │ 3. Dispatch Event
                                                    ▼
┌──────────────────────┐       5. Commit ┌──────────────────────┐
│  Neon PostgreSQL DB  │ <────────────── │   Inngest Worker     │
│  (via Prisma Client) │                 │   Pipeline           │
└──────────────────────┘                 └──────────┬───────────┘
                                                    │ 4. Generate Media
                                                    ▼
                                         ┌──────────────────────┐
                                         │ ImageKit CDN & AI    │
                                         └──────────────────────┘
```

### Core Implemented Database Operations

#### 1. User Registration & Authentication
* **Trigger**: User signs up with email/password or OAuth (Google/GitHub).
* **DB Action**: Better Auth creates a record in `user`, inserts credential hashes or OAuth tokens into `account`, and issues a cryptographic session token into `session`.
* **Query**: `prisma.user.create()` / `prisma.account.create()` / `prisma.session.create()`.

#### 2. Presentation Creation & Initialization
* **Trigger**: User enters prompt, theme, tone, and slide count on the dashboard.
* **DB Action**: Server action `createPresentation` verifies the session user and creates a new presentation with `status = 'GENERATING'`.
* **Query**:
  ```typescript
  const presentation = await prisma.presentation.create({
    data: {
      userId,
      title: generateSlug(),
      prompt: data.prompt,
      slideCount: data.slideCount,
      style: data.style,
      tone: data.tone,
      layout: data.layout,
      status: PresentationStatus.GENERATING,
    },
  })
  ```

#### 3. Slide Content & Asset Persistence
* **Trigger**: Inngest worker synthesizes slide narrative via Gemini and uploads images to ImageKit.
* **DB Action**: Worker performs an atomic bulk insert of all synthesized slides with layout JSON strings and CDN URLs.
* **Query**:
  ```typescript
  await runDbQueryWithRetry(() => prisma.slide.createMany({ data }))
  ```

#### 4. Presentation Completion Status Update
* **Trigger**: All slide images and content records have been successfully saved.
* **DB Action**: Worker transitions presentation status from `GENERATING` to `COMPLETED`.
* **Query**:
  ```typescript
  await runDbQueryWithRetry(() => prisma.presentation.update({
    where: { id: presentation.id },
    data: { status: PresentationStatus.COMPLETED },
  }))
  ```

#### 5. Presentation Reading & Dashboard Listing
* **Trigger**: User opens their dashboard or views an individual slide deck.
* **DB Action**: Queries presentations filtered by `userId`, including ordered slides.
* **Query**:
  ```typescript
  // Dashboard listing:
  const presentations = await prisma.presentation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  })

  // Live deck editor:
  const presentation = await prisma.presentation.findFirst({
    where: { id, userId },
    include: { slides: { orderBy: { order: 'asc' } } },
  })
  ```

#### 6. Deck Regeneration (Atomic Refresh)
* **Trigger**: User clicks "Regenerate" to create a fresh narrative.
* **DB Action**: Sets status back to `GENERATING`, deletes previous slide rows, and executes fresh AI generation.
* **Query**:
  ```typescript
  await prisma.presentation.update({ where: { id }, data: { status: 'GENERATING' } })
  await prisma.slide.deleteMany({ where: { presentationId: id } })
  ```

#### 7. Presentation Deletion
* **Trigger**: User deletes a deck from the dashboard.
* **DB Action**: Deletes the `presentation` row. All child `slide` records are deleted automatically via PostgreSQL foreign key `ON DELETE CASCADE`.
* **Query**:
  ```typescript
  await prisma.presentation.delete({ where: { id: data.id } })
  ```

---

## 10. 🔐 Database Design Decisions

### 1. Hybrid Relational + JSON Document Architecture
* **Decision**: Store presentation metadata and slide sequencing in relational columns, but store the slide layout body (`body`, `bullets`, `quoteText`, `stats`, `gridItems`) in a JSON-serialized text field (`slide.content`).
* **Why**: SlideForge AI supports 8 distinct slide archetypes (Hero, Split, Full-Image, Quotes, Metrics, Grids, Standard). Normalizing each archetype into separate relational tables (`slide_quote`, `slide_stat`, `slide_grid_item`) would require multi-table outer joins for every slide query, introducing schema fragility and query latency. The JSON payload allows infinite layout flexibility while maintaining relational guarantees for deck ownership and slide ordering.

### 2. CUID (Collision-Resistant Unique Identifiers) for Keys
* **Decision**: Use `cuid()` strings (`id: String @id @default(cuid())`) for domain entities (`Presentation`, `Slide`) rather than auto-incrementing integers.
* **Why**: CUIDs prevent ID enumeration attacks (users cannot guess sequential IDs to access other users' decks), avoid database sequence contention during distributed writes, and are URL-safe.

### 3. Cascading Deletes (`ON DELETE CASCADE`)
* **Decision**: Configure `onDelete: Cascade` across all primary relationships (`User` ➔ `Presentation` ➔ `Slide` and `User` ➔ `Session` / `Account`).
* **Why**: Eliminates orphan records. Deleting a presentation automatically cleans up all associated slides in a single database operation without requiring manual cleanup logic in server actions.

### 4. Strategic Foreign Key B-Tree Indexing
* **Decision**: Explicitly index foreign key columns using `@@index([userId])` on `presentation`, `session`, `account`, and `@@index([presentationId])` on `slide`.
* **Why**: In PostgreSQL, foreign key columns are not automatically indexed. Adding explicit indexes speeds up dashboard queries (`where: { userId }`), session lookups, and slide retrieval by presentation ID.

### 5. Decoupled Media CDN Persistence
* **Decision**: Store persistent HTTPS URLs in `slide.imageUrl` instead of raw image BLOBs in PostgreSQL.
* **Why**: AI-generated 16:9 images are large base64 strings. Storing binary assets in PostgreSQL causes table bloat, slows database backups, and degrades query cache efficiency. Offloading to ImageKit CDN leverages edge caching and keeps PostgreSQL row sizes tiny (kilobytes instead of megabytes).

### 6. Resilience Against Serverless Connection Exhaustion
* **Decision**: Wrap database writes in background pipelines with `runDbQueryWithRetry` (exponential backoff up to 3 attempts) and configure Neon's PgBouncer pooler (`pgbouncer=true`).
* **Why**: Serverless database computes may suspend during periods of inactivity. If a background worker attempts concurrent database writes while Neon re-provisions compute, standard connections can fail with timeout errors (`P2024` or `P2025`). The retry handler gracefully recovers without dropping user generation requests.

---

## 11. 🎤 How I Explain the Database in an Interview

> *"For SlideForge AI, I designed a resilient, multi-tenant database architecture using **PostgreSQL on Neon** paired with **Prisma ORM**.*
>
> *The core relational model is structured around a clean hierarchy: **User ➔ Presentation ➔ Slide**.*
> * *A **User** can create multiple presentations, giving us strict multi-tenant data isolation.*
> * *A **Presentation** tracks top-level deck configuration—such as the user's prompt, chosen design theme, narrative tone, slide count target, and an enum-based generation status (`DRAFT`, `GENERATING`, `COMPLETED`, `FAILED`).*
> * *Each presentation contains multiple **Slides**, linked via a foreign key with `ON DELETE CASCADE` and an explicit sequence `order` index.*
>
> *One key architectural decision I made was adopting a **hybrid relational and structured document model**. Because our presentation engine supports **8 dynamic slide archetypes**—like metric stat cards, quotes, split visuals, and feature grids—fully normalizing each layout into separate relational child tables would have created query complexity and required expensive multi-table JOINs for every slide deck preview.*
>
> *Instead, I kept deck metadata and slide sequencing strictly relational for fast indexing, while serializing the layout-specific content as validated JSON within `slide.content`. On the frontend, this is parsed into strongly typed layouts with fallback defaults.*
>
> *For media, rather than storing heavy binary images in PostgreSQL, our background pipeline uploads AI-generated 16:9 widescreen visuals directly to **ImageKit CDN** and persists only the optimized CDN URL in `slide.imageUrl`. This keeps database records lightweight and enables global edge delivery.*
>
> *A major real-world challenge I solved was handling **serverless connection timeouts on Neon**. Inngest background workers run multi-step AI synthesis tasks, and if the serverless database compute experiences a cold start or connection pool bottleneck, Prisma can throw transient connection errors (`P2024`/`P2025`). I implemented an automated exponential backoff retry handler (`runDbQueryWithRetry`) combined with PgBouncer connection pooling, ensuring zero dropped presentation runs.*
>
> *Customer reviews and support complaints are not in the current production schema, but I've already mapped out future relational extensions for both with user attribution and optional presentation linkage."*

---

## 12. 💡 Database Challenges

### Challenge 1: Serverless PostgreSQL Cold Starts & Connection Pool Limits
* **Challenge**: Neon serverless PostgreSQL suspends compute instances during periods of inactivity to optimize cost. When Inngest background workers trigger concurrent multi-slide generation jobs, initial database queries can encounter transient connection timeouts (`P2024`) or pool exhaustion errors (`P2025`).
* **Solution**: Developed `runDbQueryWithRetry`, an exponential backoff retry wrapper (`delay * 2^attempt`, up to 3 retries) that intercepts transient connection errors, paired with Neon's pooled connection string on port 6543 (`pgbouncer=true`).
* **Why**: Guarantees high durability for long-running AI synthesis pipelines without throwing 500 errors to the client during database wakeups.

### Challenge 2: Polymorphic Content Storage for 8 Slide Layout Archetypes
* **Challenge**: The engine supports 8 visual archetypes (Hero, Split-Left, Split-Right, Full-Image, Quote, Stats, Grid, Standard), each requiring completely different content fields (e.g. quote author vs. metric value/label array vs. grid title/description items). Designing a normalized relational schema with sparse nullable columns or 8 distinct child tables would cause schema bloat, complex join logic, and migration friction whenever a new layout archetype is introduced.
* **Solution**: Serialized layout-specific payloads into a single structured JSON string in `slide.content`, validated by Zod during background generation and parsed by a robust parser (`parseSlideContent`) with automated layout downgrading and default fallbacks.
* **Why**: Delivers maximum flexibility, single-query slide fetching (`include: { slides: true }`), and backward compatibility while retaining relational guarantees for deck ordering and ownership.

### Challenge 3: Slide Regeneration State Idempotency
* **Challenge**: When users regenerate an existing presentation with new tone or style parameters, re-running the AI pipeline could leave orphaned or duplicate slides if generation fails mid-stream or retries execute concurrently.
* **Solution**: Built an explicit transactional step that deletes existing slide rows (`prisma.slide.deleteMany({ where: { presentationId } })`) and updates deck status to `GENERATING` before triggering new slide inserts.
* **Why**: Ensures strict idempotency and clean slide sequencing without state corruption.

### Challenge 4: Preventing Database Bloat from AI Media Assets
* **Challenge**: High-resolution 16:9 widescreen images generated by FLUX.1-schnell or Imagen 3 produce multi-megabyte base64 buffers. Persisting raw image binaries directly in PostgreSQL would rapidly consume database storage, balloon backup sizes, and saturate network bandwidth on slide queries.
* **Solution**: Decoupled asset storage from the database by piping base64 buffers directly to **ImageKit Global CDN** and storing only the resulting HTTPS URL string in `slide.imageUrl`.
* **Why**: Keeps PostgreSQL rows under a few kilobytes, enables browser-level image caching, and drastically speeds up slide fetching across the application.

---

## 13. 🚀 Future Improvements

1. **Native PostgreSQL `JSONB` Migration**:
   * *Current*: Slide content is stored as `TEXT` containing JSON strings.
   * *Future*: Migrate `slide.content` to native PostgreSQL `JSONB` with GIN indexing to allow direct SQL filtering (e.g. querying presentations that contain specific metric thresholds or layout archetypes).

2. **Presentation Versioning & Rollback History**:
   * Introduce a `presentation_version` and `slide_version` snapshot table to allow users to restore previously generated iterations of their decks.

3. **Customer Reviews & Feedback System**:
   * Implement the proposed `review` entity (§7) to collect 1–5 star ratings and qualitative testimonials linked to user accounts and presentation generation models.

4. **Integrated Support Ticketing / Complaints System**:
   * Implement the proposed `complaint` entity (§8) to allow users to flag failed AI generations or export discrepancies directly to an admin support queue.

5. **Edge Read Replicas for Public Slide Sharing**:
   * Deploy Neon read replicas to power low-latency public deck viewing links without consuming write pool connections on the primary database instance.

---

## 14. 🔌 Invented APIs & Services Reference

A complete, human-readable reference of every custom API, server action, webhook, background pipeline, and internal service engine designed and built for **SlideForge AI**, explained in simple words.

### 🌐 1. Server Action APIs (RPC Functions)

These are secure, type-safe functions running on the server that the frontend calls directly to manage presentations, user data, and slide generation.

| API Function | Protocol / Method | What It Does (In Simple Words) | Key Inputs | Key Outputs / Return |
| :--- | :--- | :--- | :--- | :--- |
| **`createPresentation`** | `POST` (Server Action) | Starts creating a presentation: saves your chosen topic, slide count, tone, and theme into the database, and immediately kicks off the AI generator. | `prompt`, `slideCount`, `style`, `tone`, `layout` | The newly created presentation record with `status: 'GENERATING'` |
| **`getPresentationWithSLiedes`** | `GET` (Server Action) | Loads a single presentation with all of its slides, speaker notes, layout cards, and image URLs in the exact presentation order. | `id` (Presentation ID) | Complete presentation object including an ordered `slides[]` array |
| **`listPresentations`** | `GET` (Server Action) | Retrieves all slide decks owned by the currently logged-in user so they can be shown on their dashboard. | Authenticated session | Array of presentations sorted with newest decks at the top |
| **`updatePresentation`** | `POST` (Server Action) | Modifies presentation details like updating the title, prompt, theme, or tone without modifying the slides. | `id` + updated field values | Updated presentation record |
| **`regeneratePresentation`** | `POST` (Server Action) | Wipes out previous slides, sets the presentation back to generating state, and asks the AI to generate a brand-new set of slides. | `id` (Presentation ID) | Confirmation object (`{ ok: true }`) |
| **`deletePresentation`** | `POST` (Server Action) | Permanently deletes a presentation and automatically cleans up all associated slides from the database. | `id` (Presentation ID) | Confirmation object (`{ ok: true }`) |
| **`getSession`** | `GET` (Server Action) | Checks the user's browser cookie to determine who is currently logged in and returns their user profile. | Browser request headers & cookies | Authenticated user profile or `null` if logged out |
| **`ensureSession`** | `GET` (Server Action) | Protects private pages by verifying an active session and immediately stopping unauthorized visitors. | Browser request headers & cookies | Active user session or throws `Unauthorized` error |

---

### 🚀 2. REST & Webhook HTTP Routes (`/api/*`)

HTTP endpoints created for background processing, authentication callbacks, and diagnostic checks.

| Endpoint Route | HTTP Method(s) | What It Does (In Simple Words) | Consumer / Caller |
| :--- | :--- | :--- | :--- |
| **`/api/inngest`** | `GET`, `POST`, `PUT` | Webhook endpoint where Inngest sends signals to run long background jobs (like AI slide generation) safely without timing out. | Inngest Background Runner |
| **`/api/auth/$`** | `GET`, `POST` | Catch-all authentication endpoint handling user registration, password sign-in, session tokens, and Google/GitHub OAuth logins. | Frontend Auth Forms & OAuth Providers |
| **`/api/test-image`** | `GET` | A diagnostic test page that runs server-side AI image generation and displays the resulting image directly in your browser. | Developers & Health Monitoring |

---

### ⚙️ 3. Background Job Orchestration APIs

Asynchronous workflows managed by Inngest that perform heavy AI computations in the background so the user's browser never freezes.

| Workflow / Function | Trigger Event | What It Does (In Simple Words) | Failure Recovery |
| :--- | :--- | :--- | :--- |
| **`generatePresentation`** | `presentation/generate` | The master presentation robot: calls Google Gemini 2.5 Flash to write slides, generates 16:9 images, uploads them to ImageKit CDN, and saves everything to PostgreSQL. | Multi-step retries, automatic SVG fallbacks, marks deck as `FAILED` on hard crash |
| **`generatePresentationInline`** | Direct Function Call | An automatic backup generator that runs directly on the web server if the background Inngest event broker is unavailable or offline. | Synchronous in-process fallback execution |

---

### 🧠 4. Core Internal Engines & Utility APIs

Specialized utility engines created to handle slide styling, media generation, layout parsing, and file exports.

| Engine / Utility | File Location | What It Does (In Simple Words) |
| :--- | :--- | :--- |
| **`generateSlideImage()`** | `src/server/gemini-image.ts` | Contacts Hugging Face AI models (Qwen-Image with FLUX fallback) to generate 16:9 widescreen images matching the presentation theme. |
| **`exportPresentationToPPTX()`** | `src/features/presentation/utils/export-pptx.ts` | Compiles your web slides directly in the browser into a real Microsoft PowerPoint (`.pptx`) file with editable text, vector cards, and theme colors. |
| **`parseSlideContent()`** | `src/features/presentation/utils/slide-content-parser.ts` | Safely reads JSON slide content from the database and maps it into one of 8 visual layouts (Hero, Split, Quote, Stats, Grid, etc.) with automatic fallback defaults. |
| **`getPlaceholderImage()`** | `src/features/presentation/utils/placeholder-mapper.ts` | Dynamically creates custom SVG vector illustrations and mesh gradients matching the active theme whenever external AI image APIs are unavailable. |
| **`runDbQueryWithRetry()`** | `src/integrations/inngest/functions.ts` | An automated database wrapper that detects serverless connection timeouts on Neon and automatically retries queries up to 3 times before failing. |
| **`checkImageKitAvailability()`** | `src/integrations/inngest/functions.ts` | Sends a lightweight probe to the ImageKit Upload API before image rendering to verify keys and prevent failed background jobs. |


#   S l i d e F o r g e - A i  
 