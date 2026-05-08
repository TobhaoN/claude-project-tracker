import { useRef, useState } from 'react'
import { useProjectImages, useUploadProjectImage, useDeleteProjectImage } from '../hooks/useData'

export default function ProjectImageManager({ projectId }) {
  const fileInputRef = useRef(null)
  const { data: images = [], isLoading } = useProjectImages(projectId)
  const uploadMutation = useUploadProjectImage()
  const deleteMutation = useDeleteProjectImage()
  const [error, setError] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setError(null)
    setPendingCount(files.length)
    try {
      for (const file of files) {
        await uploadMutation.mutateAsync({ projectId, file })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setPendingCount(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (image) => {
    if (!window.confirm('Remove this image?')) return
    setError(null)
    try {
      await deleteMutation.mutateAsync({ image })
    } catch (err) {
      setError(err.message)
    }
  }

  const isUploading = uploadMutation.isPending || pendingCount > 0

  return (
    <div className="bg-white rounded-lg shadow p-8 max-w-2xl mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Images</h3>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {isUploading ? `Uploading${pendingCount > 1 ? ` (${pendingCount})` : ''}...` : 'Upload images'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Up to 10 MB per image. Supported: PNG, JPG, GIF, WebP.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-gray-500">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={img.url}
                alt={img.caption || 'Project image'}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleDelete(img)}
                disabled={deleteMutation.isPending}
                className="absolute top-1 right-1 bg-white/90 hover:bg-red-600 hover:text-white text-gray-700 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow disabled:opacity-50 transition-colors"
                title="Remove image"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
