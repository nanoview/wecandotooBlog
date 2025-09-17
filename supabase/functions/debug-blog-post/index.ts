import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

    console.log('🔍 Debug: Edge function started');
    console.log('🔍 Debug: Supabase URL:', supabaseUrl ? 'Present' : 'Missing');
    console.log('🔍 Debug: Service Key:', supabaseServiceKey ? 'Present' : 'Missing');

    // Get auth header for user identification
    const authHeader = req.headers.get('authorization');
    console.log('🔍 Debug: Auth header:', authHeader ? 'Present' : 'Missing');

    const requestBody = await req.json();
    console.log('🔍 Debug: Request body:', JSON.stringify(requestBody, null, 2));

    const { title, content, status = 'draft' } = requestBody;

    // Validate required fields
    if (!title || !content) {
      console.log('❌ Debug: Missing required fields');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Title and content are required',
          debug: { title: !!title, content: !!content }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log('🔍 Debug: About to check if function exists...');

    // First, check if our function exists
    const { data: functions, error: fnCheckError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_name', 'create_simple_blog_post_role_based');

    console.log('🔍 Debug: Function check result:', { functions, fnCheckError });

    // Check if user_roles table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'user_roles');

    console.log('🔍 Debug: User roles table check:', { tables, tableError });

    // Try to call the function
    console.log('🔍 Debug: Calling create_simple_blog_post_role_based...');
    
    const { data: result, error: functionError } = await supabase.rpc(
      'create_simple_blog_post_role_based',
      {
        p_title: title,
        p_content: content,
        p_status: status,
        p_post_id: null
      }
    );

    console.log('🔍 Debug: Function result:', { result, functionError });

    if (functionError) {
      console.error('❌ Debug: Function error details:', JSON.stringify(functionError, null, 2));
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database function error',
          details: functionError,
          debug_info: {
            function_name: 'create_simple_blog_post_role_based',
            parameters: { p_title: title, p_content: content, p_status: status, p_post_id: null },
            function_exists: !!functions,
            user_roles_table_exists: !!tables
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    if (!result || result.length === 0) {
      console.log('❌ Debug: No result returned');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No data returned from function',
          debug_info: {
            result: result,
            result_type: typeof result,
            result_length: result?.length
          }
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const postData = result[0];
    console.log('✅ Debug: Success! Post created:', postData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Blog post created successfully',
        post: postData,
        debug_info: {
          function_called: 'create_simple_blog_post_role_based',
          parameters_sent: { p_title: title, p_content: content, p_status: status },
          result_received: true
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Debug: Catch block error:', error);
    console.error('❌ Debug: Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        debug_info: {
          error_type: typeof error,
          error_name: error.name,
          error_code: error.code,
          error_details: error.details,
          error_hint: error.hint,
          full_error: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
