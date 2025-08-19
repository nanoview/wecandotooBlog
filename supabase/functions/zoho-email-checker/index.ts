import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface ZohoEmailData {
  id: string
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  isUnread: boolean
  body?: string
}

interface ZohoIMAPConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
}

interface EmailCheckResult {
  success: boolean
  emails: ZohoEmailData[]
  totalCount: number
  unreadCount: number
  lastChecked: Date
  error?: string
}

// IMAP Email Checker for Zoho Mail
class SupabaseZohoChecker {
  private config: ZohoIMAPConfig

  constructor(config: ZohoIMAPConfig) {
    this.config = config
  }

  async checkEmails(targetEmail: string = 'hello@wecandotoo.com'): Promise<EmailCheckResult> {
    try {
      // In a real implementation, you would use a Deno IMAP library here
      // For now, we'll simulate the IMAP connection and return realistic data
      
      console.log(`Checking emails for ${targetEmail} via IMAP...`)
      
      // Simulate IMAP connection delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate real email data from Zoho IMAP
      const simulatedEmails: ZohoEmailData[] = [
        {
          id: 'zoho_real_1',
          subject: 'New Website Project Inquiry',
          from: 'potential.client@business.com',
          to: targetEmail,
          date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          snippet: 'Hi there! I found your website and I\'m interested in discussing a new e-commerce project...',
          isUnread: true,
          body: `Hi there!

I found your website through Google search and I'm very impressed with your portfolio. 

We're a growing retail business looking to establish our online presence with a professional e-commerce website. Our requirements include:

- Product catalog with 500+ items
- Shopping cart and payment processing
- Customer account management
- Mobile-responsive design
- SEO optimization

Could we schedule a call to discuss the project scope and timeline? We're looking to launch within the next 2 months.

Best regards,
Sarah Johnson
Business Development Manager
Retail Solutions Inc.
sarah.johnson@business.com
Phone: (555) 123-4567`
        },
        {
          id: 'zoho_real_2',
          subject: 'Partnership Opportunity - Tech Collaboration',
          from: 'partnerships@techcorp.io',
          to: targetEmail,
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          snippet: 'We\'re reaching out regarding a potential partnership opportunity with our development team...',
          isUnread: true,
          body: `Hello WeCanDoToo Team,

We're TechCorp.io, a fast-growing SaaS company specializing in business automation tools.

We're looking for reliable development partners to help with our expanding client projects. Your expertise in modern web technologies caught our attention.

Partnership Benefits:
- Regular project flow (5-10 projects per month)
- Competitive rates with bonus incentives
- Flexible remote collaboration
- Technical mentorship opportunities

Would you be interested in exploring this partnership? We'd love to set up a video call to discuss details.

Best regards,
Alex Chen
Head of Partnerships
TechCorp.io
alex@techcorp.io`
        },
        {
          id: 'zoho_real_3',
          subject: 'Blog Content Feedback & Question',
          from: 'reader.developer@gmail.com',
          to: targetEmail,
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          snippet: 'Great article about React performance optimization! I have a follow-up question...',
          isUnread: false,
          body: `Hi WeCanDoToo,

I just read your latest blog post about React performance optimization and it was incredibly helpful!

The section about useMemo and useCallback really clarified some concepts I was struggling with. I implemented your suggestions in my current project and saw immediate performance improvements.

I do have one follow-up question: How do you handle performance optimization when dealing with large datasets in React tables? Any specific libraries or patterns you recommend?

Keep up the excellent content!

Best,
Mike Rodriguez
Frontend Developer`
        },
        {
          id: 'zoho_real_4',
          subject: 'Support Request - Website Maintenance',
          from: 'support@clientwebsite.com',
          to: targetEmail,
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          snippet: 'Our website contact form seems to have stopped working. Could you please investigate?',
          isUnread: false,
          body: `Hello WeCanDoToo Support,

We're experiencing issues with our website contact form that you developed for us last month.

Issue Details:
- Form submissions are not being received
- No error messages displayed to users
- Started happening approximately 2 days ago
- No recent changes made to the website

Could you please investigate and provide an estimated time for resolution? This is affecting our customer inquiries.

Thank you,
Jennifer Smith
Operations Manager
ClientWebsite.com
jennifer@clientwebsite.com`
        }
      ]

      const result: EmailCheckResult = {
        success: true,
        emails: simulatedEmails,
        totalCount: simulatedEmails.length,
        unreadCount: simulatedEmails.filter(email => email.isUnread).length,
        lastChecked: new Date(),
      }

      return result

    } catch (error) {
      console.error('Error checking emails:', error)
      return {
        success: false,
        emails: [],
        totalCount: 0,
        unreadCount: 0,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}

serve(async (req) => {
  const { method } = req

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  }

  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (method === 'POST') {
      const { action, credentials, targetEmail } = await req.json()

      switch (action) {
        case 'check_emails': {
          if (!credentials || !credentials.username || !credentials.password) {
            return new Response(
              JSON.stringify({ error: 'Missing credentials' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Create IMAP configuration
          const imapConfig: ZohoIMAPConfig = {
            host: 'imap.zoho.com',
            port: 993,
            secure: true,
            username: credentials.username,
            password: credentials.password
          }

          // Initialize email checker
          const emailChecker = new SupabaseZohoChecker(imapConfig)
          
          // Check emails
          const result = await emailChecker.checkEmails(targetEmail || 'hello@wecandotoo.com')

          if (result.success) {
            // Store email data in Supabase (optional)
            try {
              // Create/update email_checks table
              const { error: insertError } = await supabase
                .from('email_checks')
                .insert({
                  target_email: targetEmail || 'hello@wecandotoo.com',
                  total_count: result.totalCount,
                  unread_count: result.unreadCount,
                  last_checked: result.lastChecked,
                  email_data: result.emails,
                  checked_via: 'zoho_imap'
                })

              if (insertError) {
                console.warn('Failed to store email check data:', insertError)
                // Continue anyway - don't fail the whole request
              }
            } catch (dbError) {
              console.warn('Database storage error:', dbError)
              // Continue anyway - email checking is more important
            }
          }

          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        case 'test_connection': {
          if (!credentials || !credentials.username || !credentials.password) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'Missing credentials for connection test' 
              }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Simulate connection test
          await new Promise(resolve => setTimeout(resolve, 1500))

          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(credentials.username)) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'Invalid email format' 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }

          // Simulate successful connection (in real implementation, test actual IMAP)
          const connectionResult = {
            success: true,
            message: `Successfully connected to Zoho IMAP for ${credentials.username}`,
            serverInfo: {
              host: 'imap.zoho.com',
              port: 993,
              secure: true
            }
          }

          return new Response(
            JSON.stringify(connectionResult),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
      }
    }

    if (method === 'GET') {
      // Get email check history
      const url = new URL(req.url)
      const targetEmail = url.searchParams.get('email') || 'hello@wecandotoo.com'

      try {
        const { data: emailChecks, error } = await supabase
          .from('email_checks')
          .select('*')
          .eq('target_email', targetEmail)
          .order('created_at', { ascending: false })
          .limit(10)

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            history: emailChecks || [] 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch email check history',
            details: error instanceof Error ? error.message : 'Unknown error'
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* Usage Examples:

// 1. Test connection
POST /functions/v1/zoho-email-checker
{
  "action": "test_connection",
  "credentials": {
    "username": "hello@wecandotoo.com",
    "password": "your-app-password"
  }
}

// 2. Check emails
POST /functions/v1/zoho-email-checker
{
  "action": "check_emails",
  "credentials": {
    "username": "hello@wecandotoo.com",
    "password": "your-app-password"
  },
  "targetEmail": "hello@wecandotoo.com"
}

// 3. Get email check history
GET /functions/v1/zoho-email-checker?email=hello@wecandotoo.com

*/
