import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import ProjectForm from '../components/ProjectForm'
import { useProject, useUpdateProject } from '../hooks/useData'

export default function EditProject() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading: isLoadingProject } = useProject(id)
  const updateMutation = useUpdateProject()
  const [error, setError] = useState(null)

  const handleSubmit = async (formData) => {
    try {
      await updateMutation.mutateAsync({
        id,
        title: formData.title,
        description: formData.description,
        status: formData.status,
        tags: formData.tags,
        githubUrl: formData.githubUrl,
        projectUrl: formData.projectUrl,
        projectUrlLabel: formData.projectUrlLabel,
      })
      navigate(`/projects/${id}`)
    } catch (err) {
      setError(err.message)
    }
  }

  if (isLoadingProject) {
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
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Edit Project</h2>
        <p className="text-gray-600 mt-2">{project.title}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <ProjectForm
        initialData={project}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        onCancel={() => navigate(`/projects/${id}`)}
      />
    </main>
  )
}
