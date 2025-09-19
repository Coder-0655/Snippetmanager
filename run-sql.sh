#!/bin/bash

echo "🚀 Manual Supabase Schema Setup"
echo "==============================="
echo ""
echo "Since automated execution requires your database password,"
echo "here's the easiest way to set up your schema:"
echo ""
echo "1. Go to your Supabase Dashboard:"
echo "   https://supabase.com/dashboard/project/awgnogaubtejmhtyxuca"
echo ""
echo "2. Navigate to 'SQL Editor' in the left sidebar"
echo ""
echo "3. Copy the entire contents of 'supabase-schema.sql' and paste it into the SQL Editor"
echo ""
echo "4. Click 'Run' to execute the schema"
echo ""
echo "📋 The schema will create:"
echo "   ✅ User profiles table"
echo "   ✅ Snippets table with Row Level Security"
echo "   ✅ Tags table for organizing snippets"
echo "   ✅ Triggers for automatic user profile creation"
echo "   ✅ Functions for tag management"
echo "   ✅ Performance indexes"
echo ""
echo "📄 Schema file: $(pwd)/supabase-schema.sql"
echo ""

# Let's also copy the schema to clipboard if available
if command -v pbcopy >/dev/null 2>&1; then
    cat supabase-schema.sql | pbcopy
    echo "✅ Schema has been copied to your clipboard!"
    echo "   Just paste it directly into the Supabase SQL Editor"
    echo ""
else
    echo "💡 Tip: You can manually copy the contents of supabase-schema.sql"
fi

echo "🔗 Quick links:"
echo "   Dashboard: https://supabase.com/dashboard/project/awgnogaubtejmhtyxuca"
echo "   SQL Editor: https://supabase.com/dashboard/project/awgnogaubtejmhtyxuca/sql"
echo ""
echo "After running the SQL, your app will be ready to use Supabase mode!"