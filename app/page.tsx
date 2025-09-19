import Link from "next/link";
import { Code2, Search, Share2 } from "lucide-react";
import SnippetPreview from "@/components/snippet-preview";
import { ModernCard } from "@/components/ui/modern-card";
import { ModernButton } from "@/components/ui/modern-button";

export default function HomePage() {
  return (
    <div className="container py-8 lg:py-16">
      <section className="text-center space-y-6">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">
          Snippet Manager
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto">
          Save, search, and share your code snippets in seconds
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <ModernButton 
              animate
              className="w-full sm:w-auto px-6 text-sm font-medium shadow hover:opacity-90"
            >
              Get Started
            </ModernButton>
          </Link>
          <Link href="/dashboard">
            <ModernButton 
              animate
              variant="secondary"
              className="w-full sm:w-auto px-6 text-sm font-medium"
            >
              View Dashboard
            </ModernButton>
          </Link>
        </div>
      </section>

      <section className="mt-12 lg:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          icon={<Code2 className="h-5 w-5" />}
          title="Save & Tag"
          desc="Quickly save snippets with language & tags."
        />
        <FeatureCard
          icon={<Search className="h-5 w-5" />}
          title="Search & Filter"
          desc="Full-text search, filter by language/tag."
        />
        <FeatureCard
          icon={<Share2 className="h-5 w-5" />}
          title="Share & Export"
          desc="Share snippets via link or export as JSON."
        />
      </section>

      <section className="mt-12 lg:mt-16 space-y-4">
        <h2 className="text-xl font-semibold text-center sm:text-left">Example snippets</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <SnippetPreview
            language="ts"
            title="TypeScript – Debounce"
            code={`function debounce<T extends (...args: any[]) => void>(fn: T, delay = 200) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}`}
            tags={["ts", "util"]}
          />
          <SnippetPreview
            language="py"
            title="Python – Flatten list"
            code={`flatten = lambda l: [item for sub in l for item in sub]`}
            tags={["python", "list"]}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <ModernCard variant="elevated" animate className="hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </ModernCard>
  );
}
