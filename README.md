# Stellar Content Stream

A modern blog platform with advanced content management and monetization features.

## Features

- 📝 **Advanced Block Editor** - Rich content creation with multiple block types
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS  
- 🔐 **Authentication** - Secure user management with Supabase
- 📊 **Google Analytics** - Track visitor engagement and content performance
- 💰 **Google AdSense** - Monetize your content with strategic ad placements
- 🔍 **SEO Optimized** - Google Site Verification and meta tag support
- 📱 **Responsive Design** - Works beautifully on all devices

## Google Site Kit Integration

This platform features a **complete Google OAuth integration** that allows administrators to connect their actual Google accounts and fetch real-time data from AdSense, Analytics, and Search Console directly within the admin panel.

### 🔐 **OAuth Setup (Required for Real Data)**

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the required APIs:
     - Google AdSense Management API
     - Google Analytics Reporting API  
     - Google Search Console API

2. **Configure OAuth 2.0 Credentials**:
   - Go to APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set Application type to "Web application"
   - Add authorized origins: `http://localhost:5173` (development)
   - Add redirect URIs: `http://localhost:5173/admin`
   - Copy your Client ID and Client Secret

3. **Environment Configuration**:
   ```env
   VITE_GOOGLE_OAUTH_CLIENT_ID=your_client_id.apps.googleusercontent.com
   VITE_GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
   VITE_GOOGLE_OAUTH_REDIRECT_URI=http://localhost:5173/admin
   ```

### 🚀 **Quick Setup via Admin Panel**

1. **Access Admin Panel**: Navigate to `/admin` and log in as an administrator
2. **Open Google Site Kit**: Click on the "Google Site Kit" tab
3. **Connect Account**: Click "Connect with Google" to start OAuth flow
4. **Authorize Permissions**: Grant access to AdSense, Analytics, and Search Console
5. **View Real Data**: Access live revenue, traffic, and performance metrics

### 📊 **Real-Time Data Access**

Once connected, the admin panel provides:

**Live AdSense Data**:
- Current revenue and earnings
- Page impressions and click-through rates
- Performance metrics from your actual AdSense account

**Google Analytics Integration**:
- Real-time page views and sessions
- Bounce rate and user engagement
- Traffic analytics from your GA4 property

**Search Console Insights**:
- Search performance data
- Site verification status
- SEO metrics and click data

### 🔧 **Admin Panel Features**

The **Google Site Kit** dashboard provides:

🎯 **One-Click Connection**:
- Secure OAuth flow directly in admin panel
- Automatic token management and refresh
- Real-time connection status monitoring

� **Live Dashboards**:
- Revenue tracking with actual AdSense data
- Traffic analytics from Google Analytics
- Performance metrics updated automatically

⚙️ **Smart Configuration**:
- Visual setup guide for OAuth credentials
- Service connection diagnostics
- Direct links to Google service dashboards

🔒 **Secure Integration**:
- OAuth 2.0 with proper scopes
- Automatic token refresh
- Secure credential storage

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your environment variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Services Configuration
VITE_GOOGLE_ADSENSE_CLIENT_ID=ca-pub-0000000000000000
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_GOOGLE_SITE_VERIFICATION=your_verification_code

# Feature Flags (set to 'true' to enable)
VITE_ENABLE_GOOGLE_ANALYTICS=true
VITE_ENABLE_GOOGLE_ADSENSE=true
VITE_ENABLE_GOOGLE_SITE_VERIFICATION=true
```

## Project info

**URL**: https://lovable.dev/projects/8bc468aa-39d7-47a1-8ffe-5445ee188480

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8bc468aa-39d7-47a1-8ffe-5445ee188480) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8bc468aa-39d7-47a1-8ffe-5445ee188480) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
