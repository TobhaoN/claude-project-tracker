import { useState } from 'react'
import { useNotes, useAddNote } from '../hooks/useData'

export default function NotesList({ projectId }) {
  const { data: notes, isLoading } = useNotes(projectId)
  const addNoteMutation = useAddNote()
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!authorName.trim() || !content.trim()) return

    try {
      await addNoteMutation.mutateAsync({
        projectId,
        authorName: authorName.trim(),
        content: content.trim(),
      })
      setAuthorName('')
      setContent('')
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-6 text-gray-500">Loading notes...</div>
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Notes & Comments</h3>

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
          <textarea
            placeholder="Add a note or comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
          <button
            type="submit"
            disabled={addNoteMutation.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {addNoteMutation.isPending ? 'Posting...' : 'Post Note'}
          </button>
        </div>
      </form>

      {/* Notes List */}
      {notes && notes.length === 0 ? (
        <p className="text-center py-6 text-gray-500">No notes yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-3">
          {notes?.map(note => (
            <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-900">{note.author_name}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
