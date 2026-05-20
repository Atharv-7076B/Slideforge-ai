# SlideForge AI - Image Generation Integration Checklist

## Pre-Testing Verification

### Environment Setup ✓

- [x] HF_TOKEN is set in `.env`
- [x] IMAGEKIT_PUBLIC_KEY is set in `.env`
- [x] IMAGEKIT_PRIVATE_KEY is set in `.env`
- [x] IMAGEKIT_URL_ENDPOINT is set in `.env`
- [x] GOOGLE_GENERATIVE_AI_API_KEY is set in `.env`
- [x] DATABASE_URL points to valid PostgreSQL
- [x] BETTER_AUTH_SECRET and BETTER_AUTH_URL are set

### File Changes Made ✓

- [x] Updated `src/integrations/inngest/functions.ts`:
  - Replaced OpenAI image generation with Hugging Face FLUX.1 Schnell
  - Updated `generateImageFromPrompt()` to use HF API
  - Enhanced logging throughout pipeline
  - Optimized prompt handling for presentations
- [x] Updated `src/server/gemini-image.ts`:
  - Replaced with Hugging Face FLUX.1 Schnell implementation
  - Removed Google Generative AI image generation
  - Added proper error handling
- [x] Created `IMAGE_GENERATION_DEBUG.md`:
  - Comprehensive troubleshooting guide
  - Architecture documentation
  - Performance tuning information

### Code Quality ✓

- [x] All console.log statements use consistent `[Context]` prefix format
- [x] Error messages include context and actionable information
- [x] Async operations properly handled with Promise.all()
- [x] Base64 encoding handled correctly
- [x] Binary data from HF API properly converted

## API Integration Points

### Hugging Face Integration

```javascript
// Model: black-forest-labs/FLUX.1-schnell
// Endpoint: https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell
// Auth: Bearer token from HF_TOKEN env var
// Request: JSON with inputs and parameters
// Response: Binary PNG image data
```

### ImageKit Integration

```javascript
// Endpoint: https://upload.imagekit.io/api/v1/files/upload
// Auth: Basic auth with private key
// Upload: Multipart form-data with base64 image
// Response: JSON with { url: "https://..." }
```

## Data Flow Verification

### 1. Presentation Creation

```
User Action → createPresentation()
  ↓ Creates DB record with status: GENERATING
  ↓ Triggers Inngest event: presentation/generate
```

### 2. Content Generation (Gemini)

```
Inngest Event → generatePresentation()
  ↓ Fetches presentation details
  ↓ Calls Gemini 2.5 Flash for slides
  ↓ Returns: { slides: [ { heading, content, imagePrompt, ... } ] }
```

### 3. Image Generation (HF)

```
Each Slide ImagePrompt → generateImageFromPrompt()
  ↓ Constructs optimized prompt
  ↓ Calls HF FLUX.1 Schnell API
  ↓ Returns: base64 PNG image data
```

### 4. Image Upload (ImageKit)

```
Base64 Image → uploadBase64ToImageKit()
  ↓ Converts to FormData
  ↓ Posts to ImageKit upload endpoint
  ↓ Returns: { url: "https://ik.imagekit.io/..." }
```

### 5. Database Storage

```
Image URL → Prisma
  ↓ Saves to Slide.imageUrl
  ↓ Updates Presentation status: COMPLETED
```

### 6. Frontend Display

```
Presentation Query → Frontend Component
  ↓ SlideCard/SlidePreview renders imageUrl
  ↓ Loads image from ImageKit CDN
  ↓ Shows with error fallback
```

## Testing Checklist

### Unit Tests (Manual)

#### Test 1: HF Token Validation

- [ ] Open `src/integrations/inngest/functions.ts`
- [ ] Verify `HF_TOKEN` is accessed from `process.env`
- [ ] Check error handling for missing token

#### Test 2: Prompt Optimization

- [ ] Verify prompt includes "Professional presentation slide illustration"
- [ ] Check aspect ratio specification (16:9)
- [ ] Ensure no text instructions in prompt

#### Test 3: Image Conversion

- [ ] Verify buffer is converted to base64
- [ ] Check format: `data:image/png;base64,${b64}`
- [ ] Ensure no empty buffers are returned

#### Test 4: ImageKit Upload

- [ ] Verify FormData includes correct fields
- [ ] Check file naming: `slide-{presentationId}-{order}.png`
- [ ] Verify folder path: `/presentations/{presentationId}`
- [ ] Check URL returned is HTTPS

### Integration Tests (Runtime)

#### Test 1: Direct API Test

```bash
# In terminal, test HF API with your token:
curl -X POST https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell \
  -H "Authorization: Bearer $HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": "Professional presentation slide with modern design, 16:9",
    "parameters": {
      "width": 1440,
      "height": 810,
      "num_inference_steps": 4
    }
  }' -o test.png

# Should create a test.png file
```

#### Test 2: Test Route

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to: `http://localhost:3000/api/test-image`
- [ ] Should display generated image
- [ ] Check VS Code terminal for logs

Expected logs:

```
[generateSlideImage] Starting HF image generation for prompt: Modern AI presentation background, blue gradient, corporate style
[generateSlideImage] Successfully generated image, size: XXXXX bytes
```

#### Test 3: Create Presentation

- [ ] Click "Create New Presentation"
- [ ] Fill form:
  - Prompt: "Modern cloud computing technology"
  - Slides: 3
  - Style: "Modern"
  - Tone: "Professional"
  - Layout: "Standard"
