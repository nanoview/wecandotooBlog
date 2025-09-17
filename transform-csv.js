import fs from 'fs';
import path from 'path';

// Read the CSV file
const csvPath = 'd:\\wecandoViteReactTs\\posts_rows.csv';
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n');

// Skip the header row
const dataLines = lines.slice(1);

const transformedRows = [];

for (let i = 0; i < dataLines.length; i++) {
  const line = dataLines[i].trim();
  if (!line) continue;
  
  // Simple CSV parsing - split by comma but handle quoted content
  const columns = [];
  let currentColumn = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    
    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      continue;
    }
    
    if (inQuotes && char === quoteChar) {
      // Check if it's an escaped quote
      if (line[j + 1] === quoteChar) {
        currentColumn += char;
        j++; // Skip the next quote
        continue;
      }
      inQuotes = false;
      continue;
    }
    
    if (!inQuotes && char === ',') {
      columns.push(currentColumn.trim());
      currentColumn = '';
      continue;
    }
    
    currentColumn += char;
  }
  
  // Add the last column
  if (currentColumn) {
    columns.push(currentColumn.trim());
  }
  
  if (columns.length < 10) continue; // Skip incomplete rows
  
  // Map old structure to new structure
  // Old: tidy, wp_id, title, content, excerpt, status, author_id, created_at, updated_at, slug, type, parent_id, menu_order, guid, created_by_migration
  // New: id, title, content, excerpt, slug, status, author_id, created_at, updated_at, published_at, category, tags, featured_image, seo_title, meta_description, focus_keyword, read_time
  
  const oldId = columns[0];
  const wpId = columns[1];
  const title = columns[2];
  const content = columns[3];
  const excerpt = columns[4] || '';
  const status = columns[5] === 'publish' ? 'published' : 'draft';
  const authorId = columns[6] || '1'; // Default author ID
  const createdAt = columns[7];
  const updatedAt = columns[8];
  const slug = columns[9];
  
  // Generate UUID for id (you might want to use the wp_id as reference)
  const id = `wp-${wpId}`;
  
  // Set published_at to created_at if status is published
  const publishedAt = status === 'published' ? createdAt : '';
  
  // Default values for new columns
  const category = 'Blog';
  const tags = '{}'; // Empty array in PostgreSQL format
  const featuredImage = '';
  const seoTitle = title;
  const metaDescription = excerpt || '';
  const focusKeyword = '';
  const readTime = Math.max(1, Math.floor((content.length / 200))); // Rough estimate: 200 chars per minute
  
  // Create the new row
  const newRow = [
    id,
    title,
    content,
    excerpt,
    slug,
    status,
    authorId,
    createdAt,
    updatedAt,
    publishedAt,
    category,
    tags,
    featuredImage,
    seoTitle,
    metaDescription,
    focusKeyword,
    readTime
  ];
  
  transformedRows.push(newRow);
}

// Create the new CSV content
const header = 'id,title,content,excerpt,slug,status,author_id,created_at,updated_at,published_at,category,tags,featured_image,seo_title,meta_description,focus_keyword,read_time';
const csvOutput = [header, ...transformedRows.map(row => 
  row.map(cell => {
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    const cellStr = String(cell || '');
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return '"' + cellStr.replace(/"/g, '""') + '"';
    }
    return cellStr;
  }).join(',')
)].join('\n');

// Write the transformed CSV
const outputPath = 'd:\\wecandoViteReactTs\\blog_posts_transformed.csv';
fs.writeFileSync(outputPath, csvOutput);

console.log(`Transformed CSV saved to: ${outputPath}`);
console.log(`Processed ${transformedRows.length} rows`);