import { useState } from 'react'
import { useCreateIdea } from '../hooks/useData'

const BRAND_OPTIONS = ['VinSolutions', 'vAuto', 'Xtime', 'Dealertrack', 'Dealer.com']

export default function IdeaForm({ onSubmitted }) {
  const createIdea = useCreateIdea()
  const [form, setForm] = useState({
    title: '',
    brands: [],
    description: '',
    useCase: '',
    valueProp: '',
    submitterName: '',
    submitterEmail: '',
  })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handle = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const toggleBrand = (brand) => {
    setForm((p) => ({
      ...p,
      brands: p.brands.includes(brand)
        ? p.brands.filter((b) => b !== brand)
        : [...p.brands, brand],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.useCase.trim() ||
      !form.valueProp.trim() ||
      !form.submitterName.trim() ||
      !form.submitterEmail.trim()
    ) {
      setError('Please fill out every field.')
      return
    }
    try {
      await createIdea.mutateAsync({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        useCase: form.useCase.trim(),
        valueProp: form.valueProp.trim(),
        submitterName: form.submitterName.trim(),
        submitterEmail: form.submitterEmail.trim(),
      })
      setSuccess(true)
      setForm({
        title: '',
        brands: [],
        description: '',
        useCase: '',
        valueProp: '',
        submitterName: '',
        submitterEmail: '',
      })
      if (onSubmitted) onSubmitted()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-2xl space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">Submit a Project Idea</h3>
        <p className="text-sm text-gray-600 mt-1">
          Share an idea for the team to consider. Approved ideas can be turned into projects.
        </p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          Thanks! Your idea was submitted.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Idea Title *</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handle}
          placeholder="Short summary of the idea"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Related Brands</label>
        <div className="flex flex-wrap gap-2">
          {BRAND_OPTIONS.map((brand) => {
            const selected = form.brands.includes(brand)
            return (
              <button
                type="button"
                key={brand}
                onClick={() => toggleBrand(brand)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Describe the idea *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handle}
          rows="4"
          placeholder="What are you proposing?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Use case *</label>
        <textarea
          name="useCase"
          value={form.useCase}
          onChange={handle}
          rows="3"
          placeholder="Who would use this, and how?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Value proposition *</label>
        <textarea
          name="valueProp"
          value={form.valueProp}
          onChange={handle}
          rows="3"
          placeholder="What value does it deliver?"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
          <input
            type="text"
            name="submitterName"
            value={form.submitterName}
            onChange={handle}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Your Email *</label>
          <input
            type="email"
            name="submitterEmail"
            value={form.submitterEmail}
            onChange={handle}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={createIdea.isPending}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition-colors"
        >
          {createIdea.isPending ? 'Submitting...' : 'Submit Idea'}
        </button>
      </div>
    </form>
  )
}
