# 🚀 Supabase Edge Functions Sync Guide

## Quick Start Commands

### Using NPM Scripts (Recommended)
```bash
# Deploy all functions
npm run sync

# List all functions
npm run sync:list

# Start local development server
npm run sync:serve

# Deploy specific function
npm run supabase:deploy google-oauth
```

### Using PowerShell Script (Windows)
```powershell
# Deploy all functions
.\sync-functions.ps1

# Deploy specific function
.\sync-functions.ps1 deploy send-confirmation-email

# List functions and status
.\sync-functions.ps1 list

# View function logs
.\sync-functions.ps1 logs google-oauth

# Start local server (requires Docker)
.\sync-functions.ps1 serve

# Check project status
.\sync-functions.ps1 status

# Show help
.\sync-functions.ps1 help
```

### Using Bash Script (Linux/Mac)
```bash
# Make script executable first
chmod +x sync-functions.sh

# Deploy all functions
./sync-functions.sh

# Deploy specific function
./sync-functions.sh deploy send-confirmation-email

# List functions
./sync-functions.sh list

# View logs
./sync-functions.sh logs google-oauth

# Start local server
./sync-functions.sh serve
```

### Using Direct Supabase CLI
```bash
# Deploy all with import map
npx supabase functions deploy --import-map ./import_map.json

# Deploy specific function
npx supabase functions deploy google-oauth --import-map ./import_map.json

# List all functions
npx supabase functions list

# View function logs
npx supabase functions logs google-oauth

# Start local development
npx supabase functions serve
```

## VS Code Integration

### Command Palette Tasks
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "Tasks: Run Task"
3. Select from available tasks:
   - 🚀 Deploy All Functions
   - 📋 List Functions
   - 🔧 Start Local Server
   - 📊 Check Status

### Terminal Integration
- Open VS Code terminal (`Ctrl+`` ` or `` Cmd+` ``)
- Run any of the npm scripts or PowerShell commands

## Available Edge Functions

| Function Name | Purpose |
|---------------|---------|
| `google-adsense` | Google AdSense integration |
| `google-analytics` | Google Analytics tracking |
| `google-oauth` | Google OAuth authentication |
| `google-search-console` | Search Console API |
| `send-confirmation-email` | Email confirmation service |

## Troubleshooting

### Common Issues

1. **Import Map Error**
   - Ensure `import_map.json` exists in root directory
   - Check import mappings are correct

2. **Deployment Failed**
   - Verify Supabase CLI is installed: `npx supabase --version`
   - Check project authentication: `npx supabase status`

3. **Function Not Found**
   - Verify function exists in `supabase/functions/` directory
   - Check function name spelling

4. **Local Server Issues**
   - Ensure Docker is running (for `serve` command)
   - Check port 54321 is available

### Getting Help

```bash
# Check CLI version
npx supabase --version

# View project info
npx supabase status

# Get help for specific commands
npx supabase functions --help
npx supabase functions deploy --help
```

## Project URLs

- **Dashboard**: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon
- **Functions**: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/functions
- **Local Development**: http://localhost:54321 (when serving locally)

## Next Steps

1. **Test Functions**: Use the dashboard or local server to test functions
2. **Monitor Logs**: Regularly check function logs for errors
3. **Environment Variables**: Set up any required environment variables
4. **Integration**: Connect functions to your frontend application

---

💡 **Pro Tip**: Use `npm run sync` for the fastest deployment workflow!
