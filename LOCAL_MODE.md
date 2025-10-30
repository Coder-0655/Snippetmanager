# 🏠 Local Mode - No Configuration Required!

## What is Local Mode?

Local Mode is the **default operating mode** of Snippet Manager that requires **zero configuration**. Your app works immediately after installation without any API keys, database setup, or authentication services.

## ✅ How It Works

- **All data** is stored in your browser's localStorage
- **No internet required** after initial load
- **Completely private** - data never leaves your device
- **Works offline** - perfect for working without internet
- **Instant startup** - no database connections or API calls
- **Free forever** - no service subscriptions needed

## 🚀 Getting Started in Local Mode

```bash
# 1. Install dependencies
npm install

# 2. Run the app (that's it!)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start using it immediately!

## 📦 What Works in Local Mode

✅ **All Core Features:**
- Create, edit, and delete snippets
- Organize snippets into projects
- Tag-based organization
- Full-text search
- Syntax highlighting with Monaco Editor
- Export/import snippets
- Dark/light theme
- Favorites and filtering
- 25+ programming languages

✅ **Local Subscription System:**
- FREE plan (3 projects, 50 snippets/project)
- Manual PRO upgrade (unlimited)

## ❌ What Requires Cloud Mode

The following features need Supabase and/or Clerk configuration:

❌ Multi-user authentication
❌ Data sync across devices
❌ Cloud backup
❌ Community sharing features
❌ Collaboration with team members
❌ Access from multiple browsers/devices

## 🔄 Switching Between Modes

### Start in Local Mode (Default)
```bash
# Just run without any .env.local file
npm run dev
```

### Switch to Cloud Mode
```bash
# 1. Create .env.local file
cp .env.example .env.local

# 2. Add your Supabase and Clerk keys
# Edit .env.local with actual values

# 3. Restart the dev server
npm run dev
```

The app automatically detects which services are configured and adapts accordingly!

## 📊 Data Storage

### Where is my data stored?

In Local Mode, all data is stored in browser localStorage under these keys:
- `projects` - Your project list
- `snippets` - All your code snippets
- `tags` - Your custom tags
- `user` - User profile (local)

### Data Location by Browser

- **Chrome/Edge**: `~/.config/google-chrome/Default/Local Storage/`
- **Firefox**: `~/.mozilla/firefox/[profile]/storage/default/`
- **Safari**: `~/Library/Safari/LocalStorage/`

### Backup Your Data

Export your snippets regularly:
1. Go to Settings → Data Management
2. Click "Export All Data"
3. Save the JSON file as backup

### Import Data

To restore or migrate:
1. Go to Settings → Data Management
2. Click "Import Data"
3. Select your exported JSON file

## 🔒 Privacy & Security

### Local Mode Privacy Benefits

- ✅ Data never transmitted over internet
- ✅ No third-party services access your code
- ✅ No tracking or analytics by default
- ✅ Complete data ownership
- ✅ GDPR compliant by design (no data collection)
- ✅ Works in air-gapped environments

### Security Considerations

- 🔐 Data is stored unencrypted in localStorage
- 🔐 Clear browser data will delete your snippets
- 🔐 Others with access to your computer can view data
- 🔐 No password protection in local mode
- 💡 For sensitive code, use Cloud Mode with encryption

## 🐛 Troubleshooting Local Mode

### My data disappeared
- Check if browser data was cleared
- Look for browser extensions that clear storage
- Restore from your exported backup JSON

### Storage quota exceeded
- Browsers limit localStorage to ~5-10MB
- Export data and clear old snippets
- Consider upgrading to Cloud Mode for unlimited storage

### Can't see my snippets on another device
- This is expected! Local Mode = local-only storage
- Switch to Cloud Mode for cross-device sync
- Or manually export/import JSON between devices

### Features not working
- Make sure JavaScript is enabled
- Check browser console for errors (F12)
- Try clearing cache and reloading
- Ensure localStorage is not disabled in browser settings

## 🎓 Best Practices

### For Personal Use
- ✅ Use Local Mode - it's perfect and free
- ✅ Export backups weekly
- ✅ Use browser you use most often

### For Team Collaboration
- ❌ Don't use Local Mode
- ✅ Set up Cloud Mode with Clerk + Supabase
- ✅ Share snippets via Community features

### For Public Deployment
- ❌ Don't deploy with Local Mode only
- ✅ Configure Supabase for persistence
- ✅ Set up Clerk for user management

## 🆚 Local Mode vs Cloud Mode

| Feature | Local Mode | Cloud Mode |
|---------|-----------|-----------|
| Setup Time | 0 minutes | 15-30 minutes |
| Cost | Free | Free tier available |
| Internet Required | No* | Yes |
| Multi-device | ❌ | ✅ |
| Data Backup | Manual export | Automatic |
| Collaboration | ❌ | ✅ |
| Privacy | Maximum | Depends on config |
| Storage Limit | ~5-10MB | Unlimited (paid) |
| Performance | Instant | Network dependent |

*After initial app load

## 💡 Tips & Tricks

### Maximize Local Storage

1. **Use External Tools** for large codebases
2. **Archive Old Snippets** - export and delete
3. **Compress Screenshots** if using media uploads
4. **Use Tags Wisely** - they count toward storage

### Backup Strategy

```bash
# Automated backup script
# Create a cron job or scheduled task

# Export from browser console:
const data = {
  projects: localStorage.getItem('projects'),
  snippets: localStorage.getItem('snippets'),
  tags: localStorage.getItem('tags')
};
const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `snippet-backup-${Date.now()}.json`;
a.click();
```

### Sync Between Devices (Manual)

1. **Device A**: Export data as JSON
2. **Transfer**: Email, USB, cloud storage
3. **Device B**: Import the JSON file

## 📖 FAQ

**Q: Do I need to configure anything to use the app?**
A: No! Just `npm install` and `npm run dev`. That's it.

**Q: Is Local Mode less secure?**
A: It's different. Data never leaves your device (good), but it's unencrypted in localStorage (consideration).

**Q: Can I switch from Local to Cloud later?**
A: Yes! Export your data, set up cloud services, then import.

**Q: Will I lose features in Local Mode?**
A: Only multi-user and sync features. All snippet management works perfectly.

**Q: Why would I use Cloud Mode?**
A: If you need multi-device access, team collaboration, or automatic backups.

**Q: Can I use some cloud features but not all?**
A: Yes! You can configure only Supabase (database) or only Clerk (auth) if you want.

## 🎉 Enjoy Local Mode!

Local Mode makes Snippet Manager **instantly usable** without any configuration hassle. Perfect for developers who want a quick, private, and powerful snippet manager without the overhead of cloud services.

Questions? Check out the main [README.md](README.md) or open an issue!
