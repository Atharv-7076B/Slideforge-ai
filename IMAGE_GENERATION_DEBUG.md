# SlideForge AI - Image Generation Integration Guide

## Overview

This document provides comprehensive information about the AI image generation feature, how to test it, and how to troubleshoot issues.

### Current Implementation

- **Model**: Hugging Face FLUX.1 Schnell (`black-forest-labs/FLUX.1-schnell`)
- **Image Dimensions**: 1440x810 (16:9 aspect ratio)
- **Image Hosting**: ImageKit CDN
- **API Integration Points**:
  - `src/integrations/inngest/functions.ts` - Main image generation function
  - `src/server/gemini-image.ts` - Server function for testing
  - `src/routes/api/test-image.tsx` - Test route

## Environment Configuration

### Required Environment Variables

```env
# Hugging Face API
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=public_xxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/xxxxx

# Google Generative AI (for slide content)
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyxxxxx
```

### Getting HF Token

1. Visit https://huggingface.co/settings/tokens
2. Create a new token with "read" access
3. Copy the token to your `.env` file

## Testing Image Generation

### Method 1: Test Route

Navigate to `http://localhost:3000/api/test-image` to test image generation.

This route:

- Generates a test image with a sample prompt
- Returns a full HTML page with the generated image
- Shows base64 encoding for debugging

### Method 2: Create a Presentation

1. Go to homepage
2. Create a new presentation with:
   - Prompt: "Modern technology and innovation"
   - Slides: 3-5
   - Style: "Modern"
   - Tone: "Professional"
3. Monitor the VS Code terminal for detailed logs
4. Check presentation page once generation completes

### Method 3: Direct Terminal Testing

```bash
# Start dev server
npm run dev

# In another terminal, test HF API directly
curl -X POST https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell \
  -H "Authorization: Bearer YOUR_HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "inputs": "Professional presentation slide with modern design",
    "parameters": {
      "width": 1440,
      "height": 810,
      "num_inference_steps": 4
    }
  }' > test_image.png
```

## Logging and Debugging

### Console Output Format

All image generation logs are prefixed with `[HF Image Generation]` or `[Image Pipeline]` for easy filtering.

### Key Log Points

**1. Image Generation Start:**

```
[HF Image Generation] Starting for prompt: ...
```

**2. Successful Generation:**

```
[HF Image Generation] Successfully generated image, size: XXXX bytes
```

**3. ImageKit Upload:**

```
[Image Pipeline] Image generated, uploading to ImageKit
```

**4. Pipeline Completion:**

```
[Image Pipeline] Successfully uploaded image
```

### Finding Logs in VS Code

