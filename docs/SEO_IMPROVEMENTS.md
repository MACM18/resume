# SEO Improvements

This document outlines the SEO enhancements implemented for your portfolio website.

## What's Been Added

### 1. Dynamic Metadata Generation

- **Root Layout** (`app/layout.tsx`): Generates dynamic metadata based on profile data
  - Dynamic title using profile full name and tagline
  - Dynamic description from profile tagline
  - OpenGraph tags for social media sharing (Facebook, LinkedIn)
  - Twitter Card metadata for Twitter sharing
  - Proper robots meta tags for search engine indexing

### 2. Structured Data (JSON-LD)

- **Home Page** (`app/page.tsx`): Includes structured data for:
  - **Person schema**: Helps Google understand who you are
    - Name, job title, image, social links, description
  - **WebSite schema**: Describes your portfolio website
    - Site name, URL, description, author information

This structured data helps search engines better understand your content and can enable rich results in search.

### 3. SEO Helper Library

- **File**: `lib/seo.ts`
- Centralized functions for generating metadata across all pages
- Supports both full `Profile` type and client-side `ProfileData` type
- Provides sensible fallbacks when profile data is not available
- Functions included:
  - `generateHomeMetadata()` - Home page SEO
  - `generateAboutMetadata()` - About page SEO
  - `generateProjectsMetadata()` - Projects listing SEO
  - `generateProjectMetadata()` - Individual project SEO
  - `generateResumeMetadata()` - Resume page SEO
  - `generateStructuredData()` - JSON-LD structured data

### 4. Mobile Navigation Integration

- Mobile menu now shows admin sections when on `/admin` route
- Synced with URL query parameters for deep linking
- Seamless navigation between admin sections on mobile devices

## Configuration

### Environment Variables

Create a `.env.local` file (or add to your existing one):

```env
# Your website's public URL
NEXT_PUBLIC_SITE_URL=https://yourportfolio.com

# Google Search Console Verification
# Not needed if you verify via DNS records
# NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code-here
```

### Getting Your Google Verification Code (Optional)

If you haven't verified via DNS, you can use the HTML tag method:

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (your domain)
3. Choose "HTML tag" verification method
4. Copy only the `content` value from the meta tag
5. Add it to your `.env.local` as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`

Example:

```html
<!-- Google gives you this: -->
<meta name="google-site-verification" content="abc123xyz" />

<!-- You only need this part: -->
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123xyz
```

## How It Works

### Dynamic Title & Description

- **Home**: Uses your profile name and tagline
- **About**: "About [Your Name]" with subtitle
- **Projects**: "Projects by [Your Name]"
- **Individual Project**: "[Project Title] - [Your Name]"
- **Resume**: "Resume - [Your Name]"

### Social Media Previews

When your portfolio links are shared on social media, they will show:

- Your name/title
- Your tagline or page description
- Your avatar image (or default OG image)
- Proper metadata for both Facebook (OpenGraph) and Twitter

### Search Engine Optimization

- **Title tags**: Dynamic, keyword-rich titles for each page
- **Meta descriptions**: Compelling descriptions that appear in search results
- **Structured data**: Helps Google understand your content
- **Robots tags**: Tells search engines to index and follow your content
- **Keywords meta**: Includes relevant skills and technologies

## Testing Your SEO

### 1. Check Structured Data

Visit Google's [Rich Results Test](https://search.google.com/test/rich-results):

- Enter your website URL
- Verify that Person and WebSite schemas are detected

### 2. Preview Social Sharing

- **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- **LinkedIn**: Share your URL and see the preview

### 3. Verify Search Console

1. Add your site to Google Search Console
2. Submit your sitemap (if you have one)
3. Monitor indexing status and search performance

## Next Steps

### Recommended Enhancements

1. **Create a sitemap.xml**

   - Add `app/sitemap.ts` to auto-generate a sitemap
   - Submit to Google Search Console

2. **Create a robots.txt**

   - Add `public/robots.txt` to guide search engine crawlers

3. **Add Open Graph Image**

   - Create a custom OG image at `public/og-image.png` (1200x630px)
   - Or generate dynamic OG images using Next.js Image Generation API

4. **Performance Optimization**

   - Ensure images use Next.js Image component (already done!)
   - Monitor Core Web Vitals in Search Console
   - Optimize page load times

5. **Content Optimization**
   - Use descriptive, keyword-rich project titles
   - Write detailed project descriptions
   - Include relevant technical keywords in your tagline

## Files Modified

- ✅ `app/layout.tsx` - Added dynamic metadata generation
- ✅ `app/page.tsx` - Added structured data (Person, WebSite)
- ✅ `lib/seo.ts` - Created SEO helper utilities
- ✅ `.env.example` - Added environment variable examples
- ✅ `components/Navigation.tsx` - Mobile admin nav integration
- ✅ `app/admin/page.tsx` - Query param sync for deep linking

## Additional Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Console Help](https://support.google.com/webmasters/)
- [Schema.org Person](https://schema.org/Person)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
