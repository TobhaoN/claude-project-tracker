import { useState, useEffect } from 'react'
import RichTextEditor from './RichTextEditor'
import { useTags } from '../hooks/useData'

export default function ProjectForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel,
  onCancel,
  cancelLabel = 'Cancel',
}) {
  const { data: tags = [] } = useTags()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active',
    tags: [],
    githubUrl: '',
    projectUrl: '',
    projectUrlLabel: 'Live Demo',
    ownerName: '',
    ownerEmail: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'active',
        tags: initialData.tags?.map(t => t.id) || [],
        githubUrl: initialData.github_url || '',
        projectUrl: initialData.project_url || '',
        projectUrlLabel: initialData.project_url_label || 'Live Demo',
        ownerName: initialData.owner?.name || '',
        ownerEmail: initialData.owner?.email || '',
      })
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleDescriptionChange = (html) => {
    setFormData(prev => ({ ...prev, description: html }))
  }

  const handleTagToggle = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId],
    }))
  }

  const descriptionTextLength = (() => {
    if (!formData.description) return 0
    if (typeof window === 'undefined') return formData.description.length
    const tmp = document.createElement('div')
    tmp.innerHTML = formData.description
    return (tmp.textContent || '').trim().length
  })()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || descriptionTextLength === 0) {
      alert('Title and description are required')
      return
    }
    const trimmedUrl = formData.githubUrl.trim()
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      alert('GitHub URL must start with http:// or https://')
      return
    }
    const trimmedProjectUrl = formData.projectUrl.trim()
    if (trimmedProjectUrl && !/^https?:\/\//i.test(trimmedProjectUrl)) {
      alert('Project URL must start with http:// or https://')
      return
    }
    onSubmit({
      ...formData,
      githubUrl: trimmedUrl,
      projectUrl: trimmedProjectUrl,
      projectUrlLabel: trimmedProjectUrl ? formData.projectUrlLabel.trim() : '',
    })
  }

  const buttonLabel = submitLabel || (initialData ? 'Save Changes' : 'Create Project')

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Customer Dashboard Redesign"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Describe what you're working on..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Use the toolbar to add formatting, lists, or links.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <input
            type="url"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="https://github.com/your-org/your-repo"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Link
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              name="projectUrlLabel"
              value={formData.projectUrlLabel}
              onChange={handleChange}
              className="sm:w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Live Demo</option>
              <option>Claude Project</option>
              <option>Figma</option>
              <option>Docs</option>
              <option>Notion</option>
              <option>Slides</option>
              <option>Video</option>
              <option>Website</option>
              <option>Other</option>
            </select>
            <input
              type="url"
              name="projectUrl"
              value={formData.projectUrl}
              onChange={handleChange}
              placeholder="https://example.com"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Pick what kind of link this is, then paste the URL.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  formData.tags.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email *
            </label>
            <input
              type="email"
              name="ownerEmail"
              value={formData.ownerEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold disabled:opacity-50 transition-colors"
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto sm:min-w-40 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Saving...' : buttonLabel}
          </button>
        </div>
      </div>
    </form>
  )
}
