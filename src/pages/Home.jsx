import { Link } from 'react-router-dom'
import ProjectList from '../components/ProjectList'
import { useProjects, useTags, useNewIdeaCount } from '../hooks/useData'

export default function Home() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: tags = [] } = useTags()
  const { data: newIdeaCount = 0 } = useNewIdeaCount()

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Loading projects...</p>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {newIdeaCount > 0 && (
        <Link
          to="/ideas"
          className="block mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 hover:bg-blue-100 transition-colors"
        >
          <span className="text-blue-900 font-medium">
            💡 {newIdeaCount} new idea{newIdeaCount === 1 ? '' : 's'} waiting for review
          </span>
          <span className="text-blue-700 text-sm ml-2">View ideas →</span>
        </Link>
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">All Projects</h2>
        <p className="text-gray-600 mt-2">
          Explore what your team is working on. Click any project to view details and add notes.
        </p>
      </div>

      <ProjectList projects={projects} tags={tags} />
    </main>
  )
}
