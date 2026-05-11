import { useMemo } from 'react'
import { useProjects, useIdeas } from '../hooks/useData'

const IDEA_STATUS_META = {
  new: { label: 'New', color: 'bg-blue-600' },
  under_review: { label: 'Under Review', color: 'bg-yellow-500' },
  approved: { label: 'Approved', color: 'bg-green-600' },
  rejected: { label: 'Rejected', color: 'bg-red-600' },
  converted: { label: 'Converted', color: 'bg-purple-600' },
}

export default function Analytics() {
  const { data: projects = [] } = useProjects()
  const { data: ideas = [] } = useIdeas()

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

  const ideaStats = useMemo(() => {
    const total = ideas.length
    const statusCounts = Object.keys(IDEA_STATUS_META).reduce((acc, key) => {
      acc[key] = ideas.filter((i) => i.status === key).length
      return acc
    }, {})
    const conversionRate = total === 0 ? 0 : Math.round((statusCounts.converted / total) * 100)

    const brandCounts = {}
    ideas.forEach((idea) => {
      ;(idea.brands || []).forEach((b) => {
        brandCounts[b] = (brandCounts[b] || 0) + 1
      })
    })
    const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])

    const submitterCounts = {}
    ideas.forEach((idea) => {
      const key = idea.submitter_name || idea.submitter_email || 'Unknown'
      submitterCounts[key] = (submitterCounts[key] || 0) + 1
    })
    const topSubmitters = Object.entries(submitterCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const recentIdeas = [...ideas]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)

    return {
      total,
      statusCounts,
      conversionRate,
      topBrands,
      topSubmitters,
      recentIdeas,
    }
  }, [ideas])

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

      {/* Ideas analytics */}
      <div className="mt-16">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Project Ideas</h2>
          <p className="text-gray-600 mt-1">Submission pipeline and conversion metrics</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Total Ideas</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{ideaStats.total}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">New</p>
            <p className="text-4xl font-bold text-blue-600 mt-2">{ideaStats.statusCounts.new || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Converted</p>
            <p className="text-4xl font-bold text-purple-600 mt-2">{ideaStats.statusCounts.converted || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm font-medium">Conversion Rate</p>
            <p className="text-4xl font-bold text-green-600 mt-2">{ideaStats.conversionRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ideas status breakdown */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Ideas by Status</h3>
            {ideaStats.total === 0 ? (
              <p className="text-gray-500 text-center py-6">No ideas yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(IDEA_STATUS_META).map(([key, meta]) => {
                  const count = ideaStats.statusCounts[key] || 0
                  const pct = ideaStats.total === 0 ? 0 : (count / ideaStats.total) * 100
                  return (
                    <div key={key}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">{meta.label}</span>
                        <span className="text-gray-900 font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${meta.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Ideas by brand */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Ideas by Brand</h3>
            {ideaStats.topBrands.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No brand data yet</p>
            ) : (
              <div className="space-y-3">
                {ideaStats.topBrands.map(([brand, count]) => {
                  const pct = ideaStats.total === 0 ? 0 : (count / ideaStats.total) * 100
                  return (
                    <div key={brand}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">{brand}</span>
                        <span className="text-gray-900 font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top submitters */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Submitters</h3>
            {ideaStats.topSubmitters.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                {ideaStats.topSubmitters.map(([name, count], index) => (
                  <div key={name} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                    <span className="text-2xl font-bold text-gray-300">{index + 1}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{name}</h4>
                      <p className="text-sm text-gray-600">💡 {count} idea{count === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent ideas */}
          <div className="bg-white rounded-lg shadow p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Ideas</h3>
            {ideaStats.recentIdeas.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No ideas yet</p>
            ) : (
              <div className="space-y-4">
                {ideaStats.recentIdeas.map((idea) => {
                  const meta = IDEA_STATUS_META[idea.status] || IDEA_STATUS_META.new
                  return (
                    <div key={idea.id} className="flex items-start justify-between gap-3 pb-4 border-b last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                        <p className="text-sm text-gray-600">
                          {idea.submitter_name} · {new Date(idea.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`shrink-0 px-2 py-1 rounded text-xs font-medium text-white ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
