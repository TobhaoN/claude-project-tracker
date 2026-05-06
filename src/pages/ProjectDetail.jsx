import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import NotesList from '../components/NotesList'
import RichText from '../components/RichText'
import { useProject, useDeleteProject } from '../hooks/useData'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-800',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading } = useProject(id)
  const deleteMutation = useDeleteProject()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return

    try {
      await deleteMutation.mutateAsync(id)
      navigate('/')
    } catch (error) {
      alert('Error deleting project: ' + error.message)
    }
  }

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Loading...</p>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-red-600">Project not found</p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            ← Back to projects
          </Link>
        </div>
      </main>
    )
  }

  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Navigation */}
      <div className="mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to projects
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-8">
          {/* Project Header */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
              <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${statusColors[project.status]}`}>
                {statusLabel}
              </span>
            </div>

            <RichText html={project.description} className="text-lg mb-6" />

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <span>🐙</span>
                <span>View on GitHub</span>
              </a>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <p>👤 <span className="font-semibold">{project.owner?.name}</span></p>
              <p>📧 {project.owner?.email}</p>
              <p>📅 Created {new Date(project.created_at).toLocaleDateString()}</p>
              {project.updated_at && project.created_at !== project.updated_at && (
                <p>✏️ Updated {new Date(project.updated_at).toLocaleDateString()}</p>
              )}
            </div>

            {/* Edit/Delete Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Link
                to={`/projects/${project.id}/edit`}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium text-center transition-colors"
              >
                Edit Project
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          {/* Notes Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <NotesList projectId={id} />
          </div>
        </div>

        {/* Sidebar - Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Project Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className="font-semibold capitalize">{project.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tags</span>
                <span className="font-semibold">{project.tags?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Notes</span>
                <span className="font-semibold">Coming soon</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Anyone can add notes and comments to help collaborate on this project!
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
