# 🚨 URGENT: 3. **Choose "URL prefix"** and enter your website URL: `https://wecandotoo.com`oogle Search Console Setup Guide

## Current SEO Status
Your website is **NOT appearing in Google search results** because:
- ❌ Placeholder verification code: `your_verification_code`
- ❌ Site not verified in Google Search Console
- ❌ Sitemap not submitted to Google

## Step 1: Create Google Search Console Account

1. **Go to Google Search Console**: https://search.google.com/search-console/
2. **Sign in** with your Google account
3. **Click "Add Property"**
4. **Choose "URL prefix"** and enter your website URL: `https://your-domain.com`
5. **Click "Continue"**

## Step 2: Get Your Verification Code

Google will show you several verification methods. Choose **"HTML tag"**:

1. **Copy the verification code** from the meta tag
   - It looks like: `<meta name="google-site-verification" content="ABC123xyz..."/>`
   - **Copy only the content value**: `ABC123xyz...`

## Step 3: Update Your Environment Variables

1. **Open your `.env` file**
2. **Replace the placeholder**:
   ```
   # Change this:
   VITE_GOOGLE_SITE_VERIFICATION=your_verification_code
   
   # To this (with your actual code):
   VITE_GOOGLE_SITE_VERIFICATION=ABC123xyz...
   ```

## Step 4: Deploy Your Changes

1. **Save the `.env` file**
2. **Restart your development server** or **deploy to production**
3. **Go back to Google Search Console**
4. **Click "Verify"**

## Step 5: Submit Your Sitemap

Once verified:

1. **In Google Search Console**, go to **"Sitemaps"**
2. **Add a new sitemap**: `https://wecandotoo.com/sitemap.xml`
3. **Click "Submit"**

## Step 6: Use the SEO Utilities

1. **Go to Admin → SEO tab**
2. **Click "Generate Sitemap"**
3. **Copy the XML** and save it as `public/sitemap.xml`
4. **Redeploy your site**

## What This Fixes

✅ **Google will recognize your site**  
✅ **Pages will start getting indexed**  
✅ **Your site will appear in search results**  
✅ **You'll get SEO performance data**

## Important Notes

- **Without verification**: Google ignores your site completely
- **With verification**: Google starts crawling and indexing within 24-48 hours
- **Sitemap submission**: Helps Google find all your pages faster

## Current SEO Components (Already Installed)

✅ **SEO Meta Tags**: Dynamic titles, descriptions, keywords  
✅ **Structured Data**: JSON-LD schema for blog posts  
✅ **Sitemap Generator**: Dynamic XML sitemap creation  
✅ **Robots.txt**: Allows Google to crawl your site  

## Quick Test

After verification, test your SEO setup:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Enter your blog post URL**
3. **Check for structured data errors**

---

**🔥 URGENT ACTION REQUIRED**: Update your Google verification code in `.env` and redeploy immediately to start getting indexed by Google!
