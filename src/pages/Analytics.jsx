import { useMemo } from 'react'
import { useProjects } from '../hooks/useData'

export default function Analytics() {
  const { data: projects = [] } = useProjects()

  const stats = useMemo(() => {
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'active').length
    const completedProjects = projects.filter(p => p.status === 'completed').length
    const pausedProjects = projects.filter(p => p.status === 'paused').length

    const totalNotes = projects.reduce((sum, p) => sum + (p.noteCount || 0), 0)

    const trendingProjects = [...projects]
      .sort((a, b) => (b.noteCount || 0) - (a.noteCount || 0))
      .slice(0, 5)

    const tagFrequency = {}
    projects.forEach(project => {
      project.tags?.forEach(tag => {
        tagFrequency[tag.id] = (tagFrequency[tag.id] || 0) + 1
      })
    })

    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pausedProjects,
      totalNotes,
      trendingProjects,
      topTags,
    }
  }, [projects])

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Analytics</h2>
        <p className="text-gray-600 mt-2">Overview of team project activity</p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Projects</p>
          <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalProjects}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Active Projects</p>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.activeProjects}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Completed Projects</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.completedProjects}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Notes</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats.totalNotes}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Trending Projects */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Most Discussed Projects</h3>
          {stats.trendingProjects.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No projects yet</p>
          ) : (
            <div className="space-y-4">
              {stats.trendingProjects.map((project, index) => (
                <div key={project.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                  <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600">💬 {project.noteCount || 0} notes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Project Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Status Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Active</span>
                <span className="text-gray-900 font-bold">{stats.activeProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${stats.totalProjects === 0 ? 0 : (stats.activeProjects / stats.totalProjects) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Paused</span>
                <span className="text-gray-900 font-bold">{stats.pausedProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{
                    width: `${stats.totalProjects === 0 ? 0 : (stats.pausedProjects / stats.totalProjects) * 100}%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700 font-medium">Completed</span>
                <span className="text-gray-900 font-bold">{stats.completedProjects}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${stats.totalProjects === 0 ? 0 : (stats.completedProjects / stats.totalProjects) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
