// Generate SEO Data Edge Function - For Dashboard Use
// Allows admins and editors to manually generate SEO data for blog posts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface GenerateSEORequest {
  post_id: string;
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

    const { post_id }: GenerateSEORequest = await req.json();

    // Validate required fields
    if (!post_id) {
      throw new Error('Post ID is required');
    }

    console.log(`🎯 Generating SEO data for post: ${post_id}`);

    // Use the SEO generation function
    const { data: result, error: functionError } = await supabase.rpc(
      'generate_seo_for_post',
      {
        post_id_param: post_id
      }
    );

    if (functionError) {
      console.error('❌ SEO generation function error:', functionError);
      throw functionError;
    }

    if (!result?.success) {
      console.error('❌ SEO generation function returned error:', result?.error);
      throw new Error(result?.error || 'Failed to generate SEO data');
    }

    console.log(`✅ Generated SEO data for post: ${post_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SEO data generated successfully',
        data: {
          post_id: result.post_id,
          meta_title: result.meta_title,
          meta_description: result.meta_description,
          keywords: result.keywords,
          generated_by: result.generated_by,
          timestamp: new Date().toISOString(),
          action: 'seo_generated'
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Error generating SEO data:', error);
    
    // Check for permission errors
    if (error.message?.includes('Only administrators and editors')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Access denied: Only administrators and editors can generate SEO data',
          code: 'INSUFFICIENT_PERMISSIONS',
          details: 'You need admin or editor role to generate SEO data'
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }

    // Check for post not found errors
    if (error.message?.includes('Blog post not found')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Blog post not found',
          code: 'POST_NOT_FOUND',
          details: 'The specified blog post does not exist'
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate SEO data',
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
