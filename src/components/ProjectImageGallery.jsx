import { useState } from 'react'
import { useProjectImages } from '../hooks/useData'

export default function ProjectImageGallery({ projectId, inline = false }) {
  const { data: images = [], isLoading } = useProjectImages(projectId)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (isLoading || images.length === 0) return null

  const close = () => setLightboxIndex(null)
  const prev = (e) => {
    e.stopPropagation()
    setLightboxIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }
  const next = (e) => {
    e.stopPropagation()
    setLightboxIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  const wrapperClass = inline
    ? 'border-t pt-6 mt-6'
    : 'bg-white rounded-lg shadow p-8'

  return (
    <div className={wrapperClass}>
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Images</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setLightboxIndex(idx)}
            className="block rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <img
              src={img.url}
              alt={img.caption || 'Project image'}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 text-white text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-4 text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-4 text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10"
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].caption || 'Project image'}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
