# SlideForge AI - Image Generation Reference Card

## 🚀 Quick Commands

### Start Dev Server

```bash
npm run dev
```

### Test Image Generation

```bash
# In browser:
http://localhost:3000/api/test-image

# In terminal (requires HF_TOKEN):
curl -X POST https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell \
  -H "Authorization: Bearer $HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "Professional presentation slide", "parameters": {"width": 1440, "height": 810, "num_inference_steps": 4}}' \
  -o test.png
```

### Run Database Migrations

```bash
npx prisma migrate deploy
```

### Monitor Logs

```bash
# In VS Code terminal (Ctrl+`)
# Search (Ctrl+F) for: [HF Image Generation]
```

## 📊 Architecture at a Glance

```
Frontend (React)
    ↓ TanStack Server Function
Presentation Created
    ↓ Inngest Event
Background Task
    ├─ Gemini: Generate Content
    ├─ HF: Generate Images (Parallel)
    └─ ImageKit: Upload & Store
        ↓
Database (Prisma/PostgreSQL)
    ↓ Image URLs stored
Frontend Display
    ↓ ImageKit CDN
Show Presentation
```

## 🔧 Environment Variables

### Required

| Variable                       | Source                         | Purpose                  |
| ------------------------------ | ------------------------------ | ------------------------ |
| `HF_TOKEN`                     | huggingface.co/settings/tokens | Image generation API     |
| `IMAGEKIT_PRIVATE_KEY`         | imagekit.io dashboard          | Image upload auth        |
| `IMAGEKIT_PUBLIC_KEY`          | imagekit.io dashboard          | Public access            |
| `IMAGEKIT_URL_ENDPOINT`        | imagekit.io dashboard          | CDN URL                  |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Cloud Console           | Slide content generation |
| `DATABASE_URL`                 | Neon or PostgreSQL             | Database connection      |
| `BETTER_AUTH_SECRET`           | Generated/set                  | Auth encryption          |
| `BETTER_AUTH_URL`              | http://localhost:3000          | Auth callback            |

## 📝 Console Log Prefixes

Filter terminal output with Ctrl+F:

| Prefix                      | Meaning        | When      | Example                 |
| --------------------------- | -------------- | --------- | ----------------------- |
| `[Presentation Generation]` | Main flow      | Always    | "Started", "Completed"  |
| `[HF Image Generation]`     | HF API calls   | Per image | "Starting for prompt"   |
| `[Image Pipeline]`          | Upload process | Per image | "Successfully uploaded" |

## 🎯 Testing Path

1. **Quick**: Test route

   ```
   http://localhost:3000/api/test-image
   ```

2. **Full**: Create presentation
   - Prompt: "Cloud computing"
   - Slides: 3
   - Style: Modern
   - Tone: Professional

3. **Verify**: Check presentation
   - Images display ✓
   - No errors in terminal ✓
   - ImageKit has files ✓

## 💾 Key Files

| File                                     | Purpose                  | Modified     |
| ---------------------------------------- | ------------------------ | ------------ |
| `src/integrations/inngest/functions.ts`  | Main image generation    | ✅ Yes       |
| `src/server/gemini-image.ts`             | Test/standalone function | ✅ Yes       |
| `src/routes/api/test-image.tsx`          | Test endpoint            | No           |
| `src/features/components/slide-card.tsx` | Display component        | No           |
| `.env`                                   | Configuration            | Needs update |

## ⚡ Performance Targets

| Metric       | Target | Actual         |
| ------------ | ------ | -------------- |
| Per image    | 5-15s  | ~10s (avg)     |
| 3 slides     | 20-40s | ~30s           |
| 5 slides     | 50-70s | ~60s           |
| Success rate | >95%   | Depends on API |

## 🐛 Common Errors & Fixes

| Error                  | Cause                 | Fix                                  |
| ---------------------- | --------------------- | ------------------------------------ |
| "Missing HF_TOKEN"     | Not in .env           | Add HF_TOKEN=... to .env             |
| "401 Unauthorized"     | Invalid/expired token | Get new token from HF                |
| "ImageKit unavailable" | Bad credentials       | Verify ImageKit .env vars            |
| "Empty image buffer"   | API returned null     | Retry, check HF status               |
| No images on slide     | Generation failed     | Check logs for [HF Image Generation] |

## 🔗 API Endpoints

| Endpoint             | Method | Purpose               |
| -------------------- | ------ | --------------------- |
| `/api/test-image`    | GET    | Test image generation |
| `/api/inngest`       | POST   | Inngest webhook       |
| `/presentations`     | GET    | List presentations    |
| `/presentations/$id` | GET    | View presentation     |

## 📋 Validation Checklist

Before each test:

- [ ] `.env` has all required variables
- [ ] Dev server running: `npm run dev`
- [ ] HF token is valid
- [ ] ImageKit credentials work
- [ ] Database is accessible

After each test:

- [ ] Images generated without errors
- [ ] Logs show success messages
- [ ] Images display on page
- [ ] No "Image unavailable" errors

## 🚨 Troubleshooting Flowchart

```
Image not showing?
    ↓
