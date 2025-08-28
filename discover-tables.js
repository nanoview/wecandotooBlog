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

// List of tables we know exist in your schema
const knownTables = [
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

async function discoverAllTables() {
  console.log('🔍 Discovering all tables in Supabase database...\n')

  let accessibleTables = 0
  let restrictedTables = 0
  let totalTables = 0

  for (const table of knownTables) {
    totalTables++
    try {
      console.log(`📋 Testing table: ${table}`)
      
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`  ❌ Restricted/Error: ${error.message}`)
        restrictedTables++
      } else {
        console.log(`  ✅ Accessible: ${count} records`)
        accessibleTables++
        
        // Get sample data structure
        const { data: sample } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (sample && sample.length > 0) {
          const columns = Object.keys(sample[0])
          console.log(`  📊 Columns (${columns.length}): ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}`)
        } else if (count === 0) {
          console.log(`  📊 Table exists but is empty`)
        }
      }
    } catch (err) {
      console.log(`  🚨 Exception: ${err.message}`)
      restrictedTables++
    }
    console.log('')
  }

  // Summary
  console.log('📈 SUMMARY:')
  console.log(`  🗃️  Total tables tested: ${totalTables}`)
  console.log(`  ✅ Accessible tables: ${accessibleTables}`)
  console.log(`  ❌ Restricted tables: ${restrictedTables}`)
  console.log(`  📊 Success rate: ${Math.round((accessibleTables/totalTables)*100)}%`)

  // List accessible tables
  console.log('\n🔓 ACCESSIBLE TABLES:')
  for (const table of knownTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`  ✅ ${table}`)
      }
    } catch (err) {
      // Skip restricted tables
    }
  }

  console.log('\n🔒 RESTRICTED TABLES (likely due to RLS policies):')
  for (const table of knownTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`  ❌ ${table} - ${error.message}`)
      }
    } catch (err) {
      console.log(`  ❌ ${table} - ${err.message}`)
    }
  }
}

discoverAllTables().catch(console.error)
