# 📝 Snippet Manager

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**A modern, full-featured code snippet manager for developers**

**🎉 Works immediately - No configuration required!** • [Local Mode Guide](LOCAL_MODE.md)

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🌟 Features

### Core Features
- 📦 **Snippet Management** - Create, edit, delete, and organize code snippets with ease
- 🗂️ **Project Organization** - Group snippets into projects with custom colors
- 🏷️ **Smart Tagging** - Organize with tags and filter snippets instantly
- 🔍 **Powerful Search** - Search across titles, code content, and tags in real-time
- 🎨 **Syntax Highlighting** - Support for 25+ programming languages with Monaco Editor
- 📋 **One-Click Copy** - Copy snippets to clipboard with a single click
- ⭐ **Favorites** - Mark important snippets as favorites for quick access

### Advanced Features
- 💾 **Data Export/Import** - Export and import your snippets in JSON format
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🌗 **Dark/Light Mode** - Automatic theme detection with manual toggle
- ⌨️ **Keyboard Shortcuts** - Navigate and manage snippets efficiently

### Developer Features
- 🤖 **AI-Powered Suggestions** - Get code recommendations (optional OpenAI integration)
- 📝 **Smart Templates** - Quick-start templates for common code patterns
- 🔄 **Version History** - Track changes to your snippets over time
- 📊 **Usage Statistics** - View your most used snippets and tags
- 🎯 **Code Editor** - Monaco Editor with IntelliSense and code completion

---

## 🛠️ Technology Stack

