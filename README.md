# Snippet Manager

A modern, full-featured code snippet manager built with Next.js 14, TypeScript, and TailwindCSS. 

## ✨ Features

- **Dual Mode Operation**: Works with or without Supabase backend
- **Full CRUD Operations**: Create, read, update, and delete code snippets
- **Authentication**: GitHub OAuth and email/password (Supabase mode) or local authentication
- **Real-time Search**: Search across snippet titles, content, and tags
- **Tag Management**: Organize snippets with custom tags
- **Copy to Clipboard**: One-click copying of code snippets
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean interface with smooth animations
- **Data Export/Import**: Export and import your snippets (local mode)

## 🚀 Quick Start

### Option 1: Local Mode (No Setup Required)

```bash
# Clone the repository
git clone <repository-url>
cd Snipetmanager

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will automatically run in **Local Mode** when no Supabase configuration is provided. Your data will be stored in your browser's localStorage.

### Option 2: Supabase Mode (Full Backend)

1. Create a [Supabase](https://supabase.com) project
2. Run the SQL schema from `supabase-schema.sql`
3. Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:

```bash
npm run dev
```

## 🔧 Mode Comparison

| Feature | Local Mode | Supabase Mode |
|---------|------------|---------------|
| **Setup Complexity** | ⚡ Zero setup | 🔧 Requires Supabase setup |
| **Data Persistence** | 📱 Browser localStorage | ☁️ PostgreSQL database |
| **Authentication** | 🔓 Simple local auth | 🔐 Full OAuth + email/password |
| **Multi-device Sync** | ❌ Single device only | ✅ Syncs across devices |
| **Data Export** | ✅ Built-in export/import | ❌ Database backup only |
| **GitHub Login** | ❌ Not available | ✅ Available |
| **Real-time Features** | ❌ No real-time sync | ✅ Real-time updates |
| **Scalability** | 📊 Limited to browser storage | 📈 Unlimited with proper hosting |

## 🎯 Local Mode Features

When running without Supabase configuration, the app automatically switches to Local Mode with these features:

- **Quick Demo Access**: Instant access without creating an account
- **Local Account Creation**: Create accounts stored in browser
- **Data Export/Import**: Backup and restore your snippets
- **Full Functionality**: All CRUD operations work normally
- **Privacy**: All data stays on your device

## 🛠 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run format       # Format code with Prettier
npm run typecheck    # Check TypeScript types
npm run quality      # Run all quality checks
```

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: Supabase PostgreSQL (optional)
- **Authentication**: Supabase Auth (optional) or Local Auth
- **Storage**: localStorage (Local Mode) or Supabase (Cloud Mode)

## 📁 Project Structure

```
├── app/                    # Next.js App Router
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/             # Authentication page
│   └── ...
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                  # Core utilities
│   ├── auth.tsx          # Authentication context (dual mode)
│   ├── supabase.ts       # Supabase client (optional)
│   ├── local-auth.ts     # Local authentication
│   ├── local-storage.ts  # Local storage service
│   ├── snippets.ts       # Unified snippets service
│   └── ...
├── middleware.ts         # Route protection (dual mode)
└── ...
```

## 🔒 Security

### Local Mode
- Data stored securely in browser localStorage
- Basic password protection (not hashed - demo purposes)
- No network requests for authentication

### Supabase Mode
- Row Level Security (RLS) policies
- Server-side route protection
- Secure OAuth authentication
- Encrypted data transmission

## 🚀 Deployment

### Local Mode Deployment
Deploy anywhere that supports static sites:
- Vercel, Netlify, GitHub Pages
- No environment variables needed
- Users get instant access

### Supabase Mode Deployment
1. Deploy to Vercel (recommended for Next.js)
2. Add Supabase environment variables
3. Configure authentication providers in Supabase
4. Set up custom domain (optional)

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
