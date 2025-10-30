'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSnippets } from '@/lib/snippets'
import { getCommunitySnippets, toggleSnippetPublic } from '@/lib/community'
import { CheckCircle2, XCircle, Globe, Lock, AlertCircle, Loader2 } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'pending'
  message: string
}

export default function TestCommunityPage() {
  const { user } = useUser()
  const [tests, setTests] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const [userSnippets, setUserSnippets] = useState<any[]>([])
  const [communitySnippets, setCommunitySnippets] = useState<any[]>([])

  const addTest = (name: string, status: 'pass' | 'fail' | 'pending', message: string) => {
    setTests(prev => [...prev, { name, status, message }])
  }

  const runTests = async () => {
    if (!user) {
      addTest('User Check', 'fail', 'User not authenticated')
      return
    }

    setTests([])
    setLoading(true)

    try {
      // Test 1: Fetch user snippets
      addTest('Fetch User Snippets', 'pending', 'Loading...')
      const snippets = await getSnippets(user.id)
      setUserSnippets(snippets)
      
      if (snippets) {
        addTest('Fetch User Snippets', 'pass', `Found ${snippets.length} snippets`)
        
        // Check if is_public field exists
        if (snippets.length > 0) {
          const hasIsPublic = 'is_public' in snippets[0]
          addTest(
            'Check is_public Field', 
            hasIsPublic ? 'pass' : 'fail',
            hasIsPublic ? 'is_public field exists in snippets' : 'is_public field is missing!'
          )
        }
      } else {
        addTest('Fetch User Snippets', 'fail', 'Failed to fetch snippets')
      }

      // Test 2: Fetch community snippets
      addTest('Fetch Community Snippets', 'pending', 'Loading...')
      const community = await getCommunitySnippets(50, 0)
      setCommunitySnippets(community)
      
      if (community) {
        addTest('Fetch Community Snippets', 'pass', `Found ${community.length} public snippets`)
      } else {
        addTest('Fetch Community Snippets', 'fail', 'Failed to fetch community snippets')
      }

      // Test 3: Check if any snippets are public
      const publicSnippets = snippets.filter((s: any) => s.is_public === true)
      addTest(
        'Public Snippets Count',
        'pass',
        `You have ${publicSnippets.length} public snippet(s) out of ${snippets.length} total`
      )

      // Test 4: Verify community table sync
      if (publicSnippets.length > 0 && community.length > 0) {
        const userPublicInCommunity = community.filter((c: any) => c.user_id === user.id)
        const syncStatus = userPublicInCommunity.length === publicSnippets.length
        addTest(
          'Community Sync Check',
          syncStatus ? 'pass' : 'fail',
          syncStatus 
            ? `All ${publicSnippets.length} public snippets are in community table`
            : `Mismatch: ${publicSnippets.length} public snippets vs ${userPublicInCommunity.length} in community`
        )
      }

    } catch (error) {
      addTest('Test Suite', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleSnippetStatus = async (snippetId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      const success = await toggleSnippetPublic(snippetId, newStatus)
      
      if (success) {
        // Refresh data
        const snippets = await getSnippets(user?.id)
        setUserSnippets(snippets)
        
        const community = await getCommunitySnippets(50, 0)
        setCommunitySnippets(community)
        
        addTest(
          'Toggle Snippet',
          'pass',
          `Successfully ${newStatus ? 'published' : 'unpublished'} snippet`
        )
      } else {
        addTest('Toggle Snippet', 'fail', 'Failed to toggle snippet status')
      }
    } catch (error) {
      addTest('Toggle Snippet', 'fail', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community System Test</h1>
          <p className="text-muted-foreground mt-1">
            Verify that the public snippets and community features are working correctly
          </p>
        </div>
        <Button onClick={runTests} disabled={loading || !user}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            'Run Tests'
          )}
        </Button>
      </div>

      {/* Test Results */}
      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              {tests.filter(t => t.status === 'pass').length} passed, 
              {tests.filter(t => t.status === 'fail').length} failed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tests.map((test, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                {test.status === 'pass' && <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />}
                {test.status === 'fail' && <XCircle className="h-5 w-5 text-red-500 mt-0.5" />}
                {test.status === 'pending' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin mt-0.5" />}
                <div className="flex-1">
                  <div className="font-medium">{test.name}</div>
                  <div className="text-sm text-muted-foreground">{test.message}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* User Snippets */}
      {userSnippets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Snippets ({userSnippets.length})</CardTitle>
            <CardDescription>Click the toggle button to make snippets public/private</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {userSnippets.map((snippet: any) => (
              <div key={snippet.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium">{snippet.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {snippet.language} • {new Date(snippet.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={snippet.is_public ? 'default' : 'secondary'}>
                    {snippet.is_public ? (
                      <>
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleSnippetStatus(snippet.id, snippet.is_public)}
                  >
                    Toggle
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Community Snippets */}
      {communitySnippets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Community Snippets ({communitySnippets.length})</CardTitle>
            <CardDescription>Public snippets from all users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {communitySnippets.map((snippet: any) => (
              <div key={snippet.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex-1">
                  <div className="font-medium">{snippet.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {snippet.language} • by {snippet.author_name || 'Unknown'} • {snippet.likes_count} likes • {snippet.views_count} views
                  </div>
                </div>
                <Badge variant={snippet.user_id === user?.id ? 'default' : 'secondary'}>
                  {snippet.user_id === user?.id ? 'Your snippet' : 'Other user'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How to Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>1. Run Tests:</strong> Click the "Run Tests" button to check if everything is working</p>
          <p><strong>2. Toggle Snippets:</strong> Use the toggle button on your snippets to make them public or private</p>
          <p><strong>3. Verify Community:</strong> Check that public snippets appear in the community section</p>
          <p><strong>4. Cross-Account Test:</strong> Open another account and verify you can see public snippets from this account</p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-blue-900 dark:text-blue-100">
              <strong>Expected Behavior:</strong>
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-blue-800 dark:text-blue-200">
              <li>All snippets have an is_public field (default: false)</li>
              <li>Public snippets (is_public = true) appear in the community table</li>
              <li>Private snippets (is_public = false) are removed from the community table</li>
              <li>Community snippets are visible to all users</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
