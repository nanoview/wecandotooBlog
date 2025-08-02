import React, { useState, useRef } from 'react';
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
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      setHtmlContent(html);
      onChange(html, text);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onImageUpload) {
      try {
        const url = await onImageUpload(file);
        execCommand('insertImage', url);
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }
  };

  return (
    <div className="border rounded-lg shadow-sm">
      <Tabs defaultValue="visual" onValueChange={setActiveTab}>
        <div className="border-b px-4">
          <TabsList className="w-full justify-start gap-4">
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="visual" className="p-0">
          <div className="border-b p-2 flex flex-wrap gap-1">
            <ToggleGroup type="multiple" className="flex flex-wrap gap-1">
              {/* Text Formatting */}
              <ToggleGroupItem value="bold" onClick={() => execCommand('bold')}>
                <Bold className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" onClick={() => execCommand('italic')}>
                <Italic className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="underline" onClick={() => execCommand('underline')}>
                <Underline className="h-4 w-4" />
              </ToggleGroupItem>

              {/* Alignment */}
              <ToggleGroupItem value="left" onClick={() => execCommand('justifyLeft')}>
                <AlignLeft className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="center" onClick={() => execCommand('justifyCenter')}>
                <AlignCenter className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="right" onClick={() => execCommand('justifyRight')}>
                <AlignRight className="h-4 w-4" />
              </ToggleGroupItem>

              {/* Lists */}
              <ToggleGroupItem value="bullet" onClick={() => execCommand('insertUnorderedList')}>
                <List className="h-4 w-4" />
              </ToggleGroupItem>

              {/* Special Formatting */}
              <ToggleGroupItem value="quote" onClick={() => execCommand('formatBlock', '<blockquote>')}>
                <Quote className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="code" onClick={() => execCommand('formatBlock', '<pre>')}>
                <Code className="h-4 w-4" />
              </ToggleGroupItem>

              {/* Headings */}
              <ToggleGroupItem value="h1" onClick={() => execCommand('formatBlock', '<h1>')}>
                <Heading1 className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="h2" onClick={() => execCommand('formatBlock', '<h2>')}>
                <Heading2 className="h-4 w-4" />
              </ToggleGroupItem>

              {/* Links and Images */}
              <ToggleGroupItem value="link" onClick={() => {
                const url = prompt('Enter URL:');
                if (url) execCommand('createLink', url);
              }}>
                <Link className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="image" onClick={() => fileInputRef.current?.click()}>
                <Image className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div
            ref={editorRef}
            className="min-h-[400px] p-4 prose prose-lg max-w-none focus:outline-none"
            contentEditable
            onInput={updateContent}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
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
