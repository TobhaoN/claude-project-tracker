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
