import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Image, 
  Type, 
  List, 
  Quote, 
  Code, 
  Link2, 
  Hash, 
  Trash2, 
  GripVertical,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Video,
  Minus,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface Block {
  id: string;
  type: 'text' | 'heading' | 'image' | 'list' | 'quote' | 'code' | 'divider' | 'video' | 'checklist';
  content: any;
  style?: any;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  readOnly?: boolean;
}

const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange, readOnly = false }) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);

  const addBlock = (afterId: string | null, type: Block['type']) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type)
    };

    const newBlocks = [...blocks];
    if (afterId) {
      const index = newBlocks.findIndex(b => b.id === afterId);
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }

    onChange(newBlocks);
    setShowAddMenu(null);
    setSelectedBlock(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    onChange(newBlocks);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return; // Don't delete the last block
    const newBlocks = blocks.filter(block => block.id !== id);
    onChange(newBlocks);
    setSelectedBlock(null);
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    onChange(newBlocks);
  };

  const getDefaultContent = (type: Block['type']) => {
    switch (type) {
      case 'text':
        return { text: '', formatting: [] };
      case 'heading':
        return { text: '', level: 2 };
      case 'image':
        return { url: '', caption: '', alt: '' };
      case 'list':
        return { items: [''], ordered: false };
      case 'quote':
        return { text: '', author: '' };
      case 'code':
        return { code: '', language: 'javascript' };
      case 'video':
        return { url: '', caption: '' };
      case 'checklist':
        return { items: [{ text: '', checked: false }] };
      case 'divider':
        return {};
      default:
        return {};
    }
  };

  const getDefaultStyle = (type: Block['type']) => {
    switch (type) {
      case 'text':
        return { 
          fontSize: 'base', 
          fontWeight: 'normal', 
          textAlign: 'left',
          color: '#000000',
          backgroundColor: 'transparent'
        };
      case 'heading':
        return { 
          textAlign: 'left',
          color: '#000000'
        };
      default:
        return {};
    }
  };

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetBlockId: string) => {
    e.preventDefault();
    if (!draggedBlock) return;

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock);
    const targetIndex = blocks.findIndex(b => b.id === targetBlockId);

    if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
      moveBlock(draggedIndex, targetIndex);
    }

    setDraggedBlock(null);
  };

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => (
        <BlockComponent
          key={block.id}
          block={block}
          isSelected={selectedBlock === block.id}
          readOnly={readOnly}
          onSelect={() => setSelectedBlock(block.id)}
          onUpdate={(updates) => updateBlock(block.id, updates)}
          onDelete={() => deleteBlock(block.id)}
          onAddAfter={(type) => addBlock(block.id, type)}
          onShowAddMenu={() => setShowAddMenu(showAddMenu === block.id ? null : block.id)}
          showAddMenu={showAddMenu === block.id}
          onDragStart={(e) => handleDragStart(e, block.id)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, block.id)}
        />
      ))}
      
      {blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Type className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Start writing your story...</p>
          <Button onClick={() => addBlock(null, 'text')}>
            Add your first block
          </Button>
        </div>
      )}
    </div>
  );
};

interface BlockComponentProps {
  block: Block;
  isSelected: boolean;
  readOnly: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onAddAfter: (type: Block['type']) => void;
  onShowAddMenu: () => void;
  showAddMenu: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const BlockComponent: React.FC<BlockComponentProps> = ({
  block,
  isSelected,
  readOnly,
  onSelect,
  onUpdate,
  onDelete,
  onAddAfter,
  onShowAddMenu,
  showAddMenu,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({
        content: { ...block.content, url }
      });
    }
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlock
            content={block.content}
            style={block.style}
            readOnly={readOnly}
            isSelected={isSelected}
            onUpdate={(content) => onUpdate({ content })}
            onStyleUpdate={(style) => onUpdate({ style: { ...block.style, ...style } })}
          />
        );
      
      case 'heading':
        return (
          <HeadingBlock
            content={block.content}
            style={block.style}
            readOnly={readOnly}
            isSelected={isSelected}
            onUpdate={(content) => onUpdate({ content })}
            onStyleUpdate={(style) => onUpdate({ style: { ...block.style, ...style } })}
          />
        );
      
      case 'image':
        return (
          <ImageBlock
            content={block.content}
            readOnly={readOnly}
            isSelected={isSelected}
            onUpdate={(content) => onUpdate({ content })}
            onUpload={() => fileInputRef.current?.click()}
          />
        );
      
      case 'list':
        return (
          <ListBlock
            content={block.content}
            readOnly={readOnly}
            onUpdate={(content) => onUpdate({ content })}
          />
        );
      
