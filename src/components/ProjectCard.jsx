import { Link } from 'react-router-dom'
import { htmlToPlainText } from './RichText'

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  draft: 'bg-gray-100 text-gray-800',
}

export default function ProjectCard({ project }) {
  const statusLabel = project.status.charAt(0).toUpperCase() + project.status.slice(1)
  
  return (
    <Link
      to={`/projects/${project.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 hover:border-blue-300"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {project.title}
        </h3>
        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${statusColors[project.status]}`}>
          {statusLabel}
        </span>
      </div>

      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
        {htmlToPlainText(project.description)}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {project.tags && project.tags.map(tag => (
          <span
            key={tag.id}
            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium"
          >
            {tag.name}
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-500 space-y-1">
        <p>👤 {project.owner?.name || 'Unknown'}</p>
        <p>💬 {project.noteCount || 0} notes</p>
      </div>
    </Link>
  )
}