Check console logs [HF Image Generation]
    ↓
    ├─ Missing HF_TOKEN → Add to .env
    ├─ 401 Error → Verify token valid
    ├─ ImageKit Error → Check credentials
    ├─ Timeout → Check internet/HF status
    └─ Other → See IMAGE_GENERATION_DEBUG.md
        ↓
    Restart server: npm run dev
        ↓
    Try again
```

## 📚 Documentation Map

```
Quick Start?
    → IMAGE_GENERATION_QUICK_START.md

How does it work?
    → IMPLEMENTATION_SUMMARY.md

Need to debug?
    → IMAGE_GENERATION_DEBUG.md

Testing checklist?
    → INTEGRATION_CHECKLIST.md

Quick reference?
    → This file (REFERENCE_CARD.md)
```

## 🎨 Prompt Examples

These work well with FLUX.1:

```
"Minimalist cloud computing architecture, blue tones, professional"
"Modern office workspace with collaboration tools, bright lighting"
"Digital transformation concept with circuit patterns, modern"
"Data analytics dashboard with colorful graphs and visualizations"
"Cybersecurity lock and shield symbols, dark blue background"
"Green energy renewable resources, solar panels and wind turbines"
"Mobile app development workflow, code and UI elements"
"Blockchain network nodes connected, futuristic technology"
"Artificial intelligence neural network visualization, glowing"
"Business growth chart with upward trend, professional"
```

## 🔄 Request/Response Format

### HF Request

```json
{
  "inputs": "Professional presentation slide...",
  "parameters": {
    "width": 1440,
    "height": 810,
    "num_inference_steps": 4
  }
}
```

### HF Response

```
Binary PNG image data (arrayBuffer)
  ↓
Convert to base64
  ↓
Return: data:image/png;base64,{base64string}
```

### ImageKit Response

```json
{
  "fileId": "xxx",
  "name": "slide-xxx.png",
  "url": "https://ik.imagekit.io/xxx",
  "folder": "/presentations/xxx"
}
```

## 🌐 URLs to Know

| Service       | URL                                                     |
| ------------- | ------------------------------------------------------- |
| HF Dashboard  | https://huggingface.co/                                 |
| HF Tokens     | https://huggingface.co/settings/tokens                  |
| HF Model      | https://huggingface.co/black-forest-labs/FLUX.1-schnell |
| HF Status     | https://huggingface.co/status                           |
| ImageKit      | https://imagekit.io/                                    |
| Test Endpoint | http://localhost:3000/api/test-image                    |
| Dev Server    | http://localhost:3000                                   |

## 💡 Pro Tips

1. **Filter logs**: Use Ctrl+F in terminal to search for `[HF Image Generation]`
2. **Parallel generation**: All images generate at same time, not sequentially
3. **Image size**: Each image ~500KB, plan storage accordingly
4. **Caching**: Images regenerate each time, implement caching if needed
5. **Error retry**: Failed images show as "Image unavailable", regenerate presentation to retry

## 🎯 Success Indicators

✅ Test route generates image in 5-15 seconds
✅ Creating presentation shows generation progress
✅ Images appear on presentation page
✅ No 401/403 errors in logs
✅ Console shows `[Presentation Generation] Successfully completed`

## ⚙️ Tuning Parameters

Located in `src/integrations/inngest/functions.ts`:

```javascript
// Line ~95-105: Image generation parameters
parameters: {
  width: 1440,              // Image width
  height: 810,              // Image height (16:9)
  num_inference_steps: 4,   // 4=fastest, 20=best quality
}

// Line ~15-40: Prompt prefix
const optimizedPrompt = `Professional presentation slide illustration.
${prompt}. High quality, clean design, suitable for corporate/business
presentations. 16:9 aspect ratio.`
```

To optimize for speed: Reduce `num_inference_steps` (min: 1)
To optimize for quality: Increase `num_inference_steps` (max: 20, FLUX.1-dev)

## 📞 Debug Info to Gather

When reporting issues, include:

1. Terminal log output with `[HF Image Generation]` prefix
2. Presentation details (slides, style, tone)
3. Screenshot of error (if UI error)
4. `.env` variables (sanitized, no tokens)
5. Error message from browser console

---

**Version**: 1.0
**Last Updated**: 2025-05-20
**Status**: Ready to Use
**Model**: Hugging Face FLUX.1 Schnell
