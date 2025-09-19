"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Wand2, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Code,
  FileText,
  Search,
  Sparkles,
  Send,
  Loader2
} from "lucide-react";
import { MonacoEditor } from "@/components/monaco-editor";

interface AIAssistantProps {
  code: string;
  language: string;
  onCodeChange: (code: string) => void;
  onLanguageChange?: (language: string) => void;
}

interface AISuggestion {
  type: 'error' | 'warning' | 'improvement' | 'explanation';
  message: string;
  line?: number;
  severity: 'low' | 'medium' | 'high';
  suggestion?: string;
}

export function AICodeAssistant({ 
  code, 
  language, 
  onCodeChange, 
  onLanguageChange 
}: AIAssistantProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  // Mock AI analysis function (replace with actual AI service)
  const analyzeCode = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock suggestions based on code analysis
    const mockSuggestions: AISuggestion[] = [];
    
    if (!code.trim()) {
      mockSuggestions.push({
        type: 'warning',
        message: 'No code to analyze',
        severity: 'low',
        suggestion: 'Add some code to get AI-powered suggestions'
      });
    } else {
      // Basic analysis patterns
      if (code.includes('console.log')) {
        mockSuggestions.push({
          type: 'improvement',
          message: 'Consider using a proper logging library instead of console.log',
          severity: 'medium',
          suggestion: 'Replace with winston, pino, or similar logging library'
        });
      }
      
      if (code.includes('var ')) {
        mockSuggestions.push({
          type: 'improvement',
          message: 'Use const or let instead of var',
          severity: 'medium',
          suggestion: 'Modern JavaScript prefers const for immutable values and let for mutable ones'
        });
      }
      
      if (code.includes('==') && !code.includes('===')) {
        mockSuggestions.push({
          type: 'error',
          message: 'Use strict equality (===) instead of loose equality (==)',
          severity: 'high',
          suggestion: 'Replace == with === to avoid type coercion issues'
        });
      }
      
      if (code.split('\n').length > 20) {
        mockSuggestions.push({
          type: 'improvement',
          message: 'Consider breaking this into smaller functions',
          severity: 'medium',
          suggestion: 'Large functions are harder to maintain and test'
        });
      }
      
      // Language-specific suggestions
      if (language === 'python' && code.includes('import *')) {
        mockSuggestions.push({
          type: 'warning',
          message: 'Avoid wildcard imports',
          severity: 'medium',
          suggestion: 'Import specific functions/classes to avoid namespace pollution'
        });
      }
      
      if ((language === 'javascript' || language === 'typescript') && !code.includes('async') && code.includes('fetch')) {
        mockSuggestions.push({
          type: 'error',
          message: 'Fetch should be used with async/await or .then()',
          severity: 'high',
          suggestion: 'Add proper promise handling to avoid unhandled promises'
        });
      }
    }
    
    setSuggestions(mockSuggestions);
    setIsAnalyzing(false);
  };

  // Mock AI query function (replace with actual AI service)
  const queryAI = async () => {
    if (!query.trim()) return;
    
    setIsQuerying(true);
    
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock AI responses based on query
    let mockResponse = "";
    
    if (query.toLowerCase().includes('optimize')) {
      mockResponse = `Here are some optimization suggestions for your ${language} code:

1. **Performance**: Consider using memoization for expensive calculations
2. **Memory**: Avoid creating unnecessary objects in loops
3. **Readability**: Use descriptive variable names and add comments
4. **Structure**: Break complex functions into smaller, focused ones

Would you like me to analyze specific parts of your code?`;
    } else if (query.toLowerCase().includes('explain')) {
      mockResponse = `This ${language} code appears to be implementing:

• **Main functionality**: [AI would analyze the code's purpose]
• **Key patterns**: [AI would identify design patterns used]
• **Dependencies**: [AI would list external dependencies]
• **Complexity**: [AI would assess algorithmic complexity]

The code follows ${language === 'typescript' ? 'TypeScript' : language} best practices in most areas. Let me know if you'd like deeper analysis of any specific section!`;
    } else if (query.toLowerCase().includes('error') || query.toLowerCase().includes('debug')) {
      mockResponse = `I've analyzed your code for potential issues:

🔍 **Common Error Patterns**:
• Check for null/undefined values before accessing properties
• Ensure all promises are properly handled
• Verify variable scope and hoisting issues

🛠 **Debugging Tips**:
• Add console.log statements at key points
• Use debugger statements for breakpoints
• Check browser/console for runtime errors

Would you like me to suggest specific debugging strategies for your code?`;
    } else {
      mockResponse = `I understand you're asking about: "${query}"

Based on your ${language} code, here's what I can help with:
• Code review and optimization suggestions
• Bug detection and debugging assistance  
• Best practices and design patterns
• Performance improvements
• Code explanation and documentation

Feel free to ask more specific questions about your code!`;
    }
    
    setResponse(mockResponse);
    setIsQuerying(false);
  };

  const applySuggestion = (suggestion: AISuggestion) => {
    if (!suggestion.suggestion) return;
    
    // Mock code transformation based on suggestion
    let newCode = code;
    
    if (suggestion.message.includes('console.log')) {
      newCode = newCode.replace(/console\.log/g, '// TODO: Replace with proper logging');
    } else if (suggestion.message.includes('var ')) {
      newCode = newCode.replace(/var /g, 'const ');
    } else if (suggestion.message.includes('==')) {
      newCode = newCode.replace(/==/g, '===');
    }
    
    onCodeChange(newCode);
  };

  const getSeverityColor = (severity: AISuggestion['severity']) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: AISuggestion['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'improvement': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'explanation': return <FileText className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Code Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={analyzeCode} 
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Code className="h-3 w-3" />
              {language.toUpperCase()}
            </Badge>
          </div>

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">AI Suggestions:</h4>
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-lg ${getSeverityColor(suggestion.severity)}`}
                >
                  <div className="flex items-start gap-2">
                    {getTypeIcon(suggestion.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{suggestion.message}</p>
                      {suggestion.suggestion && (
                        <p className="text-xs opacity-80">{suggestion.suggestion}</p>
                      )}
                    </div>
                    {suggestion.type !== 'explanation' && suggestion.suggestion && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => applySuggestion(suggestion)}
                        className="h-6 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Chat Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ask AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about optimization, explain code, find errors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && queryAI()}
              className="flex-1"
            />
            <Button 
              onClick={queryAI} 
              disabled={isQuerying || !query.trim()}
              size="sm"
            >
              {isQuerying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {response && (
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-start gap-2 mb-2">
                <Bot className="h-4 w-4 text-primary mt-1" />
                <span className="font-medium text-sm">AI Assistant</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{response}</div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("Optimize this code for better performance");
                queryAI();
              }}
              className="text-xs"
            >
              <Search className="h-3 w-3 mr-1" />
              Optimize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("Explain what this code does");
                queryAI();
              }}
              className="text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              Explain
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuery("Find potential errors and bugs");
                queryAI();
              }}
              className="text-xs"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Debug
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}