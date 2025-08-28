import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials (get these from your Supabase dashboard)
const supabaseUrl = 'https://rowcloxlszwnowlggqon.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIzNjg1OTYsImV4cCI6MjAzNzk0NDU5Nn0.v62YxIhBGGmYd2K3gCmqPJJIwY7EpMuqJBuaLRJQd0A' // Your anon key

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
