# Stellar Content Stream

A modern, full-featured content management system and blog platform built with React, TypeScript, Vite, and Supabase. Features advanced SEO automation, visitor analytics, and a comprehensive admin dashboard.

## 🌟 Live Demo

- **Main Website**: [wecandotoo.com](https://wecandotoo.com)
- **Portfolio**: [wecandotoo.com/ariful](https://wecandotoo.com/ariful)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Development](#development)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎯 Core Features
- **Modern Blog Platform**: Create, edit, and manage blog posts with a rich editor
- **SEO Optimization**: Automated SEO scoring, keyword suggestions, and meta tag generation
- **Visitor Analytics**: Real-time visitor tracking with IP geolocation and device detection
- **Admin Dashboard**: Comprehensive analytics, user management, and content control
- **Portfolio System**: Professional portfolio pages with project showcases
- **Newsletter Integration**: Email subscription and newsletter management
- **Social Sharing**: Built-in social media sharing capabilities
- **RSS Feed**: Automated RSS feed generation for blog posts

### 🔧 Technical Features
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **PWA Ready**: Progressive Web App capabilities
- **SEO Optimized**: Dynamic meta tags, structured data, and sitemap generation
- **Security**: Row-Level Security (RLS) policies and secure authentication
- **Real-time Updates**: Live data synchronization using Supabase real-time features
- **Edge Functions**: Server-side processing with Supabase Edge Functions
- **TypeScript**: Full type safety across the entire application

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **React Router** - Client-side routing
- **TanStack Query** - Server state management

### Backend
- **Supabase** - Backend as a Service
- **PostgreSQL** - Database
- **Row-Level Security** - Database security
- **Supabase Edge Functions** - Serverless functions
- **Real-time subscriptions** - Live data updates

### Services & Integrations
- **Google Analytics** - Web analytics
- **Google AdSense** - Monetization
- **Google Site Kit** - SEO and performance tracking
- **Email Services** - Newsletter and notifications
- **IP Geolocation** - Visitor tracking

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Supabase CLI** (optional, for local development)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/nanoview/stellar-content-stream.git
cd stellar-content-stream
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create environment files:

```bash
cp .env.example .env.local
```

### 4. Configure Environment Variables

Edit `.env.local` with your configuration:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Services (Optional)
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_GOOGLE_ADSENSE_CLIENT_ID=your_adsense_client_id
VITE_GOOGLE_SITE_VERIFICATION=your_site_verification_code

# Site Configuration
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME="Your Site Name"
```

## 🌐 Environment Setup

### Supabase Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy your project URL and anon key

2. **Database Setup**:
   - The application will automatically create required tables
   - Or run the SQL scripts in the `/supabase` folder

3. **Row-Level Security**:
   - RLS policies are automatically configured
   - Ensure authentication is enabled in Supabase

### Google Services Setup (Optional)

1. **Google Analytics**:
   - Create a GA4 property
   - Copy your Measurement ID

2. **Google AdSense**:
   - Apply for AdSense
   - Get your publisher ID

3. **Search Console**:
   - Verify your website
   - Get verification code

## 💻 Development

### Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Supabase (if using local development)
npm run supabase:start    # Start local Supabase
npm run supabase:stop     # Stop local Supabase
npm run supabase:reset    # Reset local database
```

## 🏗 Project Structure

```
stellar-content-stream/
├── public/                 # Static assets
│   ├── ariful-photo.jpg   # Portfolio photo
│   └── favicon.ico        # Site favicon
├── src/                   # Source code
│   ├── components/        # Reusable components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── admin/        # Admin-specific components
│   │   └── navigation/   # Navigation components
│   ├── pages/            # Page components
│   │   ├── Index.tsx     # Home page
│   │   ├── Admin.tsx     # Admin dashboard
│   │   └── ArifulPortfolio.tsx # Portfolio page
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   └── types/            # TypeScript type definitions
├── supabase/             # Supabase configuration
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
├── .env.example          # Environment variables template
├── package.json          # Project dependencies
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Configure Environment Variables**:
   - Add all environment variables in Vercel dashboard
   - Ensure production URLs are used

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Deploy to Netlify

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy dist folder** to Netlify

### Deploy to Other Platforms

The project can be deployed to any static hosting service:
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront
- DigitalOcean App Platform

## 📖 API Documentation

### Blog Posts API

```typescript
// Get all posts
GET /api/posts

// Get single post
GET /api/posts/:slug

// Create post (Admin only)
POST /api/posts

// Update post (Admin only)
PUT /api/posts/:id

// Delete post (Admin only)
DELETE /api/posts/:id
```

### Analytics API

```typescript
// Get visitor analytics
GET /api/analytics/visitors

// Get post impressions
GET /api/analytics/impressions

// Track visitor
POST /api/analytics/track
```

## 🔧 Configuration

### Admin Access

1. **Create Admin User**:
   - Sign up through the auth system
   - Run SQL to make user admin:
   ```sql
   UPDATE user_roles SET role = 'admin' WHERE user_id = 'your_user_id';
   ```

2. **Access Admin Dashboard**:
   - Visit `/admin` after logging in
   - All admin features will be available

### SEO Configuration

- **Meta Tags**: Automatically generated for each page
- **Structured Data**: JSON-LD schema markup
- **Sitemap**: Auto-generated at `/sitemap.xml`
- **RSS Feed**: Available at `/feed.xml`

## 🤝 Contributing

1. **Fork the repository**
2. **Create your feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add some amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ariful Islam**
- Portfolio: [wecandotoo.com/ariful](https://wecandotoo.com/ariful)
- LinkedIn: [linkedin.com/in/ariful-802is11](https://www.linkedin.com/in/ariful-802is11/)
- GitHub: [github.com/nanoview](https://github.com/nanoview)
- Email: arif.js@gmail.com

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend platform
- [Shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Vite](https://vitejs.dev) for the fast build tool

## 📞 Support

If you have any questions or need help with setup, feel free to reach out:

- **Email**: arif.js@gmail.com
- **WhatsApp**: [+358403781793](https://wa.me/358403781793)
- **Create an Issue**: [GitHub Issues](https://github.com/nanoview/stellar-content-stream/issues)

---

⭐ **Star this repository if you found it helpful!**