### Frontend
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Monaco Editor](https://microsoft.github.io/monaco-editor/)** - VS Code's editor
- **[Prism.js](https://prismjs.com/)** - Syntax highlighting

### Backend & Services
- **[Supabase](https://supabase.com/)** - PostgreSQL database and authentication
- **[Clerk](https://clerk.com/)** - User authentication and management
- **[Vercel](https://vercel.com/)** - Hosting and deployment

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

---

## 📦 Installation

> **💡 Quick Start:** No configuration needed! The app runs in local mode by default, storing all data in your browser. Cloud features (Supabase, Clerk) are completely optional.

### Prerequisites
- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **Git** for version control

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/snippet-manager.git
cd snippet-manager
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup (Optional)

**🎉 No environment variables required for local development!**

The application works out-of-the-box using local storage. All data is stored in your browser.

**For production deployment with cloud features:**

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Supabase Configuration (optional - for cloud database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication (optional - for multi-user auth)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Optional: OpenAI for AI features
OPENAI_API_KEY=your_openai_api_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup (Optional - for cloud storage)

**Skip this if using local storage only.**

1. Create a [Supabase](https://supabase.com) account and project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `scripts/create-tables.sql`
4. Run the SQL script to create all necessary tables and indexes

### 5. Authentication Setup (Optional - for multi-user)

**Skip this if using local mode only.**

1. Create a [Clerk](https://clerk.com) account
2. Create a new application
3. Copy your publishable and secret keys
4. Add them to your `.env.local` file

### 6. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Quick Start Guide

### Local Mode (No Setup Required)

**The app works immediately without any configuration!**

Just run `npm run dev` and start using it. All your data is stored locally in your browser.

### Creating Your First Snippet

1. **Sign Up/Login** - In local mode, you're automatically logged in
2. **Create a Project** (Optional) - Organize snippets into projects
3. **Add a Snippet**:
   - Click "Add Snippet" button
   - Enter a title
   - Select a programming language
   - Paste your code
   - Add tags for organization
   - Click "Save"

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | Create new snippet |
| `Cmd/Ctrl + K` | Focus search |
| `Cmd/Ctrl + S` | Save snippet |
| `Cmd/Ctrl + /` | Toggle shortcuts help |
| `Esc` | Close dialog |

---

## 📖 Project Structure

```
snippet-manager/
├── app/                          # Next.js app router
│   ├── api/                      # API routes
│   ├── dashboard/                # Main application pages
│   │   ├── projects/             # Project management
│   │   ├── settings/             # User settings
│   │   ├── snippets/             # Snippet management
│   │   └── tags/                 # Tag management
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── code-editor.tsx           # Code editor component
│   ├── monaco-editor.tsx         # Monaco editor wrapper
│   └── ...                       # Other components
├── lib/                          # Utility functions and services
│   ├── local-storage.ts          # Local storage service
│   ├── snippets.ts               # Snippet operations
│   ├── subscription.ts           # Plan management
│   └── supabase.ts               # Database client
├── scripts/                      # Database scripts
│   └── create-tables.sql         # SQL schema
├── public/                       # Static assets
├── .env.example                  # Environment template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 🔧 Configuration

> **⚠️ All configurations below are OPTIONAL!** The app works perfectly without any of these services using local storage mode.

### Operating Modes

**Local Mode (Default):**
- ✅ No configuration required
- ✅ Data stored in browser localStorage
- ✅ Works offline
- ✅ Perfect for personal use
- ❌ No data sync across devices
- ❌ No multi-user support

**Cloud Mode (Optional):**
- Requires Supabase and/or Clerk setup
- Data synced across devices
- Multi-user authentication
- Team collaboration features

### Supabase Setup (Optional - for cloud database)

**Only needed if you want cloud storage and sync.**

1. **Create Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Credentials**: 
   - Navigate to Settings → API
   - Copy your Project URL
   - Copy your `anon/public` API key
3. **Run SQL Script**: 
   - Go to SQL Editor
   - Paste contents of `scripts/create-tables.sql`
   - Click "Run"

### Clerk Setup (Optional - for multi-user authentication)

**Only needed if you want user authentication and multi-user support.**

1. **Create Application**: Go to [clerk.com](https://clerk.com) and create an app
2. **Configure**:
   - Enable email/password authentication
   - Customize sign-in/sign-up pages
   - Set up OAuth providers (optional)
3. **Get API Keys**:
   - Go to Developers → API Keys
   - Copy Publishable Key and Secret Key

### OpenAI Integration (Optional - for AI features)

**Only needed if you want AI-powered code suggestions.**

1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
```env
OPENAI_API_KEY=sk-...
```

---

## 🎨 Customization

### Themes

The app supports automatic dark/light mode detection. Customize themes in:
- `app/globals.css` - CSS variables
- `tailwind.config.ts` - Tailwind theme configuration

### Adding New Languages

Edit `components/monaco-editor.tsx` to add more languages:

```typescript
const supportedLanguages = [
  { value: "your-language", label: "Your Language" },
  // ... other languages
];
```

### Custom Features

- Modify subscription plans in `lib/subscription.ts`
- Add new UI components in `components/`
- Create new API routes in `app/api/`

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
npm run build
# Test production build locally
npm run start
```

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- **Netlify**: Follow Next.js deployment guide
- **AWS**: Use AWS Amplify or EC2
- **Docker**: Create a Dockerfile for containerization

---

## 🧪 Testing

### Run Type Check

```bash
npm run type-check
```

### Run Linter

```bash
npm run lint
```

### Build for Production

```bash
npm run build
```

---

## 📝 Features by Plan

### FREE Plan
- ✅ Up to 3 projects
- ✅ Up to 50 snippets per project
- ✅ Basic code editor
- ✅ Tags and organization
- ✅ Export/Import data

### PRO Plan
- ✅ Unlimited projects
- ✅ Unlimited snippets
- ✅ Advanced Monaco editor
- ✅ AI-powered suggestions
- ✅ Priority support
- ✅ Full feature access

*Note: This is an open-source project. The PRO plan is configurable and can be managed without payment processing.*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

---

## 🐛 Troubleshooting

### Common Issues

**Problem**: Monaco Editor errors when closing dialogs
**Solution**: The editor properly cleans up on unmount. Errors are logged but don't affect functionality.

**Problem**: Authentication issues
**Solution**: 
1. Verify Clerk keys in `.env.local`
2. Check Clerk dashboard for application status
3. Clear browser cookies and try again

**Problem**: Database connection errors
**Solution**:
1. Verify Supabase URL and key
2. Check database tables are created
3. Review Supabase logs for errors

---

## 📚 Documentation

### Key Files
- `COMMUNITY_REMOVAL.md` - Documentation of community feature removal
- `LOCAL_MODE.md` - Guide for using the app without configuration

### API Reference

#### Snippet Operations
```typescript
import { getSnippets, createSnippet, updateSnippet, deleteSnippet } from '@/lib/snippets';

// Get all snippets
const snippets = await getSnippets(userId);

// Create snippet
const newSnippet = await createSnippet({
  title: 'My Snippet',
  code: 'console.log("Hello");',
  language: 'javascript',
  tags: ['example'],
}, userId);
```

#### Project Operations
```typescript
import { getProjects, createProject } from '@/lib/projects';

// Get all projects
const projects = await getProjects(userId);

// Create project
const newProject = await createProject({
  name: 'My Project',
  color: '#3b82f6',
}, userId);
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Clerk](https://clerk.com/) - Authentication made easy
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editing
- [Vercel](https://vercel.com/) - Deployment platform

---

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/snippet-manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/snippet-manager/discussions)
- **Email**: your-email@example.com

---

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] VS Code extension
- [ ] GitHub Gist integration
- [ ] Snippet versioning
- [ ] Team workspaces
- [ ] API access tokens
- [ ] Snippet analytics
- [ ] Code execution sandbox

---

<div align="center">

**Made with ❤️ by the community**

[⭐ Star this repo](https://github.com/your-username/snippet-manager) if you find it helpful!

</div>
