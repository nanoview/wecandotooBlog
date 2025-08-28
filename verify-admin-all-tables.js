import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const allTables = [
  'user_roles',
  'profiles', 
  'blog_posts',
  'contact_messages',
  'comments',
  'newsletter_subscribers',
  'subscriptions',
  'google_site_kit_config',
  'google_analytics_data',
  'google_adsense_data',
  'google_search_console_data',
  'visitor_tracking',
  'page_views',
  'user_sessions'
]

async function verifyAdminAccess() {
  console.log('🔐 Verifying admin access to all tables...\n')

  let successCount = 0
  let failCount = 0

  // Check admin status first
  console.log('👤 ADMIN STATUS CHECK:')
  try {
    const { data: adminCheck } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .eq('role', 'admin')
    
    console.log(`  ✅ Found ${adminCheck?.length || 0} admin users`)
    if (adminCheck && adminCheck.length > 0) {
      console.log(`  👑 Admin users: ${adminCheck.map(a => a.user_id).join(', ')}`)
    }
  } catch (err) {
    console.log(`  ❌ Error checking admin status: ${err.message}`)
  }
  console.log('')

  // Test each table
  console.log('📊 TABLE ACCESS TEST:')
  for (const table of allTables) {
    try {
      // Test SELECT access
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1)
      
      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`)
        failCount++
      } else {
        console.log(`  ✅ ${table}: ${count} records accessible`)
        successCount++
        
        // Show sample data structure if available
        if (data && data.length > 0) {
          const columns = Object.keys(data[0])
          console.log(`     📋 Columns: ${columns.slice(0, 3).join(', ')}${columns.length > 3 ? '...' : ''}`)
        }
      }
    } catch (err) {
      console.log(`  🚨 ${table}: Exception - ${err.message}`)
      failCount++
    }
  }

  console.log('')
  console.log('📈 FINAL RESULTS:')
  console.log(`  ✅ Accessible tables: ${successCount}/${allTables.length}`)
  console.log(`  ❌ Restricted tables: ${failCount}/${allTables.length}`)
  console.log(`  📊 Success rate: ${Math.round((successCount/allTables.length)*100)}%`)

  if (successCount === allTables.length) {
    console.log('\n🎉 SUCCESS: Admin has full access to all tables!')
  } else if (successCount > failCount) {
    console.log('\n⚠️  PARTIAL SUCCESS: Some tables still restricted')
  } else {
    console.log('\n❌ FAILED: Most tables still restricted - check admin role assignment')
  }

  // Test CRUD operations on a safe table
  console.log('\n🧪 CRUD OPERATIONS TEST (contact_messages):')
  try {
    // Test INSERT
    const { data: insertData, error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        first_name: 'Test',
        last_name: 'Admin',
        email: 'admin-test@test.com',
        subject: 'Admin Access Test',
        message: 'Testing admin access to contact messages'
      })
      .select()
    
    if (insertError) {
      console.log(`  ❌ INSERT failed: ${insertError.message}`)
    } else {
      console.log(`  ✅ INSERT successful`)
      
      // Test UPDATE
      const { error: updateError } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', insertData[0].id)
      
      if (updateError) {
        console.log(`  ❌ UPDATE failed: ${updateError.message}`)
      } else {
        console.log(`  ✅ UPDATE successful`)
      }
      
      // Test DELETE (cleanup)
      const { error: deleteError } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', insertData[0].id)
      
      if (deleteError) {
        console.log(`  ❌ DELETE failed: ${deleteError.message}`)
      } else {
        console.log(`  ✅ DELETE successful`)
      }
    }
  } catch (err) {
    console.log(`  🚨 CRUD test failed: ${err.message}`)
  }
}

verifyAdminAccess().catch(console.error)
