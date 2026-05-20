'use server'

/**
 * Generate slide images using Hugging Face FLUX.1-schnell model
 * This replaces the Google Imagen API for better quality and faster generation
 */

export async function generateSlideImage(prompt: string): Promise<string> {
  const hfToken = process.env.HF_TOKEN

  if (!hfToken) {
    throw new Error(
      'Hugging Face API token not configured. Please set HF_TOKEN environment variable.',
    )
  }

  try {
    console.log(
      '[generateSlideImage] Starting HF image generation for prompt:',
      prompt.slice(0, 100),
    )

    // Optimize prompt for presentation quality
    const optimizedPrompt = `Professional presentation slide background. ${prompt}. Corporate, clean, high-quality design suitable for business presentations. 16:9 aspect ratio.`

    const response = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${hfToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: optimizedPrompt,
          parameters: {
            width: 1440,
            height: 810,
            num_inference_steps: 4,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      const errorMsg = `Hugging Face API error (${response.status}): ${errorBody.slice(0, 500)}`
      console.error('[generateSlideImage] API Error:', errorMsg)
      throw new Error(errorMsg)
    }

    // Hugging Face returns binary image data
    const buffer = await response.arrayBuffer()

    if (buffer.byteLength === 0) {
      throw new Error('Received empty image buffer from Hugging Face')
    }

    const b64 = Buffer.from(buffer).toString('base64')
    console.log('[generateSlideImage] Successfully generated image', {
      sizeBytes: buffer.byteLength,
      promptLength: prompt.length,
    })

    return `data:image/png;base64,${b64}`
  } catch (error) {
    console.error('[generateSlideImage] Error:', error)
    throw error
  }
}
