# SlideForge AI - Architecture & Flow Diagrams

## Complete Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER CREATES PRESENTATION                           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
                   ┌───────────────────────────────────┐
                   │  Frontend (React Component)        │
                   │  createPresentation() called       │
                   │  Sends: {prompt, slides, style}    │
                   └───────────┬───────────────────────┘
                               │
                               ▼
                   ┌───────────────────────────────────┐
                   │  TanStack Server Function         │
                   │  ✓ Validates input               │
                   │  ✓ Authenticates user            │
                   │  ✓ Creates DB record             │
                   │    status: GENERATING             │
                   └───────────┬───────────────────────┘
                               │
                               ▼
                   ┌───────────────────────────────────┐
                   │  Inngest: Send Event              │
                   │  Event: "presentation/generate"   │
                   │  Payload: {presentationId}        │
                   └───────────┬───────────────────────┘
                               │
                               ▼
         ┌─────────────────────────────────────────────────┐
         │   BACKGROUND PROCESSING (Inngest)              │
         │                                                 │
         │  ┌──────────────────────────────────────────┐  │
         │  │ Step 1: Fetch Presentation              │  │
         │  │ • Get title, prompt, settings from DB   │  │
         │  └──────────────────────────────────────────┘  │
         │                    │                             │
         │                    ▼                             │
         │  ┌──────────────────────────────────────────┐  │
         │  │ Step 2: Mark as GENERATING              │  │
         │  │ • Update DB status                      │  │
         │  └──────────────────────────────────────────┘  │
         │                    │                             │
         │                    ▼                             │
         │  ┌──────────────────────────────────────────┐  │
         │  │ Step 3: Generate Content (Gemini)       │  │
         │  │ • Call: gemini-2.5-flash                │  │
         │  │ • Input: User prompt, settings          │  │
         │  │ • Output: {slides: [...]}               │  │
         │  │   Each slide has: heading, content,     │  │
         │  │   notes, imagePrompt                    │  │
         │  │ • Time: ~10-20 seconds                  │  │
         │  └──────────────────────────────────────────┘  │
         │                    │                             │
         │                    ▼                             │
         │  ┌──────────────────────────────────────────┐  │
         │  │ Step 4: Delete Old Slides (if any)      │  │
         │  │ • Clean up previous generation          │  │
         │  └──────────────────────────────────────────┘  │
         │                    │                             │
         │                    ▼                             │
         │  ┌──────────────────────────────────────────┐  │
         │  │ Step 5: Generate Images (PARALLEL)      │  │
         │  │ For each slide:                          │  │
         │  │                                          │  │
         │  │ ┌─ Image 1 ─┐  ┌─ Image 2 ─┐  ┌─ Image 3 ─┐
         │  │ │            │  │            │  │            │
         │  │ │ imagePrompt│  │imagePrompt │  │imagePrompt │
         │  │ │     ↓      │  │     ↓      │  │     ↓      │
         │  │ │ Optimize  │  │ Optimize  │  │ Optimize  │
         │  │ │ prompt    │  │ prompt    │  │ prompt    │
         │  │ │     ↓     │  │     ↓     │  │     ↓     │
         │  │ │ HF API    │  │ HF API    │  │ HF API    │
         │  │ │ (5-15s)   │  │ (5-15s)   │  │ (5-15s)   │
         │  │ │     ↓     │  │     ↓     │  │     ↓     │
         │  │ │ Binary    │  │ Binary    │  │ Binary    │
         │  │ │ PNG data  │  │ PNG data  │  │ PNG data  │
         │  │ │     ↓     │  │     ↓     │  │     ↓     │
         │  │ │ Convert  │  │ Convert  │  │ Convert  │
         │  │ │ base64   │  │ base64   │  │ base64   │
         │  │ │     ↓     │  │     ↓     │  │     ↓     │
         │  │ │ ImageKit │  │ ImageKit │  │ ImageKit │
         │  │ │ upload   │  │ upload   │  │ upload   │
         │  │ │ (1-3s)   │  │ (1-3s)   │  │ (1-3s)   │
         │  │ │     ↓     │  │     ↓     │  │     ↓     │
         │  │ │ Image    │  │ Image    │  │ Image    │
         │  │ │ URL      │  │ URL      │  │ URL      │
         │  │ └────────┘  └────────┘  └────────┘
         │  │
         │  │ [All happening simultaneously!]
         │  │ Total time: ~15-30 seconds (not 45-90!)
         │  │
         │  └──────────────────────────────────────────┘  │
         │                    │                             │
         │                    ▼                             │
         │  ┌──────────────────────────────────────────┐  │
         │  │ Step 6: Save Slides to Database         │  │
         │  │ • Create N slide records                │  │
         │  │ • Include imageUrl from ImageKit        │  │
         │  │ • Set imagePrompt for reference         │  │
         │  └──────────────────────────────────────────┘  │
         │                    │                             │
         │                    ▼                             │
         │  ┌──────────────────────────────────────────┐  │
         │  │ Step 7: Mark as COMPLETED               │  │
         │  │ • Update DB status                      │  │
         │  │ • Presentation ready for display        │  │
         │  └──────────────────────────────────────────┘  │
         │                    │                             │
         └────────────────────┼────────────────────────────┘
                              │
                              ▼
                   ┌───────────────────────────────┐
                   │  Frontend Polls/Queries       │
                   │  • Presentation is complete   │
                   │  • Fetch slides with images   │
                   │  • All imageUrl populated     │
                   └───────────┬───────────────────┘
                               │
                               ▼
                   ┌───────────────────────────────┐
                   │  Render Components            │
                   │  • SlideCard: Thumbnail       │
                   │  • SlidePreview: Full slide   │
                   │  • SlideshowModal: Present    │
                   │                                │
                   │ All load images from ImageKit │
                   │ CDN (https://ik.imagekit.io)  │
                   └───────────┬───────────────────┘
                               │
                               ▼
                   ┌───────────────────────────────┐
                   │  USER SEES PRESENTATION       │
                   │  ✓ Each slide with image      │
                   │  ✓ Professional quality       │
                   │  ✓ Ready to edit/present      │
                   └───────────────────────────────┘
```

## Parallel Image Generation Optimization

```
WITHOUT PARALLEL (Sequential - SLOW):
┌────────────────────────────────────────────────────┐
│ Image 1: 5-15s ██████                              │
│ Image 2: 5-15s ██████  (waits for Image 1)         │
│ Image 3: 5-15s ██████  (waits for 1 & 2)          │
│ Total: 15-45 seconds for 3 images                  │
└────────────────────────────────────────────────────┘

WITH PARALLEL (Concurrent - FAST - Used):
┌────────────────────────────────────────────────────┐
│ Image 1: 5-15s ██████                              │
│ Image 2: 5-15s ██████  (simultaneously with 1)     │
│ Image 3: 5-15s ██████  (simultaneously with 1 & 2) │
│ Total: 5-15 seconds for 3 images!                  │
│ ⬆ MAJOR PERFORMANCE WIN                           │
└────────────────────────────────────────────────────┘

Code Implementation:
await Promise.all([
  generateImage(prompt1),  // All run in parallel
  generateImage(prompt2),
  generateImage(prompt3),
])
```

## Error Handling Flow

```
                    ┌─────────────────────┐
                    │ Try: Generate Image │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Is HF_TOKEN set?   │
                    └──┬────────────────┬─┘
                       │ No             │ Yes
                       ▼                ▼
                   ┌────────┐     ┌────────────────┐
                   │ Log:   │     │ Call HF API    │
                   │Missing │     └────┬───────────┘
                   │token   │          │
                   │Return  │          ▼
                   │null    │    ┌────────────────┐
                   └────────┘    │ Success?       │
                                 └┬──────────┬───┘
                                 Yes        No
                                  │          │
                                  ▼          ▼
                         ┌─────────────┐  ┌────────────────┐
                         │ Binary PNG  │  │ Is 401?        │
                         │ data        │  └┬──────────┬───┘
                         │ received    │  Yes       No
                         └─────┬───────┘   │         │
                               │          │         ▼
                               │          ▼     ┌─────────────┐
                               │    ┌─────────┐ │ Network     │
                               │    │Log:     │ │ timeout?    │
                               │    │Invalid  │ └──┬─────┬───┘
                               │    │token    │   Yes  No
                               │    │Return   │    │     │
                               │    │null     │    │     ▼
                               │    └─────────┘    │  ┌────────┐
                               │                   │  │Other   │
                               ▼                   │  │error   │
                        ┌────────────────┐         │  │Log:    │
                        │ Convert buffer │         │  │{error} │
                        │ to base64      │         │  │Return  │
                        └────┬───────────┘         │  │null    │
                             │                    │  └────────┘
                             ▼                    │
                        ┌────────────────┐         │
                        │ Upload to      │         │
                        │ ImageKit       │         │
                        └────┬───────────┘         │
                             │                    │
                             ▼                    │
                        ┌────────────────┐         │
                        │ Success?       │         │
                        └┬──────────┬───┘         │
                        Yes        No            │
                         │         └──────────────┘
                         │                │
                         │                ▼
                         │          ┌────────────┐
                         │          │Log upload  │
                         │          │error       │
                         │          │Return null │
                         │          └────────────┘
                         │
                         ▼
                    ┌─────────────┐
                    │ Return      │
                    │ ImageKit    │
                    │ Image URL   │
                    └─────────────┘
                         │
                    ┌────▼───────────────┐
                    │ Save to database   │
                    │ or                 │
                    │ Continue with null │
                    └────────────────────┘
```

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────┐
│                      USER                            │
│                                                      │
│  id (PK)                                             │
│  name                                                │
│  email (UNIQUE)                                      │
│  emailVerified                                       │
│  image                                               │
│  createdAt, updatedAt                                │
└───────────┬───────────────────────────────────────┬─┘
            │                                        │
            │ 1:N relationship                      │
            │ (One user has many presentations)    │
            │                                        │
            ▼                                        ▼
┌──────────────────────────────────┐  ┌────────────────────┐
│       PRESENTATION                │  │    SESSION/ACCOUNT │
│                                   │  │    (Auth related)  │
│ id (PK)                           │  │                    │
│ userId (FK → User.id)             │  │ ...                │
│ title                             │  │                    │
│ prompt                            │  └────────────────────┘
│ slideCount                         │
│ style                             │
│ tone                              │
│ layout                            │
│ status: DRAFT/GENERATING/         │
│         COMPLETED/FAILED          │
│ createdAt, updatedAt              │
└───────────┬───────────────────────┘
            │
            │ 1:N relationship
            │ (One presentation has many slides)
            │
            ▼
    ┌─────────────────────────┐
    │         SLIDE            │
    │                          │
    │ id (PK)                  │
    │ presentationId (FK)      │
    │ order (0-indexed)        │
    │ title                    │
    │ content (body + bullets) │
    │ notes (speaker notes)    │
    │ imageUrl (← from ImageKit│
    │ imagePrompt              │
    │ createdAt, updatedAt     │
    └──────────────────────────┘
        │
        │ imageUrl comes from:
        │ └─→ ImageKit CDN
        │     └─→ https://ik.imagekit.io/xxx
        │
        │ Rendered by:
        │ ├─→ SlideCard (thumbnail)
        │ ├─→ SlidePreview (full)
        │ └─→ SlideshowModal (fullscreen)
```

## API Response Flow

```
                          REQUEST
                            ▼
                   ┌─────────────────────┐
                   │ HF FLUX.1 API       │
                   │                      │
                   │ POST /models/black-  │
                   │ forest-labs/FLUX.1.. │
                   │                      │
                   │ Input:               │
                   │  - prompt (string)   │
                   │  - width: 1440       │
                   │  - height: 810       │
                   │  - steps: 4          │
                   └──────────┬───────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Process (5-15s)    │
                    │                    │
                    │ Model generates    │
                    │ PNG image from     │
                    │ text prompt        │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ RESPONSE:          │
                    │ Binary PNG data    │
                    │ (arrayBuffer)      │
                    │                    │
                    │ Example size:      │
                    │ ~512 KB - 1 MB     │
                    └─────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Convert to base64   │
                   │ Buffer.from(        │
                   │  buffer             │
                   │ ).toString('base64')│
                   └──────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Format: data URL   │
                    │ "data:image/png;   │
                    │ base64,{base64str}"│
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Send to ImageKit   │
                    │ Upload endpoint    │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ ImageKit Response: │
                    │                    │
                    │ {                  │
                    │   url: "https://   │
                    │   ik.imagekit.io/..│
                    │   fileId: "xxx"    │
                    │   name: "slide.png"│
                    │ }                  │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Extract URL        │
                    │ Store in DB        │
                    │ Return to frontend │
                    └────────────────────┘
```

## File Organization

```
src/
├── integrations/
│   └── inngest/
│       ├── client.ts              (Inngest config)
│       ├── functions.ts           ✅ MAIN FILE
│       │   ├── generateImageFromPrompt()      (HF API)
│       │   ├── uploadBase64ToImageKit()       (ImageKit)
│       │   ├── createSlideImageAndUpload()    (Orchestration)
│       │   └── generatePresentation()        (Main flow)
│       └── functions/
│           └── index.ts           (Exports functions)
│
├── server/
│   └── gemini-image.ts            ✅ UPDATED
│       └── generateSlideImage()   (HF API)
│
├── routes/
│   ├── api/
│   │   ├── test-image.tsx         (Test endpoint)
│   │   ├── inngest.ts             (Inngest webhook)
│   │   └── auth/                  (Auth routes)
│   ├── presentations.$id.tsx      (View presentation)
│   └── __root.tsx                 (Root layout)
│
├── features/
│   ├── components/
│   │   ├── slide-card.tsx         (Thumbnail display)
│   │   ├── slide-preview.tsx      (Full slide)
│   │   ├── slideshow-modal.tsx    (Fullscreen)
│   │   └── ...                    (Other components)
│   ├── actions/
│   │   ├── presentation-mutation.ts (Create, update, delete)
│   │   └── presentation-query.ts    (Fetch data)
│   └── ...
│
└── lib/
    ├── db.ts                      (Prisma client)
    ├── query-client.ts            (TanStack Query)
    └── ...
```

## Environment Setup Diagram

```
.env File Structure
├── Database
│   └── DATABASE_URL = postgresql://...
│
├── Authentication
│   ├── BETTER_AUTH_SECRET = xxx
│   ├── BETTER_AUTH_URL = http://localhost:3000
│   ├── GOOGLE_CLIENT_ID = xxx
│   ├── GOOGLE_CLIENT_SECRET = xxx
│   ├── GITHUB_CLIENT_ID = xxx
│   └── GITHUB_CLIENT_SECRET = xxx
│
├── AI Models
│   ├── GOOGLE_GENERATIVE_AI_API_KEY = xxx (Gemini - slide content)
│   └── HF_TOKEN = xxx                     (Hugging Face - images)
│
├── Image Hosting (ImageKit)
│   ├── IMAGEKIT_PUBLIC_KEY = xxx
│   ├── IMAGEKIT_PRIVATE_KEY = xxx
│   └── IMAGEKIT_URL_ENDPOINT = https://ik.imagekit.io/xxx
│
└── Background Jobs
    └── INNGEST_DEV = 1 (for local development)

Flow in Application:
    .env loaded
      ↓
  process.env.HF_TOKEN accessed
      ↓
  generateImageFromPrompt() uses it
      ↓
  HF API call with Bearer token
      ↓
  Image generation successful
```

## Component Lifecycle

```
┌─────────────────────────────────────────────────────┐
│              APPLICATION STARTUP                      │
│                                                       │
│  1. .env loaded by Vite config                       │
│  2. process.env populated                            │
│  3. Server functions initialized                     │
│  4. Inngest client created                           │
│  5. Database connection established                  │
│  6. React app mounts                                 │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│         USER INTERACTION (FRONTEND)                   │
│                                                       │
│  Homepage → Create Presentation                      │
│  Form fills: prompt, slides, style, tone             │
│  Click: Create                                       │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│    SERVER FUNCTION (createPresentation)             │
│                                                       │
│  • Validate input with Zod                           │
│  • Check authentication middleware                   │
│  • Create Prisma record (GENERATING)                 │
│  • Send Inngest event                                │
│  • Return immediately to frontend                    │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│     INNGEST BACKGROUND PROCESSING                    │
│                                                       │
│  • Retries: 2 (if fails)                             │
│  • Parallel steps                                    │
│  • Error handling per step                           │
│  • Logs every action                                 │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   IMAGE PIPELINE         DATABASE UPDATES
   (5-15s per img)        (1-3s per update)
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────┐
        │                     │
     MARK COMPLETED     UPDATE STATUS
     (Presentation)    In Database
        │                     │
        └──────────┬──────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│      FRONTEND DETECTS COMPLETION                     │
│                                                       │
│  • Polls for status or                               │
│  • Real-time update via WebSocket/polling            │
│  • Fetches presentation with slides                  │
│  • Component re-renders                              │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│      RENDER PRESENTATION DISPLAY                     │
│                                                       │
│  SlideCard: {                                        │
│    title: "Slide 1"                                  │
│    imageUrl: "https://ik.imagekit.io/..."           │
│    content: "..."                                   │
│  }                                                   │
│                                                       │
│  Loads image from ImageKit CDN                       │
│  Displays with error fallback                        │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │                     │
     IMAGE LOADED        ERROR FALLBACK
     Shows slide         Shows placeholder
        │                     │
        └──────────┬──────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│     USER VIEWS PRESENTATION                          │
│                                                       │
│  ✓ Slides with professional images                   │
│  ✓ Ready to edit, present, export                    │
│  ✓ Images cached by browser                          │
│  ✓ ImageKit CDN cached globally                      │
└──────────────────────────────────────────────────────┘
```

---

**Diagram Version**: 1.0
**Created**: 2025-05-20
**Implementation**: Hugging Face FLUX.1 Schnell
**Status**: Complete ✅
