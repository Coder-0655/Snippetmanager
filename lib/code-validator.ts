import type { CodeLanguage } from "@/components/code-editor";

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    line: number;
    column: number;
    message: string;
    severity: "error" | "warning" | "info";
  }>;
  suggestions: string[];
}

interface FormatResult {
  formattedCode: string;
  changed: boolean;
}

export class CodeValidator {
  /**
   * Basic syntax validation for common languages
   */
  static validateSyntax(code: string, language: CodeLanguage): ValidationResult {
    const errors: ValidationResult["errors"] = [];
    const suggestions: string[] = [];

    const lines = code.split("\n");

    switch (language) {
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
        return this.validateJavaScript(lines, language === "ts" || language === "tsx");
      
      case "python":
        return this.validatePython(lines);
      
      case "json":
        return this.validateJSON(code);
      
      case "bash":
        return this.validateBash(lines);
      
      default:
        return { isValid: true, errors: [], suggestions: [] };
    }
  }

  private static validateJavaScript(lines: string[], isTypeScript: boolean): ValidationResult {
    const errors: ValidationResult["errors"] = [];
    const suggestions: string[] = [];

    let braceLevel = 0;
    let parenLevel = 0;
    let bracketLevel = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNumber = index + 1;

      // Skip comments and empty lines
      if (trimmed.startsWith("//") || trimmed.startsWith("/*") || !trimmed) {
        return;
      }

      // Check for unclosed strings
      const stringPattern = /(['"`])((?:(?!\1)[^\\]|\\.)*)(\1?)/g;
      let match;
      while ((match = stringPattern.exec(line)) !== null) {
        if (!match[3]) {
          errors.push({
            line: lineNumber,
            column: match.index + 1,
            message: "Unclosed string literal",
            severity: "error",
          });
        }
      }

      // Track brackets
      for (const char of line) {
        switch (char) {
          case "{":
            braceLevel++;
            break;
          case "}":
            braceLevel--;
            if (braceLevel < 0) {
              errors.push({
                line: lineNumber,
                column: line.indexOf(char) + 1,
                message: "Unexpected closing brace",
                severity: "error",
              });
            }
            break;
          case "(":
            parenLevel++;
            break;
          case ")":
            parenLevel--;
            if (parenLevel < 0) {
              errors.push({
                line: lineNumber,
                column: line.indexOf(char) + 1,
                message: "Unexpected closing parenthesis",
                severity: "error",
              });
            }
            break;
          case "[":
            bracketLevel++;
            break;
          case "]":
            bracketLevel--;
            if (bracketLevel < 0) {
              errors.push({
                line: lineNumber,
                column: line.indexOf(char) + 1,
                message: "Unexpected closing bracket",
                severity: "error",
              });
            }
            break;
        }
      }

      // Check for common issues
      if (trimmed.includes("console.log") && !trimmed.includes("//")) {
        suggestions.push(`Line ${lineNumber}: Consider removing console.log before production`);
      }

      if (trimmed.includes("var ")) {
        suggestions.push(`Line ${lineNumber}: Consider using 'let' or 'const' instead of 'var'`);
      }

      if (trimmed.includes("==") && !trimmed.includes("===")) {
        suggestions.push(`Line ${lineNumber}: Consider using '===' for strict equality`);
      }

      // TypeScript specific checks
      if (isTypeScript) {
        if (trimmed.includes(": any")) {
          suggestions.push(`Line ${lineNumber}: Consider using more specific types instead of 'any'`);
        }
      }
    });

    // Check for unclosed brackets at the end
    if (braceLevel > 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: `${braceLevel} unclosed brace(s)`,
        severity: "error",
      });
    }
    if (parenLevel > 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: `${parenLevel} unclosed parenthesis(es)`,
        severity: "error",
      });
    }
    if (bracketLevel > 0) {
      errors.push({
        line: lines.length,
        column: 1,
        message: `${bracketLevel} unclosed bracket(s)`,
        severity: "error",
      });
    }

    return {
      isValid: errors.filter(e => e.severity === "error").length === 0,
      errors,
      suggestions,
    };
  }

  private static validatePython(lines: string[]): ValidationResult {
    const errors: ValidationResult["errors"] = [];
    const suggestions: string[] = [];

    let indentLevel = 0;
    const indentStack: number[] = [0];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (trimmed.startsWith("#") || !trimmed) {
        return;
      }

      // Check indentation
      const leadingSpaces = line.length - line.trimStart().length;
      if (leadingSpaces % 4 !== 0 && leadingSpaces > 0) {
        suggestions.push(`Line ${lineNumber}: Consider using 4 spaces for indentation`);
      }

      // Check for common syntax issues
      if (trimmed.endsWith(":")) {
        // This line should increase indentation
        indentStack.push(leadingSpaces + 4);
      } else if (leadingSpaces < indentStack[indentStack.length - 1] && leadingSpaces >= 0) {
        // Dedentation
        while (indentStack.length > 1 && indentStack[indentStack.length - 1] > leadingSpaces) {
          indentStack.pop();
        }
        if (indentStack[indentStack.length - 1] !== leadingSpaces) {
          errors.push({
            line: lineNumber,
            column: 1,
            message: "Indentation error",
            severity: "error",
          });
        }
      }

      // Check for print statements
      if (trimmed.includes("print(")) {
        suggestions.push(`Line ${lineNumber}: Consider using logging instead of print for production code`);
      }
    });

    return {
      isValid: errors.filter(e => e.severity === "error").length === 0,
      errors,
      suggestions,
    };
  }

  private static validateJSON(code: string): ValidationResult {
    const errors: ValidationResult["errors"] = [];
    
    try {
      JSON.parse(code);
    } catch (error) {
      if (error instanceof Error) {
        // Try to extract line number from error message
        const match = error.message.match(/line (\d+)/);
        const line = match ? parseInt(match[1]) : 1;
        
        errors.push({
          line,
          column: 1,
          message: error.message,
          severity: "error",
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions: [],
    };
  }

  private static validateBash(lines: string[]): ValidationResult {
    const errors: ValidationResult["errors"] = [];
    const suggestions: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNumber = index + 1;

      // Skip comments and empty lines
      if (trimmed.startsWith("#") || !trimmed) {
        return;
      }

      // Check for unquoted variables
      const variablePattern = /\$\w+/g;
      let match;
      while ((match = variablePattern.exec(line)) !== null) {
        const before = line[match.index - 1];
        const after = line[match.index + match[0].length];
        
        if (before !== '"' && before !== "'" && after !== '"' && after !== "'") {
          suggestions.push(`Line ${lineNumber}: Consider quoting variable ${match[0]}`);
        }
      }

      // Check for missing shebang
      if (index === 0 && !trimmed.startsWith("#!")) {
        suggestions.push("Consider adding a shebang line (e.g., #!/bin/bash)");
      }
    });

    return {
      isValid: errors.filter(e => e.severity === "error").length === 0,
      errors,
      suggestions,
    };
  }

  /**
   * Basic code formatting
   */
  static formatCode(code: string, language: CodeLanguage): FormatResult {
    const originalCode = code;
    let formattedCode = code;

    switch (language) {
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
        formattedCode = this.formatJavaScript(code);
        break;
      
      case "json":
        formattedCode = this.formatJSON(code);
        break;
      
      case "python":
        formattedCode = this.formatPython(code);
        break;
      
      default:
        break;
    }

    return {
      formattedCode,
      changed: formattedCode !== originalCode,
    };
  }

  private static formatJavaScript(code: string): string {
    const lines = code.split("\n");
    let indentLevel = 0;
    const indentSize = 2;

    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";

      // Decrease indent for closing brackets
      if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const formatted = " ".repeat(indentLevel * indentSize) + trimmed;

      // Increase indent for opening brackets
      if (trimmed.endsWith("{") || trimmed.endsWith("[") || trimmed.endsWith("(")) {
        indentLevel++;
      }

      return formatted;
    });

    return formattedLines.join("\n");
  }

  private static formatJSON(code: string): string {
    try {
      const parsed = JSON.parse(code);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return code;
    }
  }

  private static formatPython(code: string): string {
    const lines = code.split("\n");
    let indentLevel = 0;
    const indentSize = 4;

    const formattedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";

      // Handle dedentation
      if (trimmed.startsWith("except") || trimmed.startsWith("elif") || 
          trimmed.startsWith("else") || trimmed.startsWith("finally")) {
        const tempIndent = Math.max(0, indentLevel - 1);
        const formatted = " ".repeat(tempIndent * indentSize) + trimmed;
        if (trimmed.endsWith(":")) {
          indentLevel = tempIndent + 1;
        }
        return formatted;
      }

      const formatted = " ".repeat(indentLevel * indentSize) + trimmed;

      // Increase indent for lines ending with colon
      if (trimmed.endsWith(":")) {
        indentLevel++;
      }

      return formatted;
    });

    return formattedLines.join("\n");
  }
}