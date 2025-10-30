# Community System - Quick Verification Checklist

## ✅ Pre-Flight Checks

### Database Setup
- [ ] Run `scripts/create-tables.sql` in Supabase Dashboard SQL Editor
- [ ] Verify `is_public` column exists in `snippets` table
- [ ] Verify `community` table exists
- [ ] Verify `community_likes` table exists
- [ ] Verify `profiles` table exists

### Code Compilation
- [ ] Run `npm run build` - should complete without errors
- [ ] No TypeScript errors in VS Code
- [ ] All imports resolve correctly

## 🧪 Functional Testing

### Test 1: Create & Toggle Snippet
1. [ ] Go to `/dashboard/snippets`
2. [ ] Create a new snippet
3. [ ] Verify Lock icon (🔒) appears on the snippet card
4. [ ] Click the Lock icon
5. [ ] Icon should change to Globe (🌐)
6. [ ] No errors in browser console

### Test 2: View in Community
1. [ ] With snippet still public, go to `/dashboard/community`
2. [ ] Verify your public snippet appears in the feed
3. [ ] Verify snippet details are correct (title, language, code)
4. [ ] Verify likes count shows 0
5. [ ] Verify views count shows 0

### Test 3: Toggle to Private
1. [ ] Go back to `/dashboard/snippets`
2. [ ] Click the Globe icon (🌐) on your snippet
3. [ ] Icon should change back to Lock (🔒)
4. [ ] Go to `/dashboard/community`
5. [ ] Verify your snippet NO LONGER appears in the feed

### Test 4: Cross-Account Visibility
1. [ ] Make a snippet public on Account A
2. [ ] Open your app in incognito/private window
3. [ ] Sign in with Account B (different user)
4. [ ] Go to `/dashboard/community`
5. [ ] Verify you can see Account A's public snippet
6. [ ] Verify you CANNOT see Account A's private snippets
7. [ ] Back in Account A, make snippet private
8. [ ] Refresh Account B's community page
9. [ ] Verify snippet disappears

### Test 5: Multiple Public Snippets
1. [ ] Create 3-5 snippets
2. [ ] Make 2-3 of them public
3. [ ] Go to `/dashboard/community`
4. [ ] Verify only public snippets appear
5. [ ] Verify count matches (e.g., 2 public = 2 in community)

### Test 6: Navigation
1. [ ] Verify navigation drawer appears on all pages:
   - [ ] `/dashboard`
   - [ ] `/dashboard/snippets`
   - [ ] `/dashboard/community`
   - [ ] `/dashboard/tags`
   - [ ] `/dashboard/settings`
2. [ ] Verify "Community" link in navigation works
3. [ ] Verify Globe icon (🌐) shows next to "Community"

### Test 7: Search & Filter (Community Page)
1. [ ] Go to `/dashboard/community`
2. [ ] Try searching for a snippet by title
3. [ ] Try filtering by language
4. [ ] Try sorting by different options (newest, likes, views)
5. [ ] Verify results update correctly

### Test 8: Automated Tests
1. [ ] Go to `/dashboard/test-community`
2. [ ] Click "Run Tests" button
3. [ ] Verify all tests pass:
   - [ ] ✅ Fetch User Snippets
   - [ ] ✅ Check is_public Field
   - [ ] ✅ Fetch Community Snippets
   - [ ] ✅ Public Snippets Count
   - [ ] ✅ Community Sync Check
4. [ ] Use toggle buttons to test public/private switching
5. [ ] Verify test results update in real-time

## 🔍 Database Verification

### Query 1: Check is_public Column
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'snippets' AND column_name = 'is_public';
```
Expected: One row with `boolean` type and `false` default

### Query 2: Count Public vs Private
```sql
SELECT 
    is_public,
    COUNT(*) as count
FROM snippets
GROUP BY is_public;
```
Expected: Two rows showing counts for `true` and `false`

### Query 3: Verify Sync
```sql
SELECT 
    (SELECT COUNT(*) FROM snippets WHERE is_public = true) as public_snippets,
    (SELECT COUNT(*) FROM community) as community_snippets,
    CASE 
        WHEN (SELECT COUNT(*) FROM snippets WHERE is_public = true) = 
             (SELECT COUNT(*) FROM community)
        THEN '✅ SYNCED' 
        ELSE '❌ OUT OF SYNC' 
    END as status;
```
Expected: `✅ SYNCED`

### Query 4: List All Public Snippets
```sql
SELECT 
    s.id,
    s.title,
    s.is_public,
    s.user_id,
    c.id as community_id,
    c.likes_count,
    c.views_count
FROM snippets s
LEFT JOIN community c ON s.id = c.snippet_id
WHERE s.is_public = true;
```
Expected: All public snippets have matching community entries

### Query 5: Find Orphaned Community Entries
```sql
SELECT c.*
FROM community c
LEFT JOIN snippets s ON c.snippet_id = s.id
WHERE s.id IS NULL OR s.is_public = false;
```
Expected: **Zero rows** (no orphaned entries)

## 🐛 Troubleshooting

### Issue: Toggle doesn't work
- [ ] Check browser console for errors
- [ ] Verify you're authenticated
- [ ] Check Supabase RLS policies allow updates
- [ ] Verify `handleTogglePublic` function is called

### Issue: Snippets don't appear in community
- [ ] Verify `is_public = true` in database
- [ ] Check community table has matching entry
- [ ] Run Query 3 (Verify Sync) above
- [ ] Check browser network tab for failed requests

### Issue: TypeScript errors
- [ ] Run `npm run build`
- [ ] Check `lib/local-storage.ts` has `is_public` field
- [ ] Verify all imports are correct
- [ ] Restart VS Code TypeScript server

### Issue: Navigation missing
- [ ] Verify you're on a `/dashboard/*` route
- [ ] Check dashboard layout is being applied
- [ ] Try refreshing the page
- [ ] Check browser console for layout errors

## ✨ Success Indicators

All of these should be true:
- ✅ No TypeScript compilation errors
- ✅ Lock/Globe toggle works smoothly
- ✅ Public snippets visible in community feed
- ✅ Private snippets hidden from community
- ✅ Cross-account visibility works
- ✅ Database stays synchronized
- ✅ Navigation drawer present on all dashboard pages
- ✅ Automated tests pass
- ✅ No errors in browser console
- ✅ All database verification queries return expected results

## 📊 Performance Checks

- [ ] Community page loads in < 2 seconds
- [ ] Toggle action completes in < 1 second
- [ ] No unnecessary re-renders
- [ ] Smooth scrolling in community feed
- [ ] Search/filter updates quickly

## 🎉 Final Verification

If ALL of the above checks pass:
- ✅ Community system is fully functional
- ✅ Public/private toggling works perfectly
- ✅ Cross-account visibility is correct
- ✅ Database synchronization is maintained
- ✅ UI updates reflect database state

**System Status: READY FOR PRODUCTION** 🚀
