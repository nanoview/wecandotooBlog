// Simple Blog Post Creation Edge Function - Role-Based Access
// Only allows admins and editors to create posts
// No automatic SEO generation - manual generation available via dashboard

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SimplePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      title, 
      content, 
      excerpt, 
      category = 'Other',
      tags = [],
      status = 'draft' 
    }: SimplePostRequest = await req.json();

    // Validate required fields
    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    console.log(`📝 Creating blog post: ${title} (status: ${status})`);

    // Use the role-based creation function
    const { data: result, error: functionError } = await supabase.rpc(
      'create_simple_blog_post_role_based',
      {
        p_title: title,
        p_content: content,
        p_status: status,
        p_post_id: null  // Always null for new posts
      }
    );

    if (functionError) {
      console.error('❌ Function error:', functionError);
      throw functionError;
    }

    if (!result || result.length === 0) {
      console.error('❌ No result returned from function');
      throw new Error('Failed to create blog post - no data returned');
    }

    const postData = result[0]; // Function returns an array
    console.log(`✅ Created blog post: ${title} (ID: ${postData.id})`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Blog post created successfully',
        post: {
          id: postData.id,
          title: postData.title,
          slug: postData.slug,
          status: postData.status,
          content: postData.content,
          author_id: postData.author_id,
          created_at: postData.created_at,
          updated_at: postData.updated_at
        },
        note: 'SEO data not generated automatically. Use dashboard to generate SEO data.',
        dashboard_action: 'Click "Generate SEO" button in dashboard to create meta tags and keywords'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Error creating blog post:', error);
    
    // Check for permission errors
    if (error.message?.includes('Only administrators and editors')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Access denied: Only administrators and editors can create blog posts',
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You need admin or editor role to create blog posts'
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to create blog post',
        details: error.stack,
        code: error.code || 'UNKNOWN_ERROR'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
