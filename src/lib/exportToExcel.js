import * as XLSX from 'xlsx'
import { supabase } from './supabaseClient'
import { htmlToPlainText } from '../components/RichText'

export async function exportProjectsToExcel() {
  // Fetch all projects with full details
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      status,
      github_url,
      project_url,
      project_url_label,
      created_at,
      updated_at,
      users (name, email),
      project_tags (tags (name)),
      notes (content, author_name, created_at)
    `)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  // Build the main Projects sheet
  const projectsRows = projects.map((p) => ({
    'Title': p.title,
    'Description': htmlToPlainText(p.description),
    'Status': p.status,
    'GitHub URL': p.github_url || '',
    'Project Link Label': p.project_url_label || '',
    'Project URL': p.project_url || '',
    'Owner Name': p.users?.name || '',
    'Owner Email': p.users?.email || '',
    'Tags': p.project_tags.map((pt) => pt.tags.name).join(', '),
    'Note Count': p.notes.length,
    'Created': new Date(p.created_at).toLocaleString(),
    'Updated': new Date(p.updated_at).toLocaleString(),
  }))

  // Build a Notes sheet (one row per note, tied to project title)
  const notesRows = []
  projects.forEach((p) => {
    p.notes.forEach((n) => {
      notesRows.push({
        'Project': p.title,
        'Author': n.author_name,
        'Note': n.content,
        'Created': new Date(n.created_at).toLocaleString(),
      })
    })
  })

  // Create workbook
  const wb = XLSX.utils.book_new()

  const projectsSheet = XLSX.utils.json_to_sheet(projectsRows)
  projectsSheet['!cols'] = [
    { wch: 30 }, { wch: 50 }, { wch: 12 }, { wch: 35 }, { wch: 18 }, { wch: 35 }, { wch: 20 },
    { wch: 28 }, { wch: 35 }, { wch: 10 }, { wch: 20 }, { wch: 20 },
  ]
  XLSX.utils.book_append_sheet(wb, projectsSheet, 'Projects')

  if (notesRows.length > 0) {
    const notesSheet = XLSX.utils.json_to_sheet(notesRows)
    notesSheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 60 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, notesSheet, 'Notes')
  }

  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `project-tracker-export-${date}.xlsx`)
}
