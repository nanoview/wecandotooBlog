#!/bin/bash

# 🚨 EMERGENCY: Remove Exposed Supabase Service Role Key from Git History
# This script removes the compromised service role key from Git history

echo "🚨 EMERGENCY SECURITY CLEANUP: Removing exposed Supabase service role key"
echo "=================================================================="

# The exposed service role key that needs to be removed
EXPOSED_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvd2Nsb3hsc3p3bm93bGdncW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzgyMDAwNCwiZXhwIjoyMDY5Mzk2MDA0fQ.0R8CvJUfXB1aTwFdz7ywNbrmGp2GNTU7V9MdWr-j4mU"

echo "⚠️  WARNING: This will rewrite Git history. Ensure you have backups!"
echo "📂 Current repository: $(pwd)"
echo "🔑 Removing key: ${EXPOSED_KEY:0:50}..."
echo ""

read -p "🚨 Continue with Git history cleanup? (type 'YES' to confirm): " confirm

if [ "$confirm" != "YES" ]; then
    echo "❌ Cleanup cancelled. Key remains in Git history!"
    echo "🚨 CRITICAL: You must regenerate the Supabase service role key immediately"
    exit 1
fi

echo "🔄 Starting cleanup process..."

# Method 1: Use git filter-repo (recommended)
if command -v git-filter-repo &> /dev/null; then
    echo "✅ Using git-filter-repo for secure cleanup"
    
    # Create replacement file
    cat > /tmp/secrets-cleanup.txt << EOF
$EXPOSED_KEY==>REDACTED_SUPABASE_SERVICE_ROLE_KEY
EOF
    
    echo "🧹 Removing exposed key from all commits..."
    git filter-repo --replace-text /tmp/secrets-cleanup.txt --force
    
    echo "🗑️  Cleaning up temporary files..."
    rm /tmp/secrets-cleanup.txt
    
    echo "✅ Git history cleaned with git-filter-repo"
    
elif command -v git-filter-branch &> /dev/null; then
    echo "⚠️  Using git-filter-branch (fallback method)"
    
    # Backup current branch
    git branch backup-before-cleanup
    
    echo "🧹 Rewriting Git history to remove exposed key..."
    git filter-branch --tree-filter "
        find . -type f -name '*.js' -o -name '*.md' -o -name '*.json' | xargs sed -i 's/$EXPOSED_KEY/REDACTED_SUPABASE_SERVICE_ROLE_KEY/g' 2>/dev/null || true
    " --all
    
    echo "🗑️  Cleaning up filter-branch artifacts..."
    rm -rf .git/refs/original/
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    
    echo "✅ Git history cleaned with git-filter-branch"
    
else
    echo "❌ ERROR: Neither git-filter-repo nor git-filter-branch available"
    echo "📥 Install git-filter-repo: pip install git-filter-repo"
    echo "🔄 Alternative: Force push to remove latest commit"
    
    read -p "🚨 Force push to remove latest commit? (type 'FORCE' to confirm): " force_confirm
    
    if [ "$force_confirm" = "FORCE" ]; then
        echo "⚠️  Performing force push to remove latest commit..."
        git reset --hard HEAD~1
        git push --force-with-lease origin main
        echo "✅ Latest commit removed via force push"
    else
        echo "❌ No cleanup performed!"
        echo "🚨 CRITICAL: Exposed key still in Git history"
        exit 1
    fi
fi

echo ""
echo "🎉 CLEANUP COMPLETE!"
echo "=================================================================="
echo "✅ Exposed Supabase service role key removed from Git history"
echo "🔄 Next steps:"
echo "   1. Push cleaned history: git push --force-with-lease origin main"
echo "   2. Regenerate service role key in Supabase Dashboard"
echo "   3. Update all environment variables"
echo "   4. Redeploy edge functions with new secrets"
echo ""
echo "🛡️  Your repository is now secure!"

# Check if remote push is needed
if [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
    echo ""
    read -p "🔄 Push cleaned history to GitHub now? (y/n): " push_confirm
    
    if [ "$push_confirm" = "y" ] || [ "$push_confirm" = "Y" ]; then
        echo "📤 Pushing cleaned history to GitHub..."
        git push --force-with-lease origin main
        echo "✅ GitHub repository updated with clean history"
    else
        echo "⚠️  Remember to push: git push --force-with-lease origin main"
    fi
fi

echo ""
echo "🚨 CRITICAL REMINDER:"
echo "   The exposed service role key is COMPROMISED"
echo "   Regenerate it immediately in Supabase Dashboard!"
echo "   https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/settings/api"
