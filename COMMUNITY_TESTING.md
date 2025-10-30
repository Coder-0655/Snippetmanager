# Community System Testing Guide

## Overview
This guide will help you verify that the public snippets and community features are working correctly.

## Prerequisites
1. Database tables are created (run the SQL script in Supabase dashboard)
2. At least one user account for testing
3. Some snippets created in the database

## Step-by-Step Testing

### 1. Database Setup
Run the complete SQL script from `scripts/create-tables.sql` in your Supabase dashboard:
- Go to Supabase Dashboard → SQL Editor
- Copy and paste the entire contents of `create-tables.sql`
- Click "Run"

This will create:
- `snippets` table with `is_public` column (default: false)
- `community` table for public snippets
- `community_likes` table for likes
- `profiles` table for user information
- All necessary indexes

### 2. Test the System

#### Option A: Using the Test Page
1. Navigate to `/dashboard/test-community`
2. Click "Run Tests" button
3. Review the test results
4. Use the toggle buttons to make snippets public/private
5. Verify that:
   - ✅ All snippets have an `is_public` field
   - ✅ Public snippets appear in the community section
   - ✅ Private snippets are hidden from community
   - ✅ Toggle functionality works correctly

#### Option B: Manual Testing
1. **Create a snippet:**
   - Go to `/dashboard/snippets`
   - Create a new snippet
   - Snippet should be private by default (`is_public = false`)

2. **Make snippet public:**
   - Find the snippet in your list
   - Click the Lock icon (🔒) to toggle to public
   - Icon should change to Globe (🌐)
   - Snippet should now appear in `/dashboard/community`

3. **Verify community visibility:**
   - Open `/dashboard/community`
   - Your public snippet should appear in the list
   - Switch to another user account
   - The public snippet should be visible from the other account

4. **Make snippet private again:**
   - Click the Globe icon (🌐) to toggle back to private
   - Icon should change back to Lock (🔒)
   - Snippet should disappear from `/dashboard/community`

### 3. Cross-Account Testing
1. **Account 1:**
   - Create and publish 2-3 snippets
   - Verify they appear in community page

2. **Account 2 (different user):**
   - Go to `/dashboard/community`
   - You should see snippets from Account 1
   - Verify you cannot see Account 1's private snippets

3. **Both accounts:**
   - Verify the community page shows snippets from all users
   - Check that filtering and sorting work correctly

## Expected Behavior

### When Making a Snippet Public
1. `snippets.is_public` is set to `true`
2. A new row is inserted into `community` table with snippet data
3. The snippet appears in the community feed for all users
4. The Lock icon (🔒) changes to Globe icon (🌐)

### When Making a Snippet Private
1. `snippets.is_public` is set to `false`
2. The row is removed from `community` table
3. The snippet disappears from community feed
4. The Globe icon (🌐) changes to Lock icon (🔒)

## Troubleshooting

### Issue: Toggle button doesn't appear
**Solution:** Check that `onTogglePublic` prop is passed to the snippet card component

### Issue: Snippets don't appear in community
**Possible causes:**
1. `is_public` is still false → Check database
2. `community` table wasn't updated → Check `addToCommunity` function logs
3. Database permissions → Verify Supabase RLS policies

**Solution:**
```sql
-- Check snippet status
SELECT id, title, is_public FROM snippets WHERE user_id = 'your-user-id';

-- Check community table
SELECT id, title, user_id FROM community;

-- Verify sync between tables
SELECT 
    s.id as snippet_id,
    s.title,
    s.is_public,
    CASE WHEN c.id IS NOT NULL THEN 'In Community' ELSE 'Not in Community' END as status
FROM snippets s
LEFT JOIN community c ON s.id = c.snippet_id
WHERE s.user_id = 'your-user-id';
```

### Issue: TypeScript errors about `is_public`
**Solution:** The type definitions are updated in `lib/supabase.ts`. Make sure:
- TypeScript version is up to date
- Run `npm run build` to verify types
- Check that `Snippet` type includes `is_public: boolean`

### Issue: Community page shows "No snippets"
**Possible causes:**
1. No public snippets exist
2. `getCommunitySnippets` function has errors
3. Frontend component isn't rendering correctly

**Solution:**
1. Create a snippet and make it public
2. Check browser console for errors
3. Verify network requests to Supabase

## Database Verification Queries

```sql
-- 1. Check if is_public column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'snippets' AND column_name = 'is_public';

-- 2. Count public vs private snippets
SELECT 
    is_public,
    COUNT(*) as count
FROM snippets
GROUP BY is_public;

-- 3. Verify community table sync
SELECT 
    (SELECT COUNT(*) FROM snippets WHERE is_public = true) as public_snippets_count,
    (SELECT COUNT(*) FROM community) as community_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM snippets WHERE is_public = true) = (SELECT COUNT(*) FROM community) 
        THEN 'SYNCED' 
        ELSE 'OUT OF SYNC' 
    END as sync_status;

-- 4. List all public snippets and their community status
SELECT 
    s.id,
    s.title,
    s.user_id,
    s.is_public,
    c.id as community_id,
    c.likes_count,
    c.views_count
FROM snippets s
LEFT JOIN community c ON s.id = c.snippet_id
WHERE s.is_public = true;
```

## Key Files

- **Community Service:** `lib/community.ts`
  - `toggleSnippetPublic()` - Main function for toggling
  - `addToCommunity()` - Adds snippet to community table
  - `removeFromCommunity()` - Removes from community table
  - `getCommunitySnippets()` - Fetches all public snippets

- **Snippets Page:** `app/dashboard/snippets/page.tsx`
  - `handleTogglePublic()` - UI handler for toggle button

- **Enhanced Snippet Card:** `components/enhanced-snippet-card.tsx`
  - Toggle button UI component

- **Community Page:** `app/dashboard/community/page.tsx`
  - Displays all public snippets

- **Database Schema:** `scripts/create-tables.sql`
  - Table definitions and indexes

- **Test Page:** `app/dashboard/test-community/page.tsx`
  - Automated testing interface

## Success Criteria

- ✅ Can create snippets (private by default)
- ✅ Can toggle snippets between public and private
- ✅ Public snippets appear in community feed
- ✅ Private snippets are hidden from community
- ✅ Cross-account visibility works correctly
- ✅ Community feed shows snippets from all users
- ✅ Toggle icon updates correctly (Lock ↔️ Globe)
- ✅ Database stays in sync (snippets.is_public ↔️ community table)
