    
    // Default icon for unknown headers
    return iconUtils.render('📋', '•');
  }

  /**
   * Get contextual icon for object properties
   */
  private getPropertyIcon(propertyName: string): string {
    return this.getHeaderIcon(propertyName); // Reuse the same logic
  }

  /**
   * Get icon for list items with contextual awareness
   */
  private getListItemIcon(item: any, index: number): string {
    const itemStr = String(item).toLowerCase();
    
    // Check for specific patterns
    if (itemStr.includes('http')) {
      return iconUtils.render('🌐', '→');
    }
    if (itemStr.includes('.') && (itemStr.includes('/') || itemStr.includes('\\\\'))) {
      return iconUtils.render('📄', 'F');
    }
    if (itemStr.match(/^\d+$/)) {
      return iconUtils.render('🔢', '#');
    }
    if (itemStr.includes('error') || itemStr.includes('fail')) {
      return iconUtils.coloredIcon('❌', '✗', theme.error);
    }
    if (itemStr.includes('success') || itemStr.includes('ok')) {
      return iconUtils.coloredIcon('✅', '✓', theme.success);
    }
    
    // Sequential numbering for regular items
    const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    if (index < 10) {
      return iconUtils.render(numbers[index], `${index + 1}.`);
    }
    
    return iconUtils.render('▶️', '•');
  }

  /**
   * Format cell values with appropriate styling
   */
  private formatCellValue(value: any): string {
    if (value === null) {
      return theme.dim('null');
    }
    if (value === undefined) {
      return theme.dim('undefined');
    }
    if (typeof value === 'boolean') {
      const icon = value ? iconUtils.coloredIcon('✅', '✓', theme.success) : iconUtils.coloredIcon('❌', '✗', theme.error);
      return `${icon} ${value}`;
    }
    if (typeof value === 'number') {
      return theme.hex(theme.info, String(value));
    }
    if (typeof value === 'string') {
      // URL detection
      if (value.match(/^https?:\/\//)) {
        return `🔗 ${theme.hex(theme.info, value)}`;
      }
      // File path detection
      if (value.match(/^([A-Za-z]:|\/).*[/\\]/)) {
        return `📂 ${theme.hex(theme.success, value)}`;
      }
      // Email detection
      if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return `📧 ${theme.hex(theme.accent, value)}`;
      }
    }
    
    return String(value);
  }

  /**
   * Detect content type for better formatting
   */
  private detectContentType(content: string): 'json' | 'code' | 'url' | 'file' | 'error' | 'text' {
    const trimmed = content.trim();
    
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return 'json';
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return 'json';
    }
    if (trimmed.match(/^https?:\/\//)) {
      return 'url';
    }
    if (trimmed.match(/^([A-Za-z]:|\/).*[/\\]/)) {
      return 'file';
    }
    if (trimmed.match(/error|exception|failed|stack trace/i)) {
      return 'error';
    }
    if (trimmed.includes('function') || trimmed.includes('import') || trimmed.includes('=')) {
      return 'code';
    }
    
    return 'text';
  }

  /**
   * Get icon and label for content type
   */
  private getContentTypeIcon(contentType: string): { icon: string; label: string } {
    const types = {
      json: { icon: iconUtils.coloredIcon('📊', '{}', theme.info), label: 'JSON Data' },
      code: { icon: iconUtils.coloredIcon('💻', '<>', theme.secondary), label: 'Code Block' },
      url: { icon: iconUtils.coloredIcon('🔗', '→', theme.accent), label: 'URL Link' },
      file: { icon: iconUtils.coloredIcon('📁', 'F', theme.success), label: 'File Path' },
      error: { icon: iconUtils.coloredIcon(statusIcons.error.icon, statusIcons.error.fallback, theme.error), label: 'Error Message' },
      text: { icon: iconUtils.coloredIcon('📄', 'T', theme.text), label: 'Text Content' }
    };
    
    return types[contentType as keyof typeof types] || types.text;
  }

  /**
   * Highlight JSON syntax with colors
   */
  private highlightJsonSyntax(line: string): string {
    return line
      .replace(/"([^"]+)":/g, `${theme.hex(theme.accent, '"$1"')}:`) // Keys
      .replace(/:\s*"([^"]+)"/g, `: ${theme.hex(theme.success, '"$1"')}`) // String values  
      .replace(/:\s*(true|false)/g, `: ${theme.hex(theme.info, '$1')}`) // Booleans
      .replace(/:\s*(\d+(?:\.\d+)?)/g, `: ${theme.hex(theme.warning, '$1')}`) // Numbers
      .replace(/([{}\[\],])/g, theme.hex(theme.dim, '$1')); // Punctuation
  }
}