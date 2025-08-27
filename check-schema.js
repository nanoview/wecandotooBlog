// Simple Node.js script to check database schema (no secrets in source)
import pkg from 'pg';
const { Client } = pkg;

// Read DATABASE_URL from environment. Do NOT hardcode credentials here.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Export it in your environment or .env (not committed).');
  process.exit(1);
}

const client = new Client({ connectionString });

async function checkSchema() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check blog_posts table structure
    const blogPostsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'blog_posts' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    
    const result = await client.query(blogPostsQuery);
    console.log('\n📋 blog_posts table columns:');
    console.table(result.rows);

    // Check current views with SECURITY DEFINER
    const viewsQuery = `
      SELECT viewname, 
             CASE WHEN definition ILIKE '%SECURITY DEFINER%' THEN 'YES' ELSE 'NO' END as has_security_definer
      FROM pg_views 
      WHERE viewname IN ('seo_optimization_dashboard', 'posts_needing_seo_optimization', 
                         'post_impressions_with_posts', 'latest_email_checks', 'seo_dashboard')
      ORDER BY viewname;
    `;
    
    const viewsResult = await client.query(viewsQuery);
    console.log('\n🔒 Views with SECURITY DEFINER:');
    console.table(viewsResult.rows);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

checkSchema();
