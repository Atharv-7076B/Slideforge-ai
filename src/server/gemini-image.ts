import { InferenceClient } from '@huggingface/inference'
import { getPlaceholderImage } from '../features/presentation/utils/placeholder-mapper'

export { getPlaceholderImage }

/**
 * Safely formats any image-generation error into a detailed, human-readable string.
 * Strips/redacts any authorization tokens or secrets.
 */
function formatImageGenerationError(error: unknown): string {
  if (error instanceof Error) {
    const details: Record<string, unknown> = {
      name: error.name,
      message: error.message,
    }

    // Capture standard HTTP / provider error metadata
    if ('status' in error) details.status = (error as any).status
    if ('statusCode' in error) details.statusCode = (error as any).statusCode
    if ('code' in error) details.code = (error as any).code
    if ('cause' in error) details.cause = (error as any).cause

    // Capture HTTP response details if available (e.g. from ProviderApiError)
    if ('httpResponse' in error) {
      try {
        const resp = (error as any).httpResponse
        details.httpResponse = {
          status: resp?.status,
          statusText: resp?.statusText,
          body: resp?.body,
        }
      } catch {
        // ignore serialization errors
      }
    }

    if ('response' in error) {
      try {
        const resp = (error as any).response
        details.response = typeof resp === 'object' ? JSON.stringify(resp) : String(resp)
      } catch {
        // ignore
      }
    }

    let jsonDetails = ''
    try {
      jsonDetails = JSON.stringify(details, null, 2)
    } catch {
      jsonDetails = String(error.message)
    }

    // Redact any possible secret or token patterns
    jsonDetails = jsonDetails.replace(/hf_[A-Za-z0-9_-]+/g, '[REDACTED_HF_TOKEN]')
    jsonDetails = jsonDetails.replace(/Bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED]')

    return `${error.name}: ${error.message}${
      error.stack ? `\nStack: ${error.stack.split('\n').slice(0, 5).join('\n')}` : ''
    }\nError Details:\n${jsonDetails}`
  }

  try {
    const json = JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    return json.replace(/hf_[A-Za-z0-9_-]+/g, '[REDACTED_HF_TOKEN]').replace(/Bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED]')
  } catch {
    return String(error)
  }
}

export type GenerateSlideImageOptions = {
  slideOrder?: number
}

export async function generateSlideImage(
  prompt: string,
  options?: GenerateSlideImageOptions
): Promise<string | null> {
  const hfToken = process.env.HF_TOKEN ?? process.env.HUGGINGFACE_API_KEY

  if (!hfToken) {
    console.error('[generateSlideImage] Missing Hugging Face API token')
    return null
  }

  if (process.env.VITE_USE_REAL_AI_IMAGES !== 'true') {
    console.log('[generateSlideImage] Real AI images are disabled')
    return null
  }

  const client = new InferenceClient(hfToken)

  const slideLabel = options?.slideOrder !== undefined ? ` [Slide #${options.slideOrder + 1}]` : ''
  console.log(
    `[generateSlideImage] Starting image generation${slideLabel} (prompt length: ${prompt.length}, preview: "${prompt.slice(0, 100)}...")`
  )

  // Primary model: Qwen/Qwen-Image
  try {
    console.log(`[generateSlideImage] Trying Qwen/Qwen-Image${slideLabel}`)
    const image = (await client.textToImage(
      {
        model: 'Qwen/Qwen-Image',
        inputs: prompt,
        outputType: 'blob',
      } as any,
      { outputType: 'blob' },
    )) as Blob

    if (!image) {
      console.warn(`[generateSlideImage] Qwen returned null or undefined response${slideLabel}`)
    } else {
      const buffer = Buffer.from(await image.arrayBuffer())
      if (buffer.byteLength === 0) {
        console.warn(`[generateSlideImage] Qwen returned empty buffer (0 bytes)${slideLabel}`)
      } else {
        console.log(`[generateSlideImage] Qwen image generated successfully${slideLabel} (${buffer.byteLength} bytes)`)
        return `data:image/png;base64,${buffer.toString('base64')}`
      }
    }
  } catch (error) {
    console.error(
      `[generateSlideImage] Qwen generation failed${slideLabel}:\n`,
      formatImageGenerationError(error)
    )
  }

  // Fallback model: black-forest-labs/FLUX.2-klein-4B
  try {
    console.log(`[generateSlideImage] Trying FLUX.2-klein-4B fallback${slideLabel}`)
    const image = (await client.textToImage(
      {
        model: 'black-forest-labs/FLUX.2-klein-4B',
        inputs: prompt,
        outputType: 'blob',
      } as any,
      { outputType: 'blob' },
    )) as Blob

    if (!image) {
      console.warn(`[generateSlideImage] FLUX fallback returned null or undefined response${slideLabel}`)
    } else {
      const buffer = Buffer.from(await image.arrayBuffer())
      if (buffer.byteLength === 0) {
        console.warn(`[generateSlideImage] FLUX fallback returned empty buffer (0 bytes)${slideLabel}`)
      } else {
        console.log(`[generateSlideImage] FLUX fallback image generated successfully${slideLabel} (${buffer.byteLength} bytes)`)
        return `data:image/png;base64,${buffer.toString('base64')}`
      }
    }
  } catch (error) {
    console.error(
      `[generateSlideImage] FLUX fallback failed${slideLabel}:\n`,
      formatImageGenerationError(error)
    )
  }

  console.error(`[generateSlideImage] All AI image generation failed${slideLabel}`)
  return null
}
