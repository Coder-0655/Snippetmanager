"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Plus, 
  Search, 
  Star, 
  Copy, 
  Download,
  Code,
  Layers,
  Zap,
  Filter,
  BookOpen
} from "lucide-react";
import { MonacoEditor } from "@/components/monaco-editor";

interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  category: string;
  tags: string[];
  usage_count?: number;
  is_favorite?: boolean;
  is_built_in?: boolean;
  variables?: TemplateVariable[];
}

interface TemplateVariable {
  name: string;
  description: string;
  default_value?: string;
  type: 'string' | 'number' | 'boolean';
}

interface SmartTemplatesProps {
  onUseTemplate: (code: string, language: string) => void;
  currentLanguage?: string;
}

const BUILT_IN_TEMPLATES: CodeTemplate[] = [
  {
    id: "react-component",
    title: "React Functional Component",
    description: "Modern React component with TypeScript and hooks",
    code: `import React, { useState, useEffect } from 'react';

interface {{ComponentName}}Props {
  // Define your props here
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({ }) => {
  const [state, setState] = useState();

  useEffect(() => {
    // Component logic here
  }, []);

  return (
    <div className="{{className}}">
      <h1>{{ComponentName}}</h1>
      {/* Component content */}
    </div>
  );
};`,
    language: "typescript",
    category: "React",
    tags: ["react", "typescript", "component", "hooks"],
    is_built_in: true,
    variables: [
      { name: "ComponentName", description: "Name of the component", default_value: "MyComponent", type: "string" },
      { name: "className", description: "CSS class name", default_value: "component", type: "string" }
    ]
  },
  {
    id: "express-route",
    title: "Express.js Route Handler",
    description: "Express route with middleware and error handling",
    code: `import { Request, Response, NextFunction } from 'express';

// {{description}}
export const {{routeName}} = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request
    const { {{paramName}} } = req.{{requestType}};
    
    if (!{{paramName}}) {
      return res.status(400).json({ 
        error: '{{paramName}} is required' 
      });
    }

    // Business logic here
    const result = await {{serviceName}}.{{methodName}}({{paramName}});
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};`,
    language: "typescript",
    category: "Backend",
    tags: ["express", "typescript", "api", "route", "middleware"],
    is_built_in: true,
    variables: [
      { name: "routeName", description: "Route handler function name", default_value: "handleRequest", type: "string" },
      { name: "description", description: "Route description", default_value: "Handle request", type: "string" },
      { name: "paramName", description: "Parameter name", default_value: "id", type: "string" },
      { name: "requestType", description: "Request type (body/params/query)", default_value: "params", type: "string" },
      { name: "serviceName", description: "Service name", default_value: "userService", type: "string" },
      { name: "methodName", description: "Service method name", default_value: "getById", type: "string" }
    ]
  },
  {
    id: "python-class",
    title: "Python Class with Documentation",
    description: "Python class with proper documentation and type hints",
    code: `from typing import Optional, List, Any
from dataclasses import dataclass

@dataclass
class {{ClassName}}:
    """
    {{description}}
    
    Attributes:
        {{attribute_name}} ({{attribute_type}}): {{attribute_description}}
    """
    {{attribute_name}}: {{attribute_type}}
    
    def __init__(self, {{parameter_name}}: {{parameter_type}}) -> None:
        """
        Initialize {{ClassName}}.
        
        Args:
            {{parameter_name}}: {{parameter_description}}
        """
        self.{{attribute_name}} = {{parameter_name}}
    
    def {{method_name}}(self) -> {{return_type}}:
        """
        {{method_description}}
        
        Returns:
            {{return_description}}
        """
        # Method implementation here
        return self.{{attribute_name}}
    
    def __str__(self) -> str:
        """String representation of {{ClassName}}."""
        return f"{{ClassName}}({{attribute_name}}={self.{{attribute_name}}})"`,
    language: "python",
    category: "Python",
    tags: ["python", "class", "dataclass", "typing", "documentation"],
    is_built_in: true,
    variables: [
      { name: "ClassName", description: "Name of the class", default_value: "MyClass", type: "string" },
      { name: "description", description: "Class description", default_value: "A sample class", type: "string" },
      { name: "attribute_name", description: "Attribute name", default_value: "value", type: "string" },
      { name: "attribute_type", description: "Attribute type", default_value: "str", type: "string" },
      { name: "attribute_description", description: "Attribute description", default_value: "The main value", type: "string" },
      { name: "parameter_name", description: "Constructor parameter name", default_value: "value", type: "string" },
      { name: "parameter_type", description: "Constructor parameter type", default_value: "str", type: "string" },
      { name: "parameter_description", description: "Parameter description", default_value: "Initial value", type: "string" },
      { name: "method_name", description: "Method name", default_value: "get_value", type: "string" },
      { name: "method_description", description: "Method description", default_value: "Get the current value", type: "string" },
      { name: "return_type", description: "Return type", default_value: "str", type: "string" },
      { name: "return_description", description: "Return description", default_value: "The current value", type: "string" }
    ]
  },
  {
    id: "async-function",
    title: "Async Function with Error Handling",
    description: "Async function with proper error handling and typing",
    code: `/**
 * {{description}}
 * @param {{paramName}} - {{paramDescription}}
 * @returns Promise<{{returnType}}> - {{returnDescription}}
 */
export async function {{functionName}}({{paramName}}: {{paramType}}): Promise<{{returnType}}> {
  try {
    // Validate input
    if (!{{paramName}}) {
      throw new Error('{{paramName}} is required');
    }

    // Async operation here
    const result = await {{asyncOperation}}({{paramName}});
    
    // Process result
    return result;
  } catch (error) {
    console.error(\`Error in {{functionName}}:\`, error);
    throw new Error(\`Failed to {{operationDescription}}: \${error.message}\`);
  }
}`,
    language: "typescript",
    category: "Functions",
    tags: ["typescript", "async", "error-handling", "function"],
    is_built_in: true,
    variables: [
      { name: "functionName", description: "Function name", default_value: "processData", type: "string" },
      { name: "description", description: "Function description", default_value: "Process data asynchronously", type: "string" },
      { name: "paramName", description: "Parameter name", default_value: "data", type: "string" },
      { name: "paramType", description: "Parameter type", default_value: "string", type: "string" },
      { name: "paramDescription", description: "Parameter description", default_value: "Data to process", type: "string" },
      { name: "returnType", description: "Return type", default_value: "string", type: "string" },
      { name: "returnDescription", description: "Return description", default_value: "Processed data", type: "string" },
      { name: "asyncOperation", description: "Async operation call", default_value: "apiCall", type: "string" },
      { name: "operationDescription", description: "Operation description", default_value: "process data", type: "string" }
    ]
  }
];

