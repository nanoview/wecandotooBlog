# WeCanDoToo - Full-Stack Blog Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/your-username/wecandotoo)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Supabase](https://img.shields.io/badge/powered%20by-Supabase-green.svg)](https://supabase.com)
[![React](https://img.shields.io/badge/built%20with-React-blue.svg)](https://reactjs.org)

A modern, full-featured blog platform built with React, TypeScript, Vite, and Supabase. This platform includes comprehensive admin management, SEO optimization, email integration, Google Analytics, and much more.

## 🚀 Features

- 📝 **Content Management**: Rich text editor with SEO optimization
- 👥 **User Management**: Role-based access control (Admin, Editor, Viewer)
- 📊 **Analytics Integration**: Google Analytics, Search Console, and AdSense
- 📧 **Email System**: Contact forms, newsletters, and notifications via Zoho SMTP
- 🔍 **SEO Tools**: Automated SEO scoring, sitemap generation, and optimization
- 📱 **Responsive Design**: Modern UI with Tailwind CSS and Radix UI components
- 🔐 **Security**: Advanced authentication and authorization systems
- ⚡ **Performance**: Optimized builds with code splitting and lazy loading
- 🔄 **Real-time**: Live updates for blog posts and comments
- 🤖 **AI Integration**: AI-powered SEO optimization and content suggestions

## 📋 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or bun package manager
- Supabase account
- Zoho Mail account (for email services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/wecandotoo.git
   cd wecandotoo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Supabase locally**
   ```bash
   npx supabase start
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:8080` to see your application running!

## 📚 Documentation

For detailed setup and usage instructions, please refer to our comprehensive documentation:

### 📖 **[Installation Guide](INSTALLATION_GUIDE.md)**
Complete step-by-step installation and setup guide covering all aspects from prerequisites to deployment.

### ⚡ **[Edge Functions Guide](EDGE_FUNCTIONS_GUIDE.md)**
Detailed documentation for all Supabase Edge Functions including deployment, testing, and troubleshooting.

### 🗄️ **[Database Setup Guide](DATABASE_SETUP_GUIDE.md)**
Comprehensive database schema, migrations, Row Level Security (RLS) policies, and optimization guide.

### 🚀 **[Deployment Guide](DEPLOYMENT_GUIDE.md)**
Production deployment instructions for various hosting platforms including Vercel, Netlify, and custom servers.

### 🐛 **[Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)**
Common issues and their solutions, debugging tips, and performance optimization.

### 📡 **[API Documentation](API_DOCUMENTATION.md)**
Complete API reference for all endpoints, authentication, and integration examples.

## 🏗️ Project Structure

```
wecandotoo/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin panel components
│   │   ├── blog/           # Blog-related components
│   │   ├── ui/             # Reusable UI components
│   │   └── ...
│   ├── pages/              # Main page components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
├── supabase/
│   ├── functions/          # Edge functions
│   ├── migrations/         # Database migrations
│   └── config.toml         # Supabase configuration
├── public/                 # Static assets
└── docs/                   # Documentation files
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Edge Functions** - Serverless functions (Deno runtime)
- **Row Level Security (RLS)** - Database security

### Services
- **Zoho Mail** - SMTP email service
- **Google Analytics** - Website analytics
- **Google Search Console** - SEO insights
- **Google AdSense** - Monetization

## 🚦 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code

# Supabase
npm run supabase:serve   # Start functions locally
npm run supabase:deploy  # Deploy all functions
npm run supabase:list    # List deployed functions
npm run supabase:status  # Check project status

# Sync scripts (Windows PowerShell)
npm run sync:deploy      # Deploy all functions
npm run sync:serve       # Start local server
npm run sync:list        # List functions
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Configuration (Zoho SMTP)
ZOHO_SMTP_USER=hello@yourdomain.com
ZOHO_SMTP_PASS=your_zoho_app_password

# Google Services
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Site Configuration
VITE_SITE_URL=https://yourdomain.com
```

For a complete list of environment variables, see the [Installation Guide](INSTALLATION_GUIDE.md#environment-setup).

## 🎯 Key Features

### Admin Dashboard
- Modern icon-based panel layout
- User management with role-based access
- Content management with rich text editor
- Analytics dashboard with Google integration
- Contact message management
- SEO tools and optimization

### Blog System
- Rich text editor with markdown support
- SEO optimization with AI-powered suggestions
- Tag system and categorization
- Comment system with moderation
- Social sharing integration
- Automated sitemap generation

### Email Integration
- Contact form with Zoho SMTP
- Newsletter subscription management
- Professional email templates
- Auto-reply functionality
- Admin notifications

### Analytics & SEO
- Google Analytics integration
- Search Console data
- AI-powered SEO scoring
- Automated meta tag generation
- Performance tracking
- Visitor analytics

## 🔐 Security Features

- JWT-based authentication
- Row Level Security (RLS) policies
- Role-based access control
- Input sanitization and validation
- CORS protection
- Rate limiting
- Secure file uploads

## 🚀 Deployment

The platform can be deployed to various hosting services:

- **Vercel** (Recommended)
- **Netlify**
- **GitHub Pages**
- **Custom servers**

See the [Deployment Guide](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style
- Test on multiple browsers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
2. Search existing [GitHub Issues](https://github.com/your-username/wecandotoo/issues)
3. Create a new issue with detailed information
4. Join our [Discord Community](https://discord.gg/your-discord) for real-time help

## ☕ Support the Project

If you find this project helpful and want to support its development, consider buying me a coffee! Your support helps maintain and improve this open-source platform.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Support%20Development-orange?style=for-the-badge&logo=buy-me-a-coffee)](mailto:arif.js@gmail.com?subject=WeCanDoToo%20Support&body=Hi!%20I'd%20like%20to%20support%20the%20WeCanDoToo%20project.%20Please%20send%20me%20your%20PayPal%20details.)

**PayPal**: `arif.js@gmail.com`

Your contributions help:
- 🛠️ **Maintain the codebase** and fix bugs
- ✨ **Add new features** and improvements
- 📚 **Keep documentation** up-to-date
- 🆘 **Provide community support**
- 🚀 **Deploy demo instances** for testing

*Every coffee counts and is greatly appreciated! Thank you for your support! 🙏*

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - For the amazing backend-as-a-service platform
- [Vercel](https://vercel.com/) - For hosting and deployment solutions
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - For accessible UI components
- [React](https://reactjs.org/) - For the powerful UI library

## 📊 Project Status

- ✅ **Core Features**: Complete
- ✅ **Admin Dashboard**: Complete
- ✅ **Email Integration**: Complete
- ✅ **SEO Tools**: Complete
- ✅ **Analytics**: Complete
- 🔄 **Documentation**: In Progress
- 🔄 **Testing**: In Progress
- ⏳ **Mobile App**: Planned

---

**Built with ❤️ by the WeCanDoToo Team**

*This project is actively maintained and continuously improved. Star ⭐ this repository if you find it useful!*
  
  ```sh
  brew install supabase/tap/supabase-beta
  brew link --overwrite supabase-beta
  ```
  
  To upgrade:

  ```sh
  brew upgrade supabase
  ```
</details>

<details>
  <summary><b>Windows</b></summary>

  Available via [Scoop](https://scoop.sh). To install:

  ```powershell
  scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
  scoop install supabase
  ```

  To upgrade:

  ```powershell
  scoop update supabase
  ```
</details>

<details>
  <summary><b>Linux</b></summary>

  Available via [Homebrew](https://brew.sh) and Linux packages.

  #### via Homebrew

  To install:

  ```sh
  brew install supabase/tap/supabase
  ```

  To upgrade:

  ```sh
  brew upgrade supabase
  ```

  #### via Linux packages

  Linux packages are provided in [Releases](https://github.com/supabase/cli/releases). To install, download the `.apk`/`.deb`/`.rpm`/`.pkg.tar.zst` file depending on your package manager and run the respective commands.

  ```sh
  sudo apk add --allow-untrusted <...>.apk
  ```

  ```sh
  sudo dpkg -i <...>.deb
  ```

  ```sh
  sudo rpm -i <...>.rpm
  ```

  ```sh
  sudo pacman -U <...>.pkg.tar.zst
  ```
</details>

<details>
  <summary><b>Other Platforms</b></summary>

  You can also install the CLI via [go modules](https://go.dev/ref/mod#go-install) without the help of package managers.

  ```sh
  go install github.com/supabase/cli@latest
  ```

  Add a symlink to the binary in `$PATH` for easier access:

  ```sh
  ln -s "$(go env GOPATH)/bin/cli" /usr/bin/supabase
  ```

  This works on other non-standard Linux distros.
</details>

<details>
  <summary><b>Community Maintained Packages</b></summary>

  Available via [pkgx](https://pkgx.sh/). Package script [here](https://github.com/pkgxdev/pantry/blob/main/projects/supabase.com/cli/package.yml).
  To install in your working directory:

  ```bash
  pkgx install supabase
  ```

  Available via [Nixpkgs](https://nixos.org/). Package script [here](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/tools/supabase-cli/default.nix).
</details>

### Run the CLI

```bash
supabase bootstrap
```

Or using npx:

```bash
npx supabase bootstrap
```

The bootstrap command will guide you through the process of setting up a Supabase project using one of the [starter](https://github.com/supabase-community/supabase-samples/blob/main/samples.json) templates.

## Docs

Command & config reference can be found [here](https://supabase.com/docs/reference/cli/about).

## Breaking changes

We follow semantic versioning for changes that directly impact CLI commands, flags, and configurations.

However, due to dependencies on other service images, we cannot guarantee that schema migrations, seed.sql, and generated types will always work for the same CLI major version. If you need such guarantees, we encourage you to pin a specific version of CLI in package.json.

## Developing

To run from source:

```sh
# Go >= 1.22
go run . help
```
