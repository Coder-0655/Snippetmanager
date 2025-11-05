# Vercel Deployment Guide

## Overview

This application can be deployed to Vercel in two modes:

1. **Local Mode (No Configuration)** - Works immediately without any environment variables
2. **Cloud Mode (Optional)** - With Supabase and Clerk for multi-user support

## Quick Deploy - Local Mode

The easiest way to deploy is **without any configuration**. The app will work in local storage mode:

### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - **Don't add any environment variables**
   - Click "Deploy"

3. **Done!** Your app is live and working in local mode.

## Cloud Mode Deployment (Optional)

If you want multi-user authentication and cloud sync:

### Prerequisites:
- Supabase account and project
- Clerk account and application

### Environment Variables:

Add these in your Vercel project settings (Settings → Environment Variables):

```env
# Supabase (Required for cloud mode)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk (Required for cloud mode)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=your_openai_api_key

# App URL (Update after first deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### Steps:

1. **Set Up Database**
   - Create Supabase project
   - Run SQL from `scripts/create-tables.sql`
   - Copy your project URL and anon key

2. **Set Up Authentication**
   - Create Clerk application
   - Copy publishable and secret keys

3. **Configure Vercel**
   - Go to your Vercel project
   - Settings → Environment Variables
   - Add all the variables above
   - Redeploy the project

## Important Notes

### Clerk Optional Setup

The app now gracefully handles missing Clerk credentials:

- **Without Clerk**: Works in local mode with localStorage
- **With Clerk**: Full authentication and multi-user support

### Build Errors

If you see this error during deployment:

```
Error: @clerk/clerk-react: Missing publishableKey
```

**Solution**: This has been fixed in the latest code. The app now checks for Clerk configuration and falls back to local mode when not configured.

### Migration from Old Version

If you're upgrading from an older version that required Clerk:

1. **Pull latest code**
   ```bash
   git pull origin main
   ```

2. **Key changes made**:
   - Created `lib/use-auth.ts` - Custom auth hook with fallback
   - Updated `app/layout.tsx` - Conditional ClerkProvider
   - Updated `app/dashboard/layout.tsx` - Works without Clerk
   - Updated all dashboard pages to use custom hook

3. **Redeploy**
   ```bash
   git push origin main
   ```

## Deployment Checklist

### Before Deploying:

- [ ] Code is pushed to GitHub
- [ ] Database tables created (if using Supabase)
- [ ] Environment variables configured (if using cloud mode)
- [ ] Build succeeds locally (`npm run build`)

### After Deploying:

- [ ] Visit your deployment URL
- [ ] Test creating a snippet
- [ ] Verify data persists (refresh page)
- [ ] Test all navigation links

### Common Issues:

**Issue**: "Missing publishableKey" error
**Solution**: This is fixed in the latest code. Pull and redeploy.

**Issue**: Snippets not persisting
**Solution**: Check browser console for errors. Data should persist in localStorage even without Supabase.

**Issue**: "Hydration" warnings
**Solution**: These are harmless warnings from Monaco editor cleanup. Functionality works correctly.

## Monitoring

After deployment, monitor your app:

1. **Vercel Dashboard**
   - Check deployment logs
   - Monitor function execution
   - View analytics

2. **Browser Console**
   - Check for JavaScript errors
   - Verify localStorage is working
   - Test all features

## Scaling

### Local Mode Limitations:
- Data stored only in browser
- No sync across devices
- No collaboration features

### Cloud Mode Benefits:
- Data synced across devices
- Multiple users supported
- Team collaboration
- Data backup and recovery

## Support

If you encounter issues:

1. Check the deployment logs in Vercel
2. Test the build locally first (`npm run build`)
3. Review browser console for errors
4. Ensure you're using the latest code

---

**Last Updated**: November 3, 2025  
**Version**: 2.0 - Clerk Optional Support
