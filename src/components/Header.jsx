import { Link } from 'react-router-dom'
import { useState } from 'react'
import { exportProjectsToExcel } from '../lib/exportToExcel'

export default function Header() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      await exportProjectsToExcel()
    } catch (err) {
      alert('Export failed: ' + err.message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              <Link to="/">📋 Project Tracker</Link>
            </h1>
            <p className="text-gray-600 text-sm mt-1">Collaborate on projects with your team</p>
          </div>
          <nav className="space-x-4 flex items-center">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">
              Projects
            </Link>
            <Link to="/analytics" className="text-gray-600 hover:text-gray-900 font-medium">
              Analytics
            </Link>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
            >
              {exporting ? 'Exporting...' : '⬇ Export'}
            </button>
            <Link
              to="/projects/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              + New Project
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
