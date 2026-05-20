'use server'

import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
})

export async function generateSlideImage(prompt: string) {
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
    },
  })

  const generatedImage = response.generatedImages?.[0]?.image?.imageBytes

  if (!generatedImage) {
    throw new Error('No image generated')
  }

  return `data:image/png;base64,${generatedImage}`
}