      case 'quote':
        return (
          <QuoteBlock
            content={block.content}
            readOnly={readOnly}
            onUpdate={(content) => onUpdate({ content })}
          />
        );
      
      case 'code':
        return (
          <CodeBlock
            content={block.content}
            readOnly={readOnly}
            onUpdate={(content) => onUpdate({ content })}
          />
        );
      
      case 'divider':
        return <div className="border-t border-gray-300 my-6" />;
      
      case 'video':
        return (
          <VideoBlock
            content={block.content}
            readOnly={readOnly}
            onUpdate={(content) => onUpdate({ content })}
          />
        );
      
      case 'checklist':
        return (
          <ChecklistBlock
            content={block.content}
            readOnly={readOnly}
            onUpdate={(content) => onUpdate({ content })}
          />
        );
      
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div
      className={`group relative ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      onClick={onSelect}
      draggable={!readOnly}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Block Controls */}
      {!readOnly && isSelected && (
        <div className="absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 cursor-grab"
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={onShowAddMenu}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-red-500 hover:text-red-700"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Block Content */}
      <div className="min-h-[40px]">
        {renderBlockContent()}
      </div>

      {/* Add Block Menu */}
      {showAddMenu && !readOnly && (
        <AddBlockMenu onSelect={onAddAfter} onClose={() => onShowAddMenu()} />
      )}

      {/* Hidden file input for image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};

// Individual Block Components

const TextBlock: React.FC<{
  content: any;
  style: any;
  readOnly: boolean;
  isSelected: boolean;
  onUpdate: (content: any) => void;
  onStyleUpdate: (style: any) => void;
}> = ({ content, style, readOnly, isSelected, onUpdate, onStyleUpdate }) => {
  return (
    <div className="space-y-2">
      {isSelected && !readOnly && (
        <TextFormattingToolbar
          style={style}
          onStyleUpdate={onStyleUpdate}
        />
      )}
      <Textarea
        value={content.text}
        onChange={(e) => onUpdate({ ...content, text: e.target.value })}
        placeholder="Start typing..."
        readOnly={readOnly}
        className={`border-none shadow-none resize-none focus:ring-0 ${
          style?.fontSize === 'lg' ? 'text-lg' : style?.fontSize === 'sm' ? 'text-sm' : 'text-base'
        } ${
          style?.fontWeight === 'bold' ? 'font-bold' : 'font-normal'
        } ${
          style?.textAlign === 'center' ? 'text-center' : 
          style?.textAlign === 'right' ? 'text-right' : 'text-left'
        }`}
        style={{
          color: style?.color,
          backgroundColor: style?.backgroundColor
        }}
      />
    </div>
  );
};

const HeadingBlock: React.FC<{
  content: any;
  style: any;
  readOnly: boolean;
  isSelected: boolean;
  onUpdate: (content: any) => void;
  onStyleUpdate: (style: any) => void;
}> = ({ content, style, readOnly, isSelected, onUpdate, onStyleUpdate }) => {
  const HeadingTag = `h${content.level}` as keyof JSX.IntrinsicElements;
  
  return (
    <div className="space-y-2">
      {isSelected && !readOnly && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
          <Select
            value={content.level.toString()}
            onValueChange={(value) => onUpdate({ ...content, level: parseInt(value) })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">H1</SelectItem>
              <SelectItem value="2">H2</SelectItem>
              <SelectItem value="3">H3</SelectItem>
              <SelectItem value="4">H4</SelectItem>
            </SelectContent>
          </Select>
          <TextFormattingToolbar
            style={style}
            onStyleUpdate={onStyleUpdate}
            minimal
          />
        </div>
      )}
      <HeadingTag
        className={`font-bold ${
          content.level === 1 ? 'text-3xl' :
          content.level === 2 ? 'text-2xl' :
          content.level === 3 ? 'text-xl' : 'text-lg'
        } ${
          style?.textAlign === 'center' ? 'text-center' : 
          style?.textAlign === 'right' ? 'text-right' : 'text-left'
        }`}
        style={{ color: style?.color }}
      >
        {readOnly ? (
          content.text || `Heading ${content.level}`
        ) : (
          <Input
            value={content.text}
            onChange={(e) => onUpdate({ ...content, text: e.target.value })}
            placeholder={`Heading ${content.level}`}
            className="border-none shadow-none p-0 font-bold bg-transparent"
          />
        )}
      </HeadingTag>
    </div>
  );
};

const ImageBlock: React.FC<{
  content: any;
  readOnly: boolean;
  isSelected: boolean;
  onUpdate: (content: any) => void;
  onUpload: () => void;
}> = ({ content, readOnly, isSelected, onUpdate, onUpload }) => {
  return (
    <div className="space-y-4">
      {content.url ? (
        <div className="space-y-2">
          <img
            src={content.url}
            alt={content.alt}
            className="w-full max-w-full h-auto rounded-lg"
          />
          {!readOnly && (
            <div className="space-y-2">
              <Input
                value={content.caption}
                onChange={(e) => onUpdate({ ...content, caption: e.target.value })}
                placeholder="Add a caption..."
                className="text-sm text-gray-600"
              />
              <Input
                value={content.alt}
                onChange={(e) => onUpdate({ ...content, alt: e.target.value })}
                placeholder="Alt text for accessibility..."
                className="text-sm text-gray-600"
              />
            </div>
          )}
          {content.caption && (
            <p className="text-sm text-gray-600 text-center italic">{content.caption}</p>
          )}
        </div>
      ) : (
        !readOnly && (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onClick={onUpload}
          >
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Click to upload an image</p>
          </div>
        )
      )}
    </div>
  );
};

const ListBlock: React.FC<{
  content: any;
  readOnly: boolean;
  onUpdate: (content: any) => void;
}> = ({ content, readOnly, onUpdate }) => {
  const addItem = () => {
    onUpdate({
      ...content,
      items: [...content.items, '']
    });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...content.items];
    newItems[index] = value;
    onUpdate({ ...content, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = content.items.filter((_: any, i: number) => i !== index);
    onUpdate({ ...content, items: newItems });
  };

  const ListTag = content.ordered ? 'ol' : 'ul';

  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
          <Button
            variant={content.ordered ? "outline" : "default"}
            size="sm"
            onClick={() => onUpdate({ ...content, ordered: false })}
          >
            Bullet List
          </Button>
          <Button
            variant={content.ordered ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate({ ...content, ordered: true })}
          >
            Numbered List
          </Button>
        </div>
      )}
      <ListTag className={content.ordered ? 'list-decimal list-inside' : 'list-disc list-inside'}>
        {content.items.map((item: string, index: number) => (
          <li key={index} className="flex items-center gap-2 mb-2">
            {readOnly ? (
              <span>{item}</span>
            ) : (
              <>
                <Input
                  value={item}
                  onChange={(e) => updateItem(index, e.target.value)}
                  placeholder="List item..."
                  className="flex-1 border-none shadow-none"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </li>
        ))}
      </ListTag>
      {!readOnly && (
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add item
        </Button>
      )}
    </div>
  );
};

const QuoteBlock: React.FC<{
  content: any;
  readOnly: boolean;
  onUpdate: (content: any) => void;
}> = ({ content, readOnly, onUpdate }) => {
  return (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg">
      {readOnly ? (
        <div>
          <p className="italic text-lg">{content.text}</p>
          {content.author && (
            <cite className="block mt-2 text-sm text-gray-600">— {content.author}</cite>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={content.text}
            onChange={(e) => onUpdate({ ...content, text: e.target.value })}
            placeholder="Enter quote..."
            className="border-none shadow-none italic text-lg resize-none focus:ring-0 bg-transparent"
          />
          <Input
            value={content.author}
            onChange={(e) => onUpdate({ ...content, author: e.target.value })}
            placeholder="Author (optional)"
            className="border-none shadow-none text-sm bg-transparent"
          />
        </div>
      )}
    </blockquote>
  );
};

const CodeBlock: React.FC<{
  content: any;
  readOnly: boolean;
  onUpdate: (content: any) => void;
}> = ({ content, readOnly, onUpdate }) => {
  return (
    <div className="space-y-2">
      {!readOnly && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
          <Select
            value={content.language}
            onValueChange={(value) => onUpdate({ ...content, language: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="bash">Bash</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="bg-gray-900 rounded-lg p-4">
        {readOnly ? (
          <pre className="text-green-400 font-mono text-sm overflow-x-auto">
            <code>{content.code}</code>
          </pre>
        ) : (
          <Textarea
            value={content.code}
            onChange={(e) => onUpdate({ ...content, code: e.target.value })}
            placeholder="Enter your code..."
            className="bg-transparent border-none shadow-none text-green-400 font-mono text-sm resize-none focus:ring-0"
            rows={6}
          />
        )}
      </div>
    </div>
  );
};

const VideoBlock: React.FC<{
  content: any;
  readOnly: boolean;
  onUpdate: (content: any) => void;
}> = ({ content, readOnly, onUpdate }) => {
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <Input
          value={content.url}
          onChange={(e) => onUpdate({ ...content, url: e.target.value })}
          placeholder="Paste video URL (YouTube, Vimeo, etc.)"
        />
      )}
      {content.url && (
        <div className="space-y-2">
          <div className="aspect-video">
            <iframe
              src={getEmbedUrl(content.url)}
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          {!readOnly && (
            <Input
              value={content.caption}
              onChange={(e) => onUpdate({ ...content, caption: e.target.value })}
              placeholder="Add a caption..."
              className="text-sm text-gray-600"
            />
          )}
          {content.caption && (
            <p className="text-sm text-gray-600 text-center italic">{content.caption}</p>
          )}
        </div>
      )}
    </div>
  );
};

const ChecklistBlock: React.FC<{
  content: any;
  readOnly: boolean;
  onUpdate: (content: any) => void;
}> = ({ content, readOnly, onUpdate }) => {
  const addItem = () => {
    onUpdate({
      ...content,
      items: [...content.items, { text: '', checked: false }]
    });
  };

  const updateItem = (index: number, updates: any) => {
    const newItems = [...content.items];
    newItems[index] = { ...newItems[index], ...updates };
    onUpdate({ ...content, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = content.items.filter((_: any, i: number) => i !== index);
    onUpdate({ ...content, items: newItems });
  };

  return (
    <div className="space-y-2">
      {content.items.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={(e) => updateItem(index, { checked: e.target.checked })}
            disabled={readOnly}
            className="w-4 h-4"
          />
          {readOnly ? (
            <span className={item.checked ? 'line-through text-gray-500' : ''}>{item.text}</span>
          ) : (
            <>
              <Input
                value={item.text}
                onChange={(e) => updateItem(index, { text: e.target.value })}
                placeholder="Checklist item..."
                className="flex-1 border-none shadow-none"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-4 h-4 mr-2" />
          Add item
        </Button>
      )}
    </div>
  );
};

const TextFormattingToolbar: React.FC<{
  style: any;
  onStyleUpdate: (style: any) => void;
  minimal?: boolean;
}> = ({ style, onStyleUpdate, minimal = false }) => {
  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-md flex-wrap">
      {!minimal && (
        <>
          <Select
            value={style?.fontSize || 'base'}
            onValueChange={(value) => onStyleUpdate({ fontSize: value })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="base">Normal</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={style?.fontWeight === 'bold' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStyleUpdate({ 
              fontWeight: style?.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="w-4 h-4" />
          </Button>
        </>
      )}

      <Button
        variant={style?.textAlign === 'left' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStyleUpdate({ textAlign: 'left' })}
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      <Button
        variant={style?.textAlign === 'center' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStyleUpdate({ textAlign: 'center' })}
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      <Button
        variant={style?.textAlign === 'right' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onStyleUpdate({ textAlign: 'right' })}
      >
        <AlignRight className="w-4 h-4" />
      </Button>

      {!minimal && (
        <>
          <input
            type="color"
            value={style?.color || '#000000'}
            onChange={(e) => onStyleUpdate({ color: e.target.value })}
            className="w-8 h-8 rounded border cursor-pointer"
            title="Text Color"
          />
          <input
            type="color"
            value={style?.backgroundColor || '#ffffff'}
            onChange={(e) => onStyleUpdate({ backgroundColor: e.target.value })}
            className="w-8 h-8 rounded border cursor-pointer"
            title="Background Color"
          />
        </>
      )}
    </div>
  );
};

const AddBlockMenu: React.FC<{
  onSelect: (type: Block['type']) => void;
  onClose: () => void;
}> = ({ onSelect, onClose }) => {
  const blockTypes = [
    { type: 'text' as const, icon: Type, label: 'Text', description: 'Simple text block' },
    { type: 'heading' as const, icon: Hash, label: 'Heading', description: 'Section heading' },
    { type: 'image' as const, icon: Image, label: 'Image', description: 'Upload an image' },
    { type: 'list' as const, icon: List, label: 'List', description: 'Bullet or numbered list' },
    { type: 'quote' as const, icon: Quote, label: 'Quote', description: 'Highlighted quote' },
    { type: 'code' as const, icon: Code, label: 'Code', description: 'Code snippet' },
    { type: 'video' as const, icon: Video, label: 'Video', description: 'Embed video' },
    { type: 'checklist' as const, icon: CheckSquare, label: 'Checklist', description: 'To-do list' },
    { type: 'divider' as const, icon: Minus, label: 'Divider', description: 'Visual separator' },
  ];

  return (
    <Card className="absolute z-50 w-64 p-2 mt-2 shadow-lg">
      <div className="grid gap-1">
        {blockTypes.map(({ type, icon: Icon, label, description }) => (
          <Button
            key={type}
            variant="ghost"
            className="w-full justify-start h-auto p-3"
            onClick={() => {
              onSelect(type);
              onClose();
            }}
          >
            <Icon className="w-5 h-5 mr-3 text-gray-500" />
            <div className="text-left">
              <div className="font-medium">{label}</div>
              <div className="text-xs text-gray-500">{description}</div>
            </div>
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default BlockEditor;
