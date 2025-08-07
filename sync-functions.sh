#!/bin/bash
# Supabase Edge Functions Sync Script
# Usage: ./sync-functions.sh [command] [function-name]

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    echo -e "${2}${1}${NC}"
}

show_help() {
    print_color "🚀 Supabase Edge Functions Sync Tool" "$BLUE"
    print_color "=====================================" "$BLUE"
    echo
    print_color "USAGE:" "$YELLOW"
    echo "  ./sync-functions.sh [command] [function-name]"
    echo
    print_color "COMMANDS:" "$YELLOW"
    echo "  deploy          Deploy all functions to cloud (default)"
    echo "  deploy <name>   Deploy specific function"
    echo "  list            List all functions and their status"
    echo "  logs <name>     View logs for specific function"
    echo "  serve           Start local development server"
    echo "  status          Check Supabase project status"
    echo "  help            Show this help message"
    echo
    print_color "EXAMPLES:" "$YELLOW"
    echo "  ./sync-functions.sh                           # Deploy all functions"
    echo "  ./sync-functions.sh deploy send-confirmation-email  # Deploy specific function"
    echo "  ./sync-functions.sh list                     # List all functions"
    echo "  ./sync-functions.sh logs send-confirmation-email    # View function logs"
    echo "  ./sync-functions.sh serve                    # Start local server"
}

check_supabase() {
    if ! command -v npx &> /dev/null; then
        print_color "❌ Error: npx not found. Please install Node.js first." "$RED"
        exit 1
    fi
    
    if ! npx supabase --version &> /dev/null; then
        print_color "❌ Error: Supabase CLI not found. Please install it first." "$RED"
        print_color "Run: npm install supabase" "$YELLOW"
        exit 1
    fi
}

deploy_functions() {
    local function_name="$1"
    
    print_color "🚀 Starting deployment..." "$BLUE"
    
    if [ -n "$function_name" ]; then
        print_color "📦 Deploying function: $function_name" "$YELLOW"
        npx supabase functions deploy "$function_name" --import-map ./import_map.json
    else
        print_color "📦 Deploying all functions..." "$YELLOW"
        npx supabase functions deploy --import-map ./import_map.json
    fi
    
    if [ $? -eq 0 ]; then
        print_color "✅ Deployment successful!" "$GREEN"
    else
        print_color "❌ Deployment failed!" "$RED"
    fi
}

list_functions() {
    print_color "📋 Listing all functions..." "$BLUE"
    npx supabase functions list
}

show_logs() {
    local function_name="$1"
    
    if [ -z "$function_name" ]; then
        print_color "❌ Error: Function name required for logs command" "$RED"
        print_color "Usage: ./sync-functions.sh logs <function-name>" "$YELLOW"
        return 1
    fi
    
    print_color "📋 Showing logs for: $function_name" "$BLUE"
    npx supabase functions logs "$function_name"
}

start_server() {
    print_color "🔧 Starting local development server..." "$BLUE"
    print_color "Note: This requires Docker to be running" "$YELLOW"
    npx supabase functions serve
}

check_status() {
    print_color "📊 Checking Supabase project status..." "$BLUE"
    npx supabase status
}

# Main execution
COMMAND="${1:-deploy}"
FUNCTION_NAME="$2"

if [ "$COMMAND" = "help" ] || [ "$COMMAND" = "--help" ] || [ "$COMMAND" = "-h" ]; then
    show_help
    exit 0
fi

check_supabase

print_color "\n🎯 Supabase Edge Functions Sync Tool" "$BLUE"
print_color "======================================\n" "$BLUE"

case "$COMMAND" in
    "deploy")
        deploy_functions "$FUNCTION_NAME"
        print_color "\n🔗 View your functions: https://supabase.com/dashboard/project/rowcloxlszwnowlggqon/functions" "$BLUE"
        ;;
    "list")
        list_functions
        ;;
    "logs")
        show_logs "$FUNCTION_NAME"
        ;;
    "serve")
        start_server
        ;;
    "status")
        check_status
        ;;
    *)
        print_color "❌ Unknown command: $COMMAND" "$RED"
        print_color "Run './sync-functions.sh help' for usage information" "$YELLOW"
        exit 1
        ;;
esac

print_color "\n✨ Done!" "$GREEN"
