import { useState, useMemo } from 'react'
import IdeaForm from '../components/IdeaForm'
import IdeaCard from '../components/IdeaCard'
import { useIdeas } from '../hooks/useData'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'converted', label: 'Converted' },
]

export default function Ideas() {
  const { data: ideas = [], isLoading } = useIdeas()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return ideas
    return ideas.filter((i) => i.status === filter)
  }, [ideas, filter])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Project Ideas</h2>
          <p className="text-gray-600 mt-2">
            Submit ideas and turn the best ones into tracked projects.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          {showForm ? 'Close form' : '+ Submit Idea'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <IdeaForm onSubmitted={() => setShowForm(false)} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1 opacity-70">
                ({ideas.filter((i) => i.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-center text-gray-500">Loading ideas...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          {ideas.length === 0
            ? 'No ideas yet. Be the first to submit one!'
            : 'No ideas match this filter.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </main>
  )
}
