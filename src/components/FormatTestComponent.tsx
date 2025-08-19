import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RichTextEditor from '@/components/RichTextEditor';

const FormatTestComponent = () => {
  const [content, setContent] = useState(`
    <h1>Sample Blog Post with Formatting</h1>
    <p>This is a <strong>bold text</strong> and this is <em>italic text</em>. You can also have <u>underlined text</u>.</p>
    
    <h2>Here's a Subheading</h2>
    <p>Here's a paragraph with a <a href="https://example.com">link to example.com</a>.</p>
    
    <h3>Lists Work Too</h3>
    <ul>
      <li>First bullet point</li>
      <li>Second bullet point with <strong>bold text</strong></li>
      <li>Third bullet point with <em>italic text</em></li>
    </ul>
    
    <blockquote>
      This is a blockquote that should be styled nicely with proper indentation and styling.
    </blockquote>
    
    <p>You can also have inline <code>code snippets</code> that are properly formatted.</p>
    
    <pre>
// This is a code block
function example() {
  return "Hello, World!";
}
    </pre>
  `);
  
  const [textContent, setTextContent] = useState('');

  const handleContentChange = (html: string, text: string) => {
    setContent(html);
    setTextContent(text);
    console.log('HTML Content:', html);
    console.log('Text Content:', text);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rich Text Editor Test</CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            initialContent={content}
            onChange={handleContentChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview - How It Will Look in Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-6 prose-blockquote:py-2 prose-pre:bg-gray-100 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raw HTML Content (What Gets Saved to Database)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
            {content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormatTestComponent;
