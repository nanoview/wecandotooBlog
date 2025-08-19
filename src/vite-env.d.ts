/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ZOHO_CLIENT_ID: string
  readonly VITE_ZOHO_CLIENT_SECRET: string
  readonly VITE_ZOHO_REDIRECT_URI: string
  readonly VITE_EMAIL_CHECK_METHOD: string
  readonly VITE_GMAIL_CLIENT_ID: string
  readonly VITE_GMAIL_CLIENT_SECRET: string
  readonly VITE_IMAP_HOST: string
  readonly VITE_IMAP_PORT: string
  readonly VITE_IMAP_USERNAME: string
  readonly VITE_IMAP_PASSWORD: string
  readonly VITE_WEBHOOK_URL: string
  readonly VITE_WEBHOOK_API_KEY: string
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
