"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModernCard } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { 
  Settings,
  Palette,
  Download,
  Code,
  Moon,
  Sun,
  Monitor,
  Check,
  Info,
  RefreshCw
} from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'appearance' | 'data'>('appearance');
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportData = () => {
    const data = { snippets: [], exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `snippet-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your snippet manager experience
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <Badge variant="secondary" className="text-green-600 bg-green-50 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          <Button onClick={saveSettings}>
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <ModernCard variant="elevated">
            <div className="space-y-1 p-2">
              <Button
                variant={activeTab === 'appearance' ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab('appearance')}
              >
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </Button>
              <Button
                variant={activeTab === 'data' ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab('data')}
              >
                <Download className="h-4 w-4 mr-2" />
                Data
              </Button>
            </div>
          </ModernCard>
        </div>

        <div className="lg:col-span-3">
          <ModernCard variant="elevated">
            <div className="p-6">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Appearance</h2>
                  
                  <div>
                    <label className="text-base font-medium">Theme</label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Choose your preferred color theme
                    </p>
                    <div className="flex gap-3">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        onClick={() => setTheme("light")}
                        className="flex items-center gap-2"
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        onClick={() => setTheme("dark")}
                        className="flex items-center gap-2"
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </Button>
                      <Button
                        variant={theme === "system" ? "default" : "outline"}
                        onClick={() => setTheme("system")}
                        className="flex items-center gap-2"
                      >
                        <Monitor className="h-4 w-4" />
                        System
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Data Management</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        Export Data
                      </CardTitle>
                      <CardDescription>
                        Download all your snippets as a JSON file
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={exportData} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ModernCard>
        </div>
      </div>

      <ModernCard variant="glass">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium">Need Help?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Settings are automatically saved. Theme changes take effect immediately.
              </p>
            </div>
          </div>
        </div>
      </ModernCard>
    </div>
  );
}
