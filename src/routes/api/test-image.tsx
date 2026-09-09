import { createFileRoute } from '@tanstack/react-router'
import { generateSlideImage } from '../../server/gemini-image'

export const Route = createFileRoute('/api/test-image')({
  loader: async () => {
    const image = await generateSlideImage(
      'Modern AI presentation background, blue gradient, corporate style',
    )

    return {
      image,
    }
  },

  component: TestImagePage,
})

function TestImagePage() {
  const data = Route.useLoaderData() as { image: string | null }

  return (
    <div className="p-10">
      {data.image ? (
        <img src={data.image} alt="Generated" className="w-full rounded-xl" />
      ) : (
        <p className="text-gray-500">No image generated (generation disabled or failed).</p>
      )}
    </div>
  )
}
