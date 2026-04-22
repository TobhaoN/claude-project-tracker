import ProjectList from '../components/ProjectList'
import { useProjects, useTags } from '../hooks/useData'

export default function Home() {
  const { data: projects = [], isLoading } = useProjects()
  const { data: tags = [] } = useTags()

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-gray-500">Loading projects...</p>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
