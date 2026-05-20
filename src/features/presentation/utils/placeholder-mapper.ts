/**
 * Resolves a dynamic placeholder image path based on the slide title, content, or prompt keywords.
 */
export function getPlaceholderImage(title: string = '', content: string = '', prompt: string = ''): string {
  const text = `${title} ${content} ${prompt}`.toLowerCase()

  if (/ai|artificial|intelligence|neural|deepmind|learning|brain|robot|agent|machine learning/i.test(text)) {
    return '/placeholders/ai.jpg'
  }
  if (/cloud|network|server|internet|database|hosting|web|online|api|saas|infrastructure|compute/i.test(text)) {
    return '/placeholders/cloud.jpg'
  }
  if (/future|futuristic|quantum|space|galaxy|cosmic|dimension|sci-fi|cyber|next-gen/i.test(text)) {
    return '/placeholders/futuristic.jpg'
  }
  if (/business|corp|corporate|finance|marketing|strategy|money|growth|revenue|office|work|presentation|sales|executive/i.test(text)) {
    return '/placeholders/business.jpg'
  }
  
  // Default to technology if no other keywords match
  return '/placeholders/technology.jpg'
}
