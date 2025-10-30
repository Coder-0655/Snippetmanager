"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Share2, 
  Link2, 
  Users, 
  MessageCircle, 
  History,
  Globe,
  Lock,
  Copy,
  Check,
  Eye,
  Heart,
  GitBranch,
  Clock,
  User,
  Settings
} from "lucide-react";
import { MonacoEditor } from "@/components/monaco-editor";
import type { Snippet } from "@/lib/supabase";

interface SharedSnippet extends Omit<Snippet, 'is_public'> {
  share_id?: string;
  is_public?: boolean;
  share_url?: string;
  view_count?: number;
  like_count?: number;
  comments?: Comment[];
  versions?: SnippetVersion[];
  shared_by?: string;
  shared_at?: string;
}

interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
  line_number?: number;
}

interface SnippetVersion {
  id: string;
  version: number;
  code: string;
  changes_summary: string;
  created_at: string;
  author: string;
}

interface CollaborationHubProps {
  snippet: Snippet;
  onUpdate?: (snippet: Snippet) => void;
}

export function CollaborationHub({ snippet, onUpdate }: CollaborationHubProps) {
  const [sharedSnippet, setSharedSnippet] = useState<SharedSnippet>(snippet as SharedSnippet);
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [versions, setVersions] = useState<SnippetVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<SnippetVersion | null>(null);
  const [activeTab, setActiveTab] = useState<'sharing' | 'comments' | 'versions'>('sharing');

  useEffect(() => {
    // Load collaboration data
    loadCollaborationData();
  }, [snippet.id]);

  const loadCollaborationData = async () => {
    // Mock data - replace with actual API calls
    const mockComments: Comment[] = [
      {
        id: "1",
        content: "Great snippet! This is exactly what I was looking for.",
        author: "john_doe",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        line_number: 5
      },
      {
        id: "2",
        content: "Could you add error handling for edge cases?",
        author: "jane_smith",
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        line_number: 12
      }
    ];

    const mockVersions: SnippetVersion[] = [
      {
        id: "v3",
        version: 3,
        code: snippet.code,
        changes_summary: "Added error handling and improved performance",
        created_at: new Date().toISOString(),
        author: "current_user"
      },
      {
        id: "v2",
        version: 2,
        code: snippet.code.replace("const", "let"),
        changes_summary: "Fixed variable declarations",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        author: "current_user"
      },
      {
        id: "v1",
        version: 1,
        code: snippet.code.substring(0, snippet.code.length / 2) + "// Initial version",
        changes_summary: "Initial version",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        author: "current_user"
      }
    ];

    setComments(mockComments);
    setVersions(mockVersions);

    // Check if snippet is already shared
    if (sharedSnippet.is_public) {
      setShareUrl(`${window.location.origin}/shared/${sharedSnippet.share_id || snippet.id}`);
    }
  };

  const shareSnippet = async (isPublic: boolean) => {
    setIsSharing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const shareId = Math.random().toString(36).substring(2, 15);
      const url = `${window.location.origin}/shared/${shareId}`;
      
      setSharedSnippet(prev => ({
        ...prev,
        is_public: isPublic,
        share_id: shareId,
        share_url: url,
        shared_at: new Date().toISOString()
      }));
      
      setShareUrl(url);
    } catch (error) {
      console.error("Failed to share snippet:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment,
      author: "current_user",
      created_at: new Date().toISOString()
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");
  };

  const createVersion = async (changesSummary: string) => {
    const newVersion: SnippetVersion = {
      id: `v${versions.length + 1}`,
      version: versions.length + 1,
      code: snippet.code,
      changes_summary: changesSummary,
      created_at: new Date().toISOString(),
      author: "current_user"
    };

    setVersions(prev => [newVersion, ...prev]);
  };

  const restoreVersion = async (version: SnippetVersion) => {
    if (onUpdate) {
      onUpdate({
        ...snippet,
        code: version.code
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Collaboration Hub</h2>
        </div>
        <div className="flex items-center gap-2">
          {sharedSnippet.is_public && (
            <Badge variant="secondary" className="text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Public
            </Badge>
          )}
          {sharedSnippet.view_count && (
            <Badge variant="secondary" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              {sharedSnippet.view_count} views
            </Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {[
          { id: 'sharing', label: 'Sharing', icon: Share2 },
          { id: 'comments', label: 'Comments', icon: MessageCircle },
          { id: 'versions', label: 'Versions', icon: History }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.id as 'sharing' | 'comments' | 'versions')}
            className="flex items-center gap-1"
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
            {tab.id === 'comments' && comments.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {comments.length}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Sharing Tab */}
      {activeTab === 'sharing' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4" />
                Share Snippet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!sharedSnippet.is_public ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Share your snippet with others by generating a public link.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => shareSnippet(true)}
                      disabled={isSharing}
                      className="flex items-center gap-2"
                    >
                      {isSharing ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Globe className="h-4 w-4" />
                      )}
                      Make Public
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => shareSnippet(false)}
                      disabled={isSharing}
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Private Link
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your snippet is now public and can be accessed via this link:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={copyShareUrl}
                      className="flex items-center gap-1"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {sharedSnippet.view_count || 0} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {sharedSnippet.like_count || 0} likes
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Shared {sharedSnippet.shared_at ? new Date(sharedSnippet.shared_at).toLocaleDateString() : 'recently'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Collaboration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Team Collaboration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Invite team members to collaborate on this snippet.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  className="flex-1"
                />
                <Button variant="outline">
                  Invite
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Team members will be able to view, comment, and suggest changes.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4" />
                Comments & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="space-y-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <Button
                  size="sm"
                  onClick={addComment}
                  disabled={!newComment.trim()}
                >
                  Add Comment
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{comment.author}</span>
                        {comment.line_number && (
                          <Badge variant="secondary" className="text-xs">
                            Line {comment.line_number}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No comments yet</p>
                    <p className="text-xs">Be the first to leave feedback!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Versions Tab */}
      {activeTab === 'versions' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" />
                Version History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Version */}
              <div className="flex gap-2">
                <Input
                  placeholder="Describe changes..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      createVersion((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.querySelector('input[placeholder="Describe changes..."]') as HTMLInputElement;
                    if (input?.value) {
                      createVersion(input.value);
                      input.value = '';
                    }
                  }}
                >
                  Save Version
                </Button>
              </div>

              {/* Versions List */}
              <div className="space-y-2">
                {versions.map((version) => (
                  <div key={version.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          v{version.version}
                        </Badge>
                        <span className="text-sm font-medium">
                          {version.changes_summary}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVersion(
                            selectedVersion?.id === version.id ? null : version
                          )}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => restoreVersion(version)}
                        >
                          <GitBranch className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>by {version.author}</span>
                      <span>{new Date(version.created_at).toLocaleString()}</span>
                    </div>
                    
                    {selectedVersion?.id === version.id && (
                      <div className="mt-3 border-t pt-3">
                        <MonacoEditor
                          value={version.code}
                          onChange={() => {}}
                          language={snippet.language}
                          height="200px"
                          readOnly
                          showLanguageSelector={false}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}