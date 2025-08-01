# WordPress Content Migration Guide

## 🚀 **Automated Migration (Recommended)**

The admin panel now includes an automated WordPress migration tool that can import all your posts directly from your WordPress site.

### **How to Use:**
1. Go to the Admin Panel
2. Scroll down to "WordPress Content Migration" section
3. Enter your WordPress site URL (e.g., `https://yoursite.com`)
4. Click "Start Migration"

### **Requirements:**
- WordPress REST API enabled (default in WordPress 4.7+)
- Posts must be publicly accessible
- Internet connection for both sites

---

## 📋 **Manual Migration Options**

If the automated migration doesn't work, here are alternative methods:

### **Method 1: WordPress Export/Import**

1. **Export from WordPress:**
   - Go to WordPress Admin → Tools → Export
   - Select "Posts" and download the XML file

2. **Convert XML to JSON:**
   - Use online tools like `wordpress-export-to-markdown` or custom scripts
   - Or follow Method 2 below for CSV approach

### **Method 2: CSV Migration**

1. **Export WordPress data to CSV:**
   ```sql
   -- Run this in your WordPress database (phpMyAdmin):
   SELECT 
     post_title as title,
     post_content as content,
     post_excerpt as excerpt,
     post_name as slug,
     post_date as created_at,
     post_modified as updated_at,
     post_status as status
   FROM wp_posts 
   WHERE post_type = 'post' 
   AND post_status = 'publish'
   ORDER BY post_date DESC;
   ```

2. **Prepare the CSV:**
   - Save the result as CSV
   - Clean HTML content if needed
   - Ensure proper encoding (UTF-8)

3. **Import to Supabase:**
   - Go to Supabase Dashboard → Table Editor → blog_posts
   - Use the import feature to upload CSV
   - Map columns correctly

### **Method 3: Custom Script Migration**

If you have access to your WordPress database, you can create a custom migration script:

```javascript
// Example Node.js script for direct database migration
const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');

async function migrateFromDatabase() {
  // WordPress database connection
  const wpConnection = await mysql.createConnection({
    host: 'your-wp-host',
    user: 'your-wp-user',
    password: 'your-wp-password',
    database: 'your-wp-database'
  });

  // Supabase connection
  const supabase = createClient('your-supabase-url', 'your-supabase-key');

  // Fetch WordPress posts
  const [posts] = await wpConnection.execute(`
    SELECT 
      post_title,
      post_content,
      post_excerpt,
      post_name,
      post_date,
      post_modified
    FROM wp_posts 
    WHERE post_type = 'post' 
    AND post_status = 'publish'
  `);

  // Insert into Supabase
  for (const post of posts) {
    await supabase.from('blog_posts').insert({
      title: post.post_title,
      content: post.post_content,
      excerpt: post.post_excerpt,
      slug: post.post_name,
      author_id: 'your-user-id',
      status: 'published',
      published_at: post.post_date,
      created_at: post.post_date,
      updated_at: post.post_modified
    });
  }
}
```

---

## 🔧 **Content Cleaning**

Regardless of the method used, you may need to clean your content:

### **Common Issues to Fix:**
- **HTML Tags:** Remove or convert WordPress-specific HTML
- **Shortcodes:** Remove `[gallery]`, `[caption]`, etc.
- **Image URLs:** Update image paths if needed
- **Internal Links:** Update links to point to new site structure
- **Encoding:** Fix character encoding issues

### **Tools for Content Cleaning:**
- **Regex Find/Replace:** Use VS Code or similar editors
- **Online Tools:** HTML to Markdown converters
- **Custom Scripts:** Write specific cleaning scripts for your content

---

## 📊 **Post Migration Steps**

After migrating content:

1. **Review Posts:** Check that content displays correctly
2. **Update Categories:** Ensure categories are properly assigned
3. **Fix Images:** Upload images to your blog platform or update URLs
4. **Update Internal Links:** Change WordPress URLs to new structure
5. **SEO Setup:** Update meta descriptions and SEO data
6. **Test Everything:** Check all posts render properly

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **"Cannot connect to WordPress site"**
   - Check if REST API is enabled
   - Verify URL is correct and accessible
   - Check if site has authentication restrictions

2. **"Some posts failed to migrate"**
   - Check for special characters in content
   - Verify database permissions
   - Review error logs for specific issues

3. **"Images not displaying"**
   - WordPress images are still hosted on original site
   - Consider downloading and re-uploading images
   - Or update image URLs in content

### **Getting Help:**
- Check browser console for error messages
- Review migration logs in admin panel
- Contact support with specific error details

---

## 🎯 **Best Practices**

1. **Backup First:** Always backup your WordPress site before migration
2. **Test Migration:** Try with a few posts first
3. **Clean Content:** Review and clean content after migration
4. **Update URLs:** Change any hardcoded WordPress URLs
5. **SEO Redirects:** Set up redirects from old URLs to new ones
