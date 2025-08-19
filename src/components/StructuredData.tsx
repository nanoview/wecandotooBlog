import React from 'react';
import { BlogPost } from '@/types/blog';

interface StructuredDataProps {
  post?: BlogPost;
  type?: 'website' | 'blogPost' | 'organization';
}

const StructuredData: React.FC<StructuredDataProps> = ({ post, type = 'website' }) => {
  const baseUrl = 'https://wecandotoo.com';
  
  let structuredData: any = {};

  switch (type) {
    case 'website':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "wecandotoo",
        "description": "A modern blog platform for sharing knowledge and connecting with like-minded readers",
        "url": baseUrl,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        },
        "publisher": {
          "@type": "Organization",
          "name": "wecandotoo",
          "url": baseUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/android-chrome-512x512.png`
          }
        }
      };
      break;

    case 'blogPost':
      if (post) {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "image": post.image,
          "url": `${baseUrl}/${post.slug}`,
          "datePublished": post.date,
          "dateModified": post.date,
          "author": {
            "@type": "Person",
            "name": post.author.name,
            "image": post.author.avatar
          },
          "publisher": {
            "@type": "Organization",
            "name": "wecandotoo",
            "url": baseUrl,
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/android-chrome-512x512.png`,
              "width": 512,
              "height": 512
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${baseUrl}/${post.slug}`
          },
          "articleSection": post.category,
          "keywords": post.tags?.join(", "),
          "wordCount": post.content?.split(" ").length || 0,
          "timeRequired": post.readTime
        };
      }
      break;

    case 'organization':
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "wecandotoo",
        "url": baseUrl,
        "logo": `${baseUrl}/android-chrome-512x512.png`,
        "description": "A modern blog platform for sharing knowledge and connecting with like-minded readers",
        "foundingDate": "2024",
        "sameAs": [
          "https://twitter.com/wecandotoo",
          "https://facebook.com/wecandotoo"
        ]
      };
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
    />
  );
};

export default StructuredData;
