import { Link } from 'react-router-dom'
import {
  useUpdateIdeaStatus,
  useDeleteIdea,
  useConvertIdeaToProject,
} from '../hooks/useData'

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'converted', label: 'Converted', color: 'bg-purple-100 text-purple-800' },
]

export default function IdeaCard({ idea }) {
  const updateStatus = useUpdateIdeaStatus()
  const deleteIdea = useDeleteIdea()
  const convert = useConvertIdeaToProject()

  const status = STATUS_OPTIONS.find((s) => s.value === idea.status) || STATUS_OPTIONS[0]
  const isConverted = idea.status === 'converted'

  const handleStatusChange = (e) => {
    updateStatus.mutate({ id: idea.id, status: e.target.value })
  }

  const handleConvert = async () => {
    if (!window.confirm(`Create a new project from "${idea.title}"?`)) return
    try {
      await convert.mutateAsync({ idea })
    } catch (err) {
      alert('Failed to convert: ' + err.message)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this idea? This cannot be undone.')) return
    try {
      await deleteIdea.mutateAsync(idea.id)
    } catch (err) {
      alert('Failed to delete: ' + err.message)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{idea.title}</h3>
        <span className={`shrink-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${status.color}`}>
          {status.label}
        </span>
      </div>

      {idea.brands && idea.brands.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {idea.brands.map((b) => (
            <span key={b} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded font-medium">
              {b}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-3 text-sm">
        <div>
          <div className="font-semibold text-gray-900">Description</div>
          <p className="text-gray-700 whitespace-pre-wrap">{idea.description}</p>
        </div>
        <div>
          <div className="font-semibold text-gray-900">Use case</div>
          <p className="text-gray-700 whitespace-pre-wrap">{idea.use_case}</p>
        </div>
        <div>
          <div className="font-semibold text-gray-900">Value prop</div>
          <p className="text-gray-700 whitespace-pre-wrap">{idea.value_prop}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
        <p>👤 {idea.submitter_name} · ✉ {idea.submitter_email}</p>
        <p>📅 Submitted {new Date(idea.created_at).toLocaleDateString()}</p>
        {idea.converted_project_id && (
          <p>
            🚀{' '}
            <Link
              to={`/projects/${idea.converted_project_id}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View converted project
            </Link>
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <select
          value={idea.status}
          onChange={handleStatusChange}
          disabled={updateStatus.isPending || isConverted}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value} disabled={s.value === 'converted'}>
              {s.label}
            </option>
          ))}
        </select>

        {!isConverted && (
          <button
            type="button"
            onClick={handleConvert}
            disabled={convert.isPending}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {convert.isPending ? 'Converting...' : '→ Convert to Project'}
          </button>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteIdea.isPending}
          className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
