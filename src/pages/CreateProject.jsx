import { useNavigate } from 'react-router-dom'
import ProjectForm from '../components/ProjectForm'
import { useCreateProject } from '../hooks/useData'

export default function CreateProject() {
  const navigate = useNavigate()
  const createMutation = useCreateProject()

  const handleSubmit = async (formData) => {
    try {
      await createMutation.mutateAsync(formData)
      navigate('/')
    } catch (error) {
      alert('Error creating project: ' + error.message)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create New Project</h2>
        <p className="text-gray-600 mt-2">Share what you're working on with your team</p>
      </div>

      <ProjectForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </main>
  )
}