const CATEGORIES = ["All", "React", "Backend", "Python", "Functions", "Algorithms", "Utils"];

export function SmartTemplates({ onUseTemplate, currentLanguage }: SmartTemplatesProps) {
  const [templates, setTemplates] = useState<CodeTemplate[]>(BUILT_IN_TEMPLATES);
  const [filteredTemplates, setFilteredTemplates] = useState<CodeTemplate[]>(BUILT_IN_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CodeTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, selectedCategory, showFavoritesOnly, favorites, templates]);

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by language (if currentLanguage is provided)
    if (currentLanguage) {
      filtered = filtered.filter(template => 
        template.language === currentLanguage ||
        template.language === "plaintext"
      );
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(template => favorites.has(template.id));
    }

    // Sort by usage count and favorites
    filtered.sort((a, b) => {
      if (favorites.has(a.id) && !favorites.has(b.id)) return -1;
      if (!favorites.has(a.id) && favorites.has(b.id)) return 1;
      return (b.usage_count || 0) - (a.usage_count || 0);
    });

    setFilteredTemplates(filtered);
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(templateId)) {
        newFavorites.delete(templateId);
      } else {
        newFavorites.add(templateId);
      }
      return newFavorites;
    });
  };

  const applyTemplate = (template: CodeTemplate) => {
    if (template.variables && template.variables.length > 0) {
      // Initialize variable values with defaults
      const initialValues: Record<string, string> = {};
      template.variables.forEach(variable => {
        initialValues[variable.name] = variable.default_value || "";
      });
      setVariableValues(initialValues);
      setSelectedTemplate(template);
    } else {
      // Use template directly
      onUseTemplate(template.code, template.language);
      
      // Update usage count
      setTemplates(prev => prev.map(t => 
        t.id === template.id 
          ? { ...t, usage_count: (t.usage_count || 0) + 1 }
          : t
      ));
    }
  };

  const applyTemplateWithVariables = () => {
    if (!selectedTemplate) return;

    let processedCode = selectedTemplate.code;
    
    // Replace variables with values
    Object.entries(variableValues).forEach(([variable, value]) => {
      const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      processedCode = processedCode.replace(regex, value);
    });

    onUseTemplate(processedCode, selectedTemplate.language);
    
    // Update usage count
    setTemplates(prev => prev.map(t => 
      t.id === selectedTemplate.id 
        ? { ...t, usage_count: (t.usage_count || 0) + 1 }
        : t
    ));

    // Close template customization
    setSelectedTemplate(null);
    setVariableValues({});
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Smart Templates</h2>
        </div>
        <Badge variant="secondary" className="text-xs">
          {filteredTemplates.length} templates
        </Badge>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            variant={showFavoritesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="flex items-center gap-1"
          >
            <Star className="h-3 w-3" />
            Favorites
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {CATEGORIES.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="group hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm font-medium truncate">
                    {template.title}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Star 
                      className={`h-3 w-3 ${
                        favorites.has(template.id) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applyTemplate(template)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    <Code className="h-2.5 w-2.5 mr-1" />
                    {template.language}
                  </Badge>
                  {template.is_built_in && (
                    <Badge variant="secondary" className="text-xs">
                      <BookOpen className="h-2.5 w-2.5 mr-1" />
                      Built-in
                    </Badge>
                  )}
                  {template.usage_count && template.usage_count > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-2.5 w-2.5 mr-1" />
                      {template.usage_count}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => applyTemplate(template)}
                  className="h-6 text-xs"
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No templates found</p>
          <p className="text-xs">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Template Customization Modal */}
      {selectedTemplate && (
        <Card className="fixed inset-4 z-50 bg-background border shadow-lg overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Customize Template: {selectedTemplate.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
            <p className="text-sm text-muted-foreground">
              {selectedTemplate.description}
            </p>
            
            {/* Variable Inputs */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Template Variables:</h4>
              {selectedTemplate.variables?.map((variable) => (
                <div key={variable.name} className="space-y-1">
                  <label className="text-xs font-medium">
                    {variable.name}
                    {variable.description && (
                      <span className="text-muted-foreground ml-1">
                        - {variable.description}
                      </span>
                    )}
                  </label>
                  <Input
                    value={variableValues[variable.name] || ""}
                    onChange={(e) => setVariableValues(prev => ({
                      ...prev,
                      [variable.name]: e.target.value
                    }))}
                    placeholder={variable.default_value}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Preview:</h4>
              <div className="max-h-64 border rounded">
                <MonacoEditor
                  value={selectedTemplate.code}
                  onChange={() => {}}
                  language={selectedTemplate.language}
                  height="200px"
                  readOnly
                  showLanguageSelector={false}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={applyTemplateWithVariables} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Apply Template
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedTemplate(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}