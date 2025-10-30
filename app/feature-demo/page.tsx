'use client'

import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Globe, Lock, Image, Video } from 'lucide-react'
import { MediaUpload } from '@/components/media-upload'

export default function FeatureDemoPage() {
  const { user } = useUser()
  const [isPublic, setIsPublic] = useState(true)
  const [media, setMedia] = useState<{url: string, type: 'image' | 'video', name: string}[]>([])

  const handleTogglePrivacy = (checked: boolean) => {
    setIsPublic(checked)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">New Features Demo</h1>
        <p className="text-muted-foreground">
          Testing snippet visibility and media uploads
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Snippet Visibility Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-green-500" />
              Snippet Visibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium">Snippet Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    {isPublic 
                      ? "Snippet will be public in community" 
                      : "Snippet will be private"
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isPublic ? 'text-muted-foreground' : 'font-medium'}`}>
                    Private
                  </span>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={handleTogglePrivacy}
                  />
                  <span className={`text-sm ${isPublic ? 'font-medium' : 'text-muted-foreground'}`}>
                    Public
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                {isPublic ? (
                  <>
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="text-green-600">Public - Visible in community</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600">Private - Only visible to you</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                Control who can see your snippets by toggling between public and private visibility.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Media Upload Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5 text-blue-500" />
              Media Attachments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add images or videos to provide visual context for your code snippets
              </p>
              
              <MediaUpload
                value={media}
                onChange={setMedia}
                maxFiles={3}
                maxFileSize={5}
                disabled={false}
              />

              {media.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Attached Media:</h4>
                  <div className="space-y-1">
                    {media.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {item.type === 'image' ? (
                          <Image className="h-3 w-3 text-blue-500" />
                        ) : (
                          <Video className="h-3 w-3 text-purple-500" />
                        )}
                        <span className="truncate">{item.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>✨ New Features Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Snippet Visibility</h3>
                <p className="text-sm text-muted-foreground">
                  Toggle between public and private
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Image className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Media Attachments</h3>
                <p className="text-sm text-muted-foreground">
                  Add images/videos to snippets
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Try it:</strong> Toggle the privacy switch above to control snippet visibility!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}