#!/bin/bash

# Automatically answer "yes" to the reset prompt
echo "yes" | npx supabase db reset --linked

# Run the seeding script
npx tsx scripts/seed-data.ts 