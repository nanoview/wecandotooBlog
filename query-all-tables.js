import { createClient } from '@supabase/supabase-js'

import { createClient } from '@supabase/supabase-js'

// ⚠️ SECURITY: Load from environment variables - never hardcode tokens!
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your_supabase_url_here'
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here'

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_') || supabaseKey.includes('your_')) {
  console.error('❌ Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function queryAllTables() {
  console.log('🔍 Querying all Supabase tables...\n')

  try {
    // Query user_roles
    console.log('📋 USER ROLES:')
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
    
    if (userRolesError) {
      console.log('❌ Error querying user_roles:', userRolesError.message)
    } else {
      console.log(`✅ Found ${userRoles.length} user roles`)
      userRoles.forEach(role => {
        console.log(`  - User: ${role.user_id}, Role: ${role.role}`)
      })
    }
    console.log('')

    // Query profiles
    console.log('👤 PROFILES:')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
    
    if (profilesError) {
      console.log('❌ Error querying profiles:', profilesError.message)
    } else {
      console.log(`✅ Found ${profiles.length} profiles`)
      profiles.forEach(profile => {
        console.log(`  - ${profile.username || 'No username'} (${profile.display_name || 'No display name'})`)
      })
    }
    console.log('')

    // Query blog_posts
    console.log('📝 BLOG POSTS:')
    const { data: blogPosts, error: blogPostsError } = await supabase
      .from('blog_posts')
      .select('id, title, status, author_id')
      .limit(5)
    
    if (blogPostsError) {
      console.log('❌ Error querying blog_posts:', blogPostsError.message)
    } else {
      console.log(`✅ Found ${blogPosts.length} blog posts (showing first 5)`)
      blogPosts.forEach(post => {
        console.log(`  - "${post.title}" (${post.status})`)
      })
    }
    console.log('')

    // Query contact_messages
    console.log('✉️ CONTACT MESSAGES:')
    const { data: contacts, error: contactsError } = await supabase
      .from('contact_messages')
      .select('*')
    
    if (contactsError) {
      console.log('❌ Error querying contact_messages:', contactsError.message)
    } else {
      console.log(`✅ Found ${contacts.length} contact messages`)
      contacts.forEach(contact => {
        console.log(`  - ${contact.first_name} ${contact.last_name}: ${contact.subject}`)
      })
    }
    console.log('')

    // Query comments
    console.log('💬 COMMENTS:')
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .limit(5)
    
    if (commentsError) {
      console.log('❌ Error querying comments:', commentsError.message)
    } else {
      console.log(`✅ Found ${comments.length} comments (showing first 5)`)
      comments.forEach(comment => {
        console.log(`  - "${comment.content.substring(0, 50)}..."`)
      })
    }

  } catch (error) {
    console.error('🚨 General error:', error)
  }
}

// Run the queries
queryAllTables()
