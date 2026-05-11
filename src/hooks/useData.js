import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useProjects(filters = {}) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          github_url,
          project_url,
          project_url_label,
          owner_id,
          created_at,
          updated_at,
          users (name, email),
          project_tags (tags (id, name)),
          notes (id)
        `)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      if (filters.tag) {
        // Filter by tag - would need a more complex query
        // For now, we'll filter client-side
      }

      const { data, error } = await query

      if (error) throw new Error(error.message)

      return data.map(project => ({
        ...project,
        owner: project.users,
        tags: project.project_tags.map(pt => pt.tags),
        noteCount: project.notes.length,
      }))
    },
  })
}

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          github_url,
          project_url,
          project_url_label,
          owner_id,
          created_at,
          updated_at,
          users (id, name, email),
          project_tags (tags (id, name))
        `)
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)

      return {
        ...data,
        owner: data.users,
        tags: data.project_tags.map(pt => pt.tags),
      }
    },
    enabled: !!id,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('id, name')
        .order('name')

      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useNotes(projectId) {
  return useQuery({
    queryKey: ['notes', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('id, content, author_name, created_at')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!projectId,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectData) => {
      const { title, description, status, tags, githubUrl, projectUrl, projectUrlLabel, ownerName, ownerEmail } = projectData

      // Get or create user
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', ownerEmail)
        .single()

      if (userError) {
        // Create new user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ name: ownerName, email: ownerEmail }])
          .select('id')
          .single()

        if (createError) throw new Error(createError.message)
        user = newUser
      }

      // Create project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title,
          description,
          status,
          github_url: githubUrl || null,
          project_url: projectUrl || null,
          project_url_label: projectUrlLabel || null,
          owner_id: user.id,
        }])
        .select('id')
        .single()

      if (projectError) throw new Error(projectError.message)

      // Add tags
      if (tags && tags.length > 0) {
        const tagLinks = tags.map(tagId => ({
          project_id: project.id,
          tag_id: tagId,
        }))

        const { error: tagError } = await supabase
          .from('project_tags')
          .insert(tagLinks)

        if (tagError) throw new Error(tagError.message)
      }

      return project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, title, description, status, tags, githubUrl, projectUrl, projectUrlLabel }) => {
      // Update project
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title,
          description,
          status,
          github_url: githubUrl || null,
          project_url: projectUrl || null,
          project_url_label: projectUrlLabel || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (projectError) throw new Error(projectError.message)

      const { data: existingTagRows, error: existingTagsError } = await supabase
        .from('project_tags')
        .select('tag_id')
        .eq('project_id', id)

      if (existingTagsError) throw new Error(existingTagsError.message)

      const existingTagIds = [...new Set(existingTagRows.map(row => row.tag_id).filter(Boolean))]
      const nextTagIds = [...new Set((tags || []).filter(Boolean))]
      const tagIdsToRemove = existingTagIds.filter(tagId => !nextTagIds.includes(tagId))
      const tagIdsToAdd = nextTagIds.filter(tagId => !existingTagIds.includes(tagId))

      if (tagIdsToRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from('project_tags')
          .delete()
          .eq('project_id', id)
          .in('tag_id', tagIdsToRemove)

        if (deleteError) throw new Error(deleteError.message)
      }

      if (tagIdsToAdd.length > 0) {
        const tagLinks = tagIdsToAdd.map(tagId => ({
          project_id: id,
          tag_id: tagId,
        }))

        const { error: tagError } = await supabase
          .from('project_tags')
          .insert(tagLinks)

        if (tagError) throw new Error(tagError.message)
      }
    },
    onSuccess: async (_, variables) => {
      // Refetch immediately so the next page sees fresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['project', variables.id] }),
      ])
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id) => {
      // Delete tags first (foreign key)
      await supabase
        .from('project_tags')
        .delete()
        .eq('project_id', id)

      // Delete notes
      await supabase
        .from('notes')
        .delete()
        .eq('project_id', id)

      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useAddNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, authorName, content }) => {
      const { error } = await supabase
        .from('notes')
        .insert([{
          project_id: projectId,
          author_name: authorName,
          content,
        }])

      if (error) throw new Error(error.message)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

const PROJECT_IMAGES_BUCKET = 'project-images'

export function useProjectImages(projectId) {
  return useQuery({
    queryKey: ['projectImages', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_images')
        .select('id, project_id, storage_path, url, caption, sort_order, created_at')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!projectId,
  })
}

export function useUploadProjectImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ projectId, file }) => {
      if (!file) throw new Error('No file selected')
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed')
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image must be smaller than 10 MB')
      }

      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      const safeExt = /^[a-z0-9]+$/.test(ext) ? ext : 'png'
      const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`

      const { error: uploadError } = await supabase
        .storage
        .from(PROJECT_IMAGES_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase
        .storage
        .from(PROJECT_IMAGES_BUCKET)
        .getPublicUrl(path)

      const { error: insertError } = await supabase
        .from('project_images')
        .insert([{
          project_id: projectId,
          storage_path: path,
          url: urlData.publicUrl,
        }])

      if (insertError) {
        // best-effort cleanup if DB insert fails
        await supabase.storage.from(PROJECT_IMAGES_BUCKET).remove([path])
        throw new Error(insertError.message)
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', variables.projectId] })
    },
  })
}

export function useDeleteProjectImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ image }) => {
      const { error: dbError } = await supabase
        .from('project_images')
        .delete()
        .eq('id', image.id)

      if (dbError) throw new Error(dbError.message)

      if (image.storage_path) {
        await supabase
          .storage
          .from(PROJECT_IMAGES_BUCKET)
          .remove([image.storage_path])
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectImages', variables.image.project_id] })
    },
  })
}

// ---------- Ideas ----------

export function useIdeas() {
  return useQuery({
    queryKey: ['ideas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw new Error(error.message)
      return data
    },
  })
}

export function useNewIdeaCount() {
  return useQuery({
    queryKey: ['ideas', 'newCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('ideas')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new')
      if (error) throw new Error(error.message)
      return count || 0
    },
    refetchInterval: 60_000,
  })
}

export function useCreateIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (idea) => {
      const { error } = await supabase
        .from('ideas')
        .insert([{
          title: idea.title,
          brands: idea.brands || [],
          description: idea.description,
          use_case: idea.useCase,
          value_prop: idea.valueProp,
          submitter_name: idea.submitterName,
          submitter_email: idea.submitterEmail,
        }])
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}

export function useUpdateIdeaStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase
        .from('ideas')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}

export function useDeleteIdea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('ideas').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
    },
  })
}

export function useConvertIdeaToProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ idea }) => {
      // Get or create user from submitter info
      let { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', idea.submitter_email)
        .single()

      if (userError) {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{ name: idea.submitter_name, email: idea.submitter_email }])
          .select('id')
          .single()
        if (createError) throw new Error(createError.message)
        user = newUser
      }

      // Build a rich description from the idea fields
      const brandLine = idea.brands && idea.brands.length
        ? `<p><strong>Brands:</strong> ${idea.brands.join(', ')}</p>`
        : ''
      const description = [
        brandLine,
        `<h3>Description</h3><p>${escapeHtml(idea.description)}</p>`,
        `<h3>Use case</h3><p>${escapeHtml(idea.use_case)}</p>`,
        `<h3>Value prop</h3><p>${escapeHtml(idea.value_prop)}</p>`,
      ].join('\n')

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: idea.title,
          description,
          status: 'draft',
          owner_id: user.id,
        }])
        .select('id')
        .single()
      if (projectError) throw new Error(projectError.message)

      const { error: updateError } = await supabase
        .from('ideas')
        .update({
          status: 'converted',
          converted_project_id: project.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', idea.id)
      if (updateError) throw new Error(updateError.message)

      return project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ideas'] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}