1. Open VS Code Terminal (Ctrl+`)
2. Select "Inngest" or appropriate terminal
3. Look for `[HF Image Generation]` prefix
4. Search with Ctrl+F for specific step

### Common Error Logs

**Missing Token:**

```
[HF Image Generation] Error: Missing HF_TOKEN; skipping image generation
```

**Solution**: Set `HF_TOKEN` in `.env`

**API Error:**

```
[HF Image Generation] Error: Hugging Face image generation failed (401): Unauthorized
```

**Solution**: Verify HF_TOKEN is valid and not expired

**ImageKit Error:**

```
[Image Pipeline] Error: ImageKit upload failed (401): Unauthorized
```

**Solution**: Verify ImageKit credentials in `.env`

**Network Timeout:**

```
[HF Image Generation] Error: fetch timeout
```

**Solution**: Check internet connection, HF API may be slow during peak hours

## Architecture Overview

### Request Flow

```
1. User creates presentation
   ↓
2. Inngest event triggered: presentation/generate
   ↓
3. generatePresentation function executes:
   - Fetch presentation data
   - Generate slide content (Gemini)
   - For each slide:
     a. Get imagePrompt from Gemini response
     b. Call generateImageFromPrompt() with HF
     c. Upload base64 image to ImageKit
     d. Store imageUrl in database
   ↓
4. Frontend fetches presentation
   ↓
5. Slide components render with imageUrl from ImageKit
```

### File Hierarchy

```
src/integrations/inngest/
├── client.ts                 # Inngest client initialization
├── functions.ts              # Main generatePresentation function
│   ├── generateImageFromPrompt()      # HF API integration
│   ├── uploadBase64ToImageKit()       # ImageKit upload
│   └── createSlideImageAndUpload()    # Orchestrates generation + upload
└── functions/
    ├── index.ts              # Exports functions array
    └── [other functions]

src/server/
└── gemini-image.ts           # Test/standalone image generation

src/routes/api/
├── test-image.tsx            # Test endpoint
├── inngest.ts                # Inngest webhook handler
└── auth/                      # Auth endpoints
```

## Database Schema

### Slide Table

```prisma
model Slide {
  id             String       @id @default(cuid())
  presentationId String
  order          Int          // Slide number (0-indexed)
  title          String       // Slide heading
  content        String       // Slide body + bullets
  notes          String?      // Speaker notes
  imageUrl       String?      // ImageKit CDN URL
  imagePrompt    String?      // Original prompt sent to HF
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

## Troubleshooting Guide

### Issue: Images Not Generating

**Symptoms**: All images showing "No image" placeholder

**Checklist**:

1. ✓ Check HF_TOKEN is set in `.env`
2. ✓ Verify token has "read" permissions on HF
3. ✓ Check ImageKit credentials are correct
4. ✓ Look for errors in terminal with `[HF Image Generation]` prefix
5. ✓ Verify internet connection

**Debug Steps**:

```bash
# Test HF token
curl -H "Authorization: Bearer YOUR_HF_TOKEN" \
  https://api-inference.huggingface.co/api/whoami

# Test ImageKit upload
curl -u "YOUR_PRIVATE_KEY:" \
  https://upload.imagekit.io/api/v1/files/upload
```

### Issue: Only Some Images Failed

**Symptoms**: Some slides have images, others show "No image"

**Likely Causes**:

- ImageKit went down during batch generation
- Network timeout on specific requests
- HF API rate limiting

**Solution**:

1. Regenerate presentation to retry
2. Check HF API status: https://huggingface.co/status
3. Wait a few minutes and try again

### Issue: Images Display but Then Disappear

**Symptoms**: Images load then become 404 errors

**Likely Causes**:

- ImageKit authentication expired
- Image deleted from ImageKit
- CDN URL changed

**Solution**:

1. Regenerate presentation
2. Verify IMAGEKIT_URL_ENDPOINT is correct
3. Check ImageKit console for deleted files

### Issue: Slow Image Generation

**Symptoms**: Takes 30+ seconds per image

**Expected Behavior**: 5-15 seconds per image with FLUX.1 Schnell

**Solutions**:

1. Check HF API status (may be under load)
2. Verify internet connection speed
3. Use `num_inference_steps: 4` (already optimized)
4. Try again during off-peak hours

### Issue: Cannot Access Test Route

**URL**: http://localhost:3000/api/test-image

**If not working**:

1. Verify dev server is running: `npm run dev`
2. Check port 3000 is available
3. Try http://127.0.0.1:3000/api/test-image
4. Check for console errors in VS Code terminal

## Performance Optimization

### Image Generation Settings

Current FLUX.1 Schnell settings in `functions.ts`:

```javascript
{
  width: 1440,          // HD presentation width
  height: 810,          // 16:9 aspect ratio
  num_inference_steps: 4, // Lowest for Schnell (fast)
}
```

### Tuning Parameters

**For Speed** (current setting):

- `num_inference_steps: 4` (fastest, good quality)

**For Quality**:

- `num_inference_steps: 8` (slower, better quality)
- `num_inference_steps: 20` (very slow, highest quality)

**Change in** `src/integrations/inngest/functions.ts`:

```javascript
body: JSON.stringify({
  inputs: optimizedPrompt,
  parameters: {
    width: 1440,
    height: 810,
    num_inference_steps: 4, // ← Adjust here
  },
}),
```

### Batch Optimization

Images are generated in parallel using `Promise.all()`:

```javascript
const uploadedImageUrls = await Promise.all(
  slides.map((slide, index) =>
    createSlideImageAndUpload({
      presentationId,
      slideOrder: index,
      imagePrompt: slide.imagePrompt,
    }),
  ),
)
```

This means for 5 slides, all images generate simultaneously (not sequentially).

## Advanced Configuration

### Changing Image Model

To use a different Hugging Face model, update the API URL in `functions.ts`:

```javascript
// Current (FLUX.1 Schnell - fast, good quality)
'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell'

// Alternative options:
// 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev'     // Better quality, slower
// 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3'   // Different style
```

### Adjusting Prompt Optimization

Edit the prompt prefix in `generateImageFromPrompt()`:

```javascript
const optimizedPrompt = `Professional presentation slide illustration. ${prompt}. High quality, clean design, suitable for corporate/business presentations. 16:9 aspect ratio.`
```

### Changing ImageKit Folder Structure

Current: `/presentations/{presentationId}/slide-{order}.png`

To modify:

```javascript
folderPath: `/presentations/${sanitizeFileName(params.presentationId)}`,
fileName: `slide-${params.presentationId}-${params.slideOrder}`,
```

## Monitoring and Alerts

### Key Metrics to Track

1. **Average Generation Time**: Should be 5-15 seconds per image
2. **Success Rate**: Should be >95%
3. **ImageKit Upload Time**: Should be <2 seconds
4. **Failure Points**: Monitor logs for specific errors

### Production Checklist

- [ ] HF_TOKEN is set and valid
- [ ] ImageKit credentials are correct
- [ ] GOOGLE_GENERATIVE_AI_API_KEY is set (for slide content)
- [ ] All env vars are in `.env.production` (not `.env`)
- [ ] ImageKit folder structure is organized
- [ ] Error notifications are configured
- [ ] Logs are being captured for debugging

## FAQ

**Q: Why does my HF token not work?**
A: Ensure you copied the entire token, it hasn't expired, and it has "read" permissions.

**Q: Can I use a different image generation model?**
A: Yes, update the API URL in `generateImageFromPrompt()`. See "Advanced Configuration" section.

**Q: Why are images slow to generate?**
A: FLUX.1 Schnell usually takes 5-15 seconds. If longer, check HF API status or network.

**Q: Can I see the prompts sent to the image generator?**
A: Yes, check logs prefixed with `[HF Image Generation] Starting for prompt:`

**Q: What happens if image generation fails for one slide?**
A: That slide gets `imageUrl: null`, but presentation completes. Other slides will have images.

**Q: Can I regenerate just the images without regenerating slides?**
A: Not currently. You'd need to regenerate the entire presentation.

**Q: Are images stored permanently?**
A: Yes, on ImageKit CDN. They're referenced in the database. Regenerating overwrites them.

## Support and Next Steps

### If Something Breaks

1. **Check Terminal**: Look for errors with `[HF Image Generation]` or `[Image Pipeline]` prefix
2. **Review Environment**: Verify all `.env` variables are set correctly
3. **Test HF API**: Use curl commands to verify HF API access
4. **Check ImageKit**: Verify ImageKit dashboard for upload errors
5. **Review Database**: Check if slides were created with null imageUrl

### Future Enhancements

- [ ] Image caching to avoid regeneration
- [ ] Support for custom image styles
- [ ] Batch regeneration of failed images
- [ ] Image quality preview before saving
- [ ] Custom prompt templates per slide type
- [ ] Integration with other image generation APIs

## Related Files

- Main logic: [src/integrations/inngest/functions.ts](./src/integrations/inngest/functions.ts)
- Server function: [src/server/gemini-image.ts](./src/server/gemini-image.ts)
- Test route: [src/routes/api/test-image.tsx](./src/routes/api/test-image.tsx)
- Slide display: [src/features/components/slide-card.tsx](./src/features/components/slide-card.tsx)
- Presentation logic: [src/features/actions/presentation-mutation.ts](./src/features/actions/presentation-mutation.ts)
