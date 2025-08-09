import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { baseUrl } = await req.json()
    
    if (!baseUrl) {
      return new Response(
        JSON.stringify({ error: 'baseUrl is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Static URLs
    const urls = [
      {
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8
      },
      {
        loc: `${baseUrl}/contact`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.7
      },
      {
        loc: `${baseUrl}/write`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6
      },
      {
        loc: `${baseUrl}/google-services`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.5
      }
    ]

    // Fetch published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, updated_at, created_at')
      .eq('published', true)
      .order('updated_at', { ascending: false })

    if (!error && posts) {
      posts.forEach(post => {
        const postUrl = post.slug ? `${baseUrl}/${post.slug}` : `${baseUrl}/post/${post.id}`
        urls.push({
          loc: postUrl,
          lastmod: post.updated_at || post.created_at,
          changefreq: 'weekly',
          priority: 0.9
        })
      })
    }

    // Generate XML sitemap
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`

    const xmlUrls = urls.map(url => {
      let urlXml = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`
      
      if (url.lastmod) {
        urlXml += `\n    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>`
      }
      
      if (url.changefreq) {
        urlXml += `\n    <changefreq>${url.changefreq}</changefreq>`
      }
      
      if (url.priority !== undefined) {
        urlXml += `\n    <priority>${url.priority.toFixed(1)}</priority>`
      }
      
      urlXml += '\n  </url>'
      return urlXml
    }).join('\n')

    const xmlFooter = '\n</urlset>'
    const sitemap = xmlHeader + '\n' + xmlUrls + xmlFooter

    return new Response(sitemap, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/xml',
        'Cache-Control': 'max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}