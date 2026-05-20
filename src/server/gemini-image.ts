import { getPlaceholderImage } from '../features/presentation/utils/placeholder-mapper'

export async function generateSlideImage(prompt: string): Promise<string> {
  const hfToken = process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN

  if (!hfToken) {
    console.error('[generateSlideImage] Missing Hugging Face API token (HF_TOKEN or HUGGINGFACE_API_KEY)')
    return getPlaceholderImage('', '', prompt)
  }

  // Toggle check
  if (process.env.VITE_USE_REAL_AI_IMAGES !== 'true') {
    console.log('[generateSlideImage] Real AI images are disabled (VITE_USE_REAL_AI_IMAGES !== true). Bypassing HF API call.')
    return getPlaceholderImage('', '', prompt)
  }

  const API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"

  try {
    console.log(
      '[generateSlideImage] Starting HF image generation for prompt:',
      prompt.slice(0, 100),
    )

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
      }),
    })

    console.log('[generateSlideImage] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorBody = await response.text()
      const errorMsg = `Hugging Face API error (${response.status}): ${errorBody.slice(0, 300)}`
      console.error('[generateSlideImage] API Error:', errorMsg)
      return getPlaceholderImage('', '', prompt)
    }

    // Validate Content-Type
    const contentType = response.headers.get('content-type')
    console.log('[generateSlideImage] Content-Type:', contentType)
    if (contentType && !contentType.includes('image')) {
      const errorText = await response.text()
      console.error(`[generateSlideImage] Error: Non-image content-type returned (${contentType}):`, errorText.slice(0, 300))
      return getPlaceholderImage('', '', prompt)
    }

    // Hugging Face returns binary image data
    const buffer = await response.arrayBuffer()

    if (!buffer || buffer.byteLength === 0) {
      console.error('[generateSlideImage] Received empty image buffer from Hugging Face')
      return getPlaceholderImage('', '', prompt)
    }

    const b64 = Buffer.from(buffer).toString('base64')
    console.log('[generateSlideImage] Successfully generated image', {
      sizeBytes: buffer.byteLength,
      promptLength: prompt.length,
    })

    return `data:image/png;base64,${b64}`
  } catch (error) {
    console.error('[generateSlideImage] Error:', error)
    return getPlaceholderImage('', '', prompt)
  }
}