- [ ] Click Create
- [ ] Watch VS Code terminal for generation logs

Expected logs should include:

```
[Presentation Generation] Started
[Presentation Generation] Fetching presentation data
[Presentation Generation] Slide content generated successfully
[Presentation Generation] Starting parallel image generation
[HF Image Generation] Starting for prompt: ...
[HF Image Generation] Successfully generated image
[Image Pipeline] Image generated, uploading to ImageKit
[Image Pipeline] Successfully uploaded image
[Presentation Generation] Image generation batch completed
[Presentation Generation] Successfully completed
```

#### Test 4: View Presentation

- [ ] Once generation completes, click on presentation
- [ ] Each slide should display:
  - Generated background image
  - Slide title and content overlaid
  - No "Image unavailable" errors

### Error Scenarios

#### Scenario 1: Invalid HF Token

- [ ] Remove or corrupt HF_TOKEN
- [ ] Try to create presentation
- Expected: Error logs: "Missing HF_TOKEN" or "401: Unauthorized"
- [ ] Restore token and retry

#### Scenario 2: Invalid ImageKit Credentials

- [ ] Remove or corrupt ImageKit credentials
- [ ] Try to create presentation
- Expected: "ImageKit is unavailable" message
- [ ] Restore credentials and retry

#### Scenario 3: Network Timeout

- [ ] Disable internet temporarily
- [ ] Try to create presentation
- Expected: Timeout error in logs
- [ ] Reconnect and retry

#### Scenario 4: Invalid Prompts

- [ ] Verify empty prompts are rejected
- [ ] Check very long prompts (>1000 chars) are handled
- [ ] Ensure special characters don't break API call

## Performance Benchmarks

### Expected Timings

| Operation                    | Time   | Notes                                          |
| ---------------------------- | ------ | ---------------------------------------------- |
| HF Image Gen (per image)     | 5-15s  | FLUX.1 Schnell, 4 inference steps              |
| ImageKit Upload (per image)  | 1-3s   | Depends on image size (~500KB)                 |
| Total (3-slide presentation) | 20-40s | Parallel generation: ~15s + sequential uploads |
| Gemini Content Gen           | 10-20s | Parallel with images (pipelined)               |

### Optimization Tips

- Parallel generation reduces time: 5 slides × 10s each = 50s sequential, ~10s parallel
- All images generated simultaneously
- Uploads happen after generation completes

## Monitoring Production

### Logging Strategy

All logs use prefixes for filtering:

- `[HF Image Generation]` - Hugging Face API calls
- `[Image Pipeline]` - Image upload orchestration
- `[Presentation Generation]` - Main flow

### Key Success Indicators

- [ ] No "Missing HF_TOKEN" errors
- [ ] Success count matches total slides
- [ ] All images have ImageKit URLs
- [ ] No 401/403 authentication errors
- [ ] Generation time <60 seconds for 5 slides

### Alerts to Set

- [ ] More than 10% image generation failures
- [ ] Average generation time >30 seconds per image
- [ ] ImageKit upload failures
- [ ] Database save failures

## Rollback Plan

If issues occur:

1. **Check Logs First**
   - Filter for `[HF Image Generation]` errors
   - Check ImageKit credentials
   - Verify network connectivity

2. **Quick Fixes**
   - Restart dev server: `npm run dev`
   - Verify `.env` is loaded
   - Clear browser cache

3. **Revert Changes** (if needed)

   ```bash
   git checkout src/integrations/inngest/functions.ts
   git checkout src/server/gemini-image.ts
   ```

4. **Full Debug**
   - Read `IMAGE_GENERATION_DEBUG.md`
   - Check HF API status
   - Verify ImageKit dashboard

## Sign-Off Checklist

- [ ] All files updated correctly
- [ ] No TypeScript compilation errors
- [ ] Test route works: `/api/test-image`
- [ ] Create presentation works end-to-end
- [ ] Images display on presentation page
- [ ] Logs are clear and helpful
- [ ] Error handling is robust
- [ ] No sensitive data in logs

## Next Steps After Testing

1. **Immediate**
   - Test `/api/test-image` route
   - Create a test presentation
   - Verify images generate and display

2. **Short Term**
   - Monitor logs for errors
   - Track generation times
   - Gather user feedback

3. **Long Term**
   - Implement image caching
   - Add regeneration UI for failed images
   - Create admin dashboard for monitoring

## Quick Reference

### File Locations

- Main logic: `src/integrations/inngest/functions.ts`
- Server function: `src/server/gemini-image.ts`
- Test route: `src/routes/api/test-image.tsx`
- Debug guide: `IMAGE_GENERATION_DEBUG.md`

### Key Functions

- `generateImageFromPrompt()` - HF API call
- `uploadBase64ToImageKit()` - ImageKit upload
- `createSlideImageAndUpload()` - Orchestration
- `generatePresentation()` - Main Inngest function

### Environment Variables

```
HF_TOKEN=xxx                    # Hugging Face API token
IMAGEKIT_PUBLIC_KEY=xxx         # ImageKit credentials
IMAGEKIT_PRIVATE_KEY=xxx
IMAGEKIT_URL_ENDPOINT=xxx
GOOGLE_GENERATIVE_AI_API_KEY=xxx # For slide content
```

---

**Status**: Ready for testing
**Last Updated**: 2025-05-20
**Implementation**: Hugging Face FLUX.1 Schnell image generation
