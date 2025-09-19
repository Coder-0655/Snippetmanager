"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Wand2,
  Copy,
  Check
} from "lucide-react";
import { CodeEditor, type CodeLanguage } from "@/components/code-editor";
import { CodeValidator } from "@/lib/code-validator";

interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning" | "info";
}

interface SmartCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: CodeLanguage;
  placeholder?: string;
  className?: string;
  enableValidation?: boolean;
  enableFormatting?: boolean;
}

export function SmartCodeEditor({
  value,
  onChange,
  language,
  placeholder,
  className,
  enableValidation = true,
  enableFormatting = true,
}: SmartCodeEditorProps) {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: ValidationError[];
    suggestions: string[];
  }>({ isValid: true, errors: [], suggestions: [] });
  const [isFormatting, setIsFormatting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (enableValidation && value.trim()) {
      const result = CodeValidator.validateSyntax(value, language);
      setValidationResult(result);
    } else {
      setValidationResult({ isValid: true, errors: [], suggestions: [] });
    }
  }, [value, language, enableValidation]);

  const handleFormat = () => {
    if (!enableFormatting || !value.trim()) return;

    setIsFormatting(true);
    try {
      const result = CodeValidator.formatCode(value, language);
      if (result.changed) {
        onChange(result.formattedCode);
      }
    } catch (error) {
      console.error("Failed to format code:", error);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getSeverityIcon = (severity: ValidationError["severity"]) => {
    switch (severity) {
      case "error":
        return <AlertTriangle className="h-3 w-3 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case "info":
        return <Info className="h-3 w-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: ValidationError["severity"]) => {
    switch (severity) {
      case "error":
        return "border-destructive";
      case "warning":
        return "border-warning";
      case "info":
        return "border-muted-foreground";
      default:
        return "border-border";
    }
  };

  const errorCount = validationResult.errors.filter(e => e.severity === "error").length;
  const warningCount = validationResult.errors.filter(e => e.severity === "warning").length;

  return (
    <div className="space-y-3">
      {/* Header with validation status and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {enableValidation && (
            <div className="flex items-center gap-2">
              {validationResult.isValid ? (
                <div className="flex items-center gap-1 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Valid</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {errorCount > 0 && (
                    <Badge className="bg-destructive text-destructive-foreground">
                      {errorCount} error{errorCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                  {warningCount > 0 && (
                    <Badge className="bg-warning text-warning-foreground">
                      {warningCount} warning{warningCount !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!value.trim()}
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copySuccess ? "Copied!" : "Copy code"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {enableFormatting && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFormat}
                    disabled={isFormatting || !value.trim()}
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Format code
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Code Editor */}
      <div className={`relative ${validationResult.isValid ? "" : getSeverityColor("error")}`}>
        <CodeEditor
          value={value}
          onChange={onChange}
          language={language}
          placeholder={placeholder}
          className={className}
        />
        
        {/* Validation overlay */}
        {enableValidation && !validationResult.isValid && (
          <div className="absolute top-2 right-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-destructive/10 p-1 rounded">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-sm">
                  <div className="space-y-1">
                    {validationResult.errors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-xs">
                        Line {error.line}: {error.message}
                      </div>
                    ))}
                    {validationResult.errors.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{validationResult.errors.length - 3} more...
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* Validation Details */}
      {enableValidation && (validationResult.errors.length > 0 || validationResult.suggestions.length > 0) && (
        <div className="space-y-2">
          {/* Errors and Warnings */}
          {validationResult.errors.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Issues:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {validationResult.errors.map((error, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 text-xs p-2 rounded border ${getSeverityColor(error.severity)} bg-muted/20`}
                  >
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">Line {error.line}, Column {error.column}:</span>{" "}
                      {error.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {validationResult.suggestions.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Suggestions:</h4>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {validationResult.suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs p-2 rounded border border-muted bg-muted/10"
                  >
                    <Info className="h-3 w-3 text-muted-foreground mt-0.5" />
                    <span className="text-muted-foreground">{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}