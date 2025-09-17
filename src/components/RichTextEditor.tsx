import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Code, Link, Image, List, Quote, Heading1, Heading2, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface RichTextEditorProps {
  initialContent?: string;
  onChange: (content: string, rawContent: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent = '',
  onChange,
  onImageUpload
}) => {
  const [activeTab, setActiveTab] = useState('visual');
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save and restore cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreCursorPosition = (range: Range) => {
    const selection = window.getSelection();
    if (selection && range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const execCommand = (command: string, value: string | null = null) => {
    const range = saveCursorPosition();
    document.execCommand(command, false, value);
    updateContent();
    if (range) {
      setTimeout(() => restoreCursorPosition(range), 0);
    }
  };

  const updateContent = () => {
    if (editorRef.current) {
      // IMMEDIATE SAFETY CHECK: Before any processing - allow large content for 10,000+ words
      const preCheck = editorRef.current.innerHTML;
      if (preCheck && preCheck.length > 25000000) { // 25MB immediate safety check (very generous)
        console.error('🚨🚨🚨 IMMEDIATE SAFETY: Content extremely large before processing:', preCheck.length);
        editorRef.current.innerHTML = '<p>Content automatically reset - exceeded maximum safe limits (25MB)</p>';
        alert('Content size exceeded maximum safe limits. Please use smaller content or break into multiple posts.');
        return;
      }
      
      // Throttle updates to prevent infinite loops
      const now = Date.now();
      if (now - lastUpdateTime < 100) { // Minimum 100ms between updates
        console.log('🛑 RichTextEditor - Update throttled');
        return;
      }
      setLastUpdateTime(now);
      
      let html = editorRef.current.innerHTML;
      
      console.log('🔄 RichTextEditor - Processing content, size:', html.length);
      
      // Only check for content duplication patterns (common in infinite loops) - no size limits
      if (html.length > 1000000) { // Only check for very large content (1MB+)
        const contentPreview = html.substring(0, 100);
        const duplicateMatches = (html.match(new RegExp(contentPreview.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        if (duplicateMatches > 10) {
          console.error('🚨 RichTextEditor - Detected content duplication, preventing save');
          console.error('🚨 Duplicate pattern detected:', duplicateMatches, 'times');
          alert('Content duplication detected (likely editor bug). Please refresh the page and try again.');
          return;
        }
      }
      
      // Clean up the HTML but preserve important formatting
      // First normalize div elements to paragraphs
      html = html
        .replace(/<div><br><\/div>/g, '<p><br></p>') // Empty divs with br
        .replace(/<div><\/div>/g, '<p><br></p>') // Empty divs
        .replace(/<div>/g, '<p>') // Convert div starts to paragraphs
        .replace(/<\/div>/g, '</p>'); // Convert div ends to paragraphs
      
      // Clean up common contenteditable artifacts
      html = html
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/<p><\/p>/g, '<p><br></p>') // Ensure empty paragraphs have br for line breaks
        .replace(/<p>\s*<\/p>/g, '<p><br></p>') // Paragraphs with only whitespace
        .replace(/<br>\s*<\/p>/g, '</p>') // Remove br before paragraph end
        .replace(/(<p><br><\/p>){2,}/g, '<p><br></p>') // Prevent multiple empty paragraphs
        .trim();
      
      // Ensure content starts and ends properly
      if (html && !html.startsWith('<')) {
        html = '<p>' + html + '</p>';
      }
      
      const text = editorRef.current.innerText;
      
      // Only update htmlContent if it's actually different to avoid unnecessary re-renders
      if (html !== htmlContent) {
        setHtmlContent(html);
      }
      onChange(html, text);
    }
  };

  // Initialize editor content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      if (initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
      setIsInitialized(true);
    }
  }, [initialContent, isInitialized]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      // Allow the default behavior but ensure we're creating proper paragraphs
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const currentNode = range.startContainer;
        
        // Check if we're in a heading or special element
        let parentElement = currentNode.nodeType === Node.TEXT_NODE 
          ? currentNode.parentElement 
          : currentNode as Element;
        
        while (parentElement && parentElement !== editorRef.current) {
          if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(parentElement.tagName)) {
            // We're in a heading, prevent default and create a new paragraph
            e.preventDefault();
            
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            
            range.deleteContents();
            range.insertNode(p);
            
            // Move cursor into the new paragraph
            range.setStart(p, 0);
            range.setEnd(p, 0);
            selection.removeAllRanges();
            selection.addRange(range);
            
            setTimeout(() => updateContent(), 0);
            return;
          }
          parentElement = parentElement.parentElement;
        }
      }
      
      // For normal text, allow default behavior and clean up afterward
      setTimeout(() => updateContent(), 0);
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Use requestAnimationFrame to delay the update and preserve cursor position
    requestAnimationFrame(() => {
      updateContent();
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && onImageUpload) {
      try {
        // Handle multiple files
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const url = await onImageUpload(file);
          
          // Insert image with proper HTML structure
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            
            // Create image element with better attributes
            const imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.alt = file.name.replace(/\.[^/.]+$/, ''); // Remove extension for alt text
            imgElement.style.maxWidth = '100%';
            imgElement.style.height = 'auto';
            imgElement.style.display = 'block';
            imgElement.style.margin = '1rem auto';
            imgElement.loading = 'lazy';
            
            // Insert the image
            range.deleteContents();
            range.insertNode(imgElement);
            
            // Add a paragraph after the image for continued typing
            const br = document.createElement('br');
            range.setStartAfter(imgElement);
            range.insertNode(br);
            range.setStartAfter(br);
            range.collapse(true);
            
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
        
        // Update content after all images are inserted
        setTimeout(() => updateContent(), 100);
        
        // Clear the input for next use
        event.target.value = '';
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  // Add drag and drop functionality
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (onImageUpload) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.type.startsWith('image/')
      );
      
      if (files.length > 0) {
        try {
          for (const file of files) {
            const url = await onImageUpload(file);
            
            // Insert image at drop location
            const imgElement = document.createElement('img');
            imgElement.src = url;
            imgElement.alt = file.name.replace(/\.[^/.]+$/, '');
            imgElement.style.maxWidth = '100%';
            imgElement.style.height = 'auto';
            imgElement.style.display = 'block';
            imgElement.style.margin = '1rem auto';
            imgElement.loading = 'lazy';
            
            // Insert at current cursor position or end of content
            if (editorRef.current) {
              editorRef.current.appendChild(imgElement);
              editorRef.current.appendChild(document.createElement('br'));
            }
          }
          
          setTimeout(() => updateContent(), 100);
        } catch (error) {
          console.error('Failed to upload dropped images:', error);
        }
      }
    }
  };

  return (
    <div className="border rounded-lg shadow-sm">
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          font-style: italic;
        }
        [contenteditable]:focus:before {
          content: none;
        }
      `}</style>
      <Tabs defaultValue="visual" onValueChange={setActiveTab}>
        <div className="border-b px-4">
          <TabsList className="w-full justify-start gap-4">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual" className="p-0">
          <div className="border-b p-2">
            {/* Mobile-friendly toolbar with grouped sections */}
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {/* Text Formatting Group */}
              <div className="flex border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('bold')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('italic')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('underline')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Underline className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Headings Group */}
              <div className="flex border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('formatBlock', '<h1>')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Heading1 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('formatBlock', '<h2>')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Heading2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Alignment Group */}
              <div className="flex border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('justifyLeft')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <AlignLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('justifyCenter')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <AlignCenter className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('justifyRight')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <AlignRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Special Elements Group */}
              <div className="flex border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('insertUnorderedList')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <List className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('formatBlock', '<blockquote>')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Quote className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => execCommand('formatBlock', '<pre>')}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Code className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>

              {/* Links and Media Group */}
              <div className="flex border rounded">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const url = prompt('Enter URL:');
                    if (url) execCommand('createLink', url);
                  }}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                >
                  <Link className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                  title="Upload images (multiple files supported, or drag & drop)"
                >
                  <Image className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div
            ref={editorRef}
            className={`min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 prose prose-sm sm:prose-lg max-w-none focus:outline-none text-sm sm:text-base transition-colors ${
              isDragOver ? 'bg-blue-50 border-blue-300 border-2 border-dashed' : ''
            }`}
            contentEditable
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            suppressContentEditableWarning={true}
            style={{ 
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              lineHeight: '1.6'
            }}
            data-placeholder={isDragOver ? "Drop images here..." : "Start writing your content... You can drag and drop images here or use the image button."}
          />
          <style>{`
            /* Ensure proper styling for contenteditable */
            [contenteditable] h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
            [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
            [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
            [contenteditable] p { margin: 1em 0; }
            [contenteditable] ul, [contenteditable] ol { margin: 1em 0; padding-left: 40px; }
            [contenteditable] li { margin: 0.5em 0; }
            [contenteditable] blockquote { 
              border-left: 4px solid #ddd; 
              margin: 1em 0; 
              padding-left: 1em; 
              color: #666; 
              font-style: italic; 
            }
            [contenteditable] pre { 
              background: #f5f5f5; 
              padding: 1em; 
              border-radius: 4px; 
              overflow-x: auto; 
              font-family: monospace; 
            }
            [contenteditable] strong, [contenteditable] b { font-weight: bold; }
            [contenteditable] em, [contenteditable] i { font-style: italic; }
            [contenteditable] u { text-decoration: underline; }
            [contenteditable] a { color: #0066cc; text-decoration: underline; }
            [contenteditable] img { max-width: 100%; height: auto; }
          `}</style>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
        </TabsContent>

        <TabsContent value="html" className="p-4">
          <textarea
            className="w-full min-h-[400px] font-mono text-sm p-4 border rounded"
            value={htmlContent}
            onChange={(e) => {
              setHtmlContent(e.target.value);
              onChange(e.target.value, e.target.value);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RichTextEditor;
