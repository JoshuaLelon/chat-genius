#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to project root
cd "$PROJECT_ROOT"

# Automatically answer "yes" to the reset prompt
echo "yes" | npx supabase db reset --linked

# Run the seeding script
npx tsx scripts/seed-data.ts 