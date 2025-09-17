// Write Page Component - Direct Database Blog System
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  PenTool as PenIcon, 
  Save, 
  Send, 
  X, 
  FileText, 
  Loader2, 
  Shield, 
  User 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createBlogPost } from '@/services/blogService'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'

interface Draft {
  id: string
  title: string
  content: string
  category: string
  tags: string
  excerpt: string
  slug: string
  authorName: string
  createdAt: string
  updatedAt: string
}

const Write: React.FC = () => {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [slug, setSlug] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [userRoleData, setUserRoleData] = useState<{role: string} | null>(null)
  const [roleLoading, setRoleLoading] = useState(true)
  
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  // Check if user has permission to post
  const hasPostingPermission = userRoleData?.role === 'admin' || userRoleData?.role === 'editor'

  // Function to check user role using direct database call
  const checkUserRole = async () => {
    if (!user) {
      setRoleLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.rpc('get_user_role')
      
      if (error) {
        console.error('Error checking user role:', error)
        setUserRoleData(null)
      } else {
        setUserRoleData(data)
      }
    } catch (error) {
      console.error('Error checking user role:', error)
      setUserRoleData(null)
    } finally {
      setRoleLoading(false)
    }
  }

  // Check user role on component mount and user change
  useEffect(() => {
    checkUserRole()
  }, [user])

  useEffect(() => {
    // Only proceed if role checking is complete
    if (roleLoading) {
      return
    }

    // If user is not logged in, redirect to auth
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the writing page.",
        variant: "destructive"
      })
      navigate('/auth')
      return
    }

    // Check if user has posting permissions
    if (!hasPostingPermission) {
      toast({
        title: "Access Denied", 
        description: `You need admin or editor privileges to access the writing page. Your current role: ${userRoleData?.role || 'none'}. Please contact an administrator to request access.`,
        variant: "destructive"
      })
      navigate('/')
      return
    }
    
    // Load drafts if user has permission
    if (hasPostingPermission) {
      loadDrafts()
    }
  }, [user, hasPostingPermission, roleLoading, userRoleData, navigate, toast])

  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem('blogDrafts')
      if (savedDrafts) {
        setDrafts(JSON.parse(savedDrafts))
      }
    } catch (error) {
      console.error('Error loading drafts:', error)
    }
  }

  const saveDraft = () => {
    if (!title.trim() && !content.trim()) return

    const draft: Draft = {
      id: Date.now().toString(),
      title: title || 'Untitled Draft',
      content,
      category,
      tags,
      excerpt,
      slug,
      authorName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedDrafts = [draft, ...drafts]
    setDrafts(updatedDrafts)
    localStorage.setItem('blogDrafts', JSON.stringify(updatedDrafts))

    toast({
      title: "Draft Saved",
      description: "Your post has been saved as a draft."
    })
  }

  const loadDraft = (draft: Draft) => {
    setTitle(draft.title)
    setContent(draft.content)
    setCategory(draft.category)
    setTags(draft.tags)
    setExcerpt(draft.excerpt)
    setSlug(draft.slug)
    setAuthorName(draft.authorName)
    
    toast({
      title: "Draft Loaded",
      description: "Draft has been loaded into the editor."
    })
  }

  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== draftId)
    setDrafts(updatedDrafts)
    localStorage.setItem('blogDrafts', JSON.stringify(updatedDrafts))
    
    toast({
      title: "Draft Deleted",
      description: "Draft has been removed."
    })
  }

  const clearForm = () => {
    setTitle('')
    setContent('')
    setCategory('')
    setTags('')
    setExcerpt('')
    setSlug('')
    setAuthorName('')
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in at least the title and content.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const postData = {
        title,
        content,
        category: category || 'General',
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        excerpt: excerpt || content.substring(0, 150) + '...',
        slug: slug || generateSlug(title),
        author_name: authorName || user?.email?.split('@')[0] || 'Anonymous',
        status: 'published' as const
      }

      const result = await createBlogPost(postData)
      
      if (result) {
        toast({
          title: "Success!",
          description: "Your blog post has been created successfully."
        })
        clearForm()
      } else {
        throw new Error('Failed to create post')
      }
    } catch (error: any) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create blog post. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading state while checking role
  if (roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Checking permissions...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render the form if user doesn't have permission
  if (!hasPostingPermission) {
    return null // useEffect will handle navigation
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PenIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-800">Write New Post</h1>
              </div>
              <div className="flex items-center gap-2">
                {userRoleData?.role === 'admin' && (
                  <div className="flex items-center gap-1 text-purple-600 bg-purple-100 px-3 py-1 rounded-full text-sm">
                    <Shield className="h-4 w-4" />
                    Admin
                  </div>
                )}
                {userRoleData?.role === 'editor' && (
                  <div className="flex items-center gap-1 text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                    <User className="h-4 w-4" />
                    Editor
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter your blog post title..."
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="url-friendly-slug"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generated from title if left empty
                </p>
              </div>

              {/* Category and Author */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Technology, Business"
                  />
                </div>
                <div>
                  <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-2">
                    Author Name
                  </label>
                  <Input
                    id="authorName"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Author name (optional)"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate tags with commas
                </p>
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief description of your post..."
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generated from content if left empty
                </p>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post content here..."
                  rows={15}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Publish Post
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={saveDraft}
                  disabled={isSubmitting}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearForm}
                  disabled={isSubmitting}
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Form
                </Button>
              </div>
            </form>
          </div>

          {/* Drafts Section */}
          {drafts.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Saved Drafts ({drafts.length})
              </h2>
              <div className="space-y-3">
                {drafts.map((draft) => (
                  <div key={draft.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{draft.title}</h3>
                      <p className="text-sm text-gray-500">
                        Saved {new Date(draft.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => loadDraft(draft)}
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteDraft(draft.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Write;
