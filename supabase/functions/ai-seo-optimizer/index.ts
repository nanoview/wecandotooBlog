import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from '../_shared/cors.ts';

// AI-powered SEO optimization service
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint that doesn't require authentication
  const url = new URL(req.url);
  if (url.pathname.endsWith('/health')) {
    return new Response(
      JSON.stringify({ 
        status: 'healthy', 
        service: 'ai-seo-optimizer',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { method } = req;

    if (method === 'POST') {
      const { postId, content, title, category, existingKeywords } = await req.json();
      
      // Generate SEO suggestions for a specific post
      const seoSuggestions = await generateSEOSuggestions({
        content,
        title,
        category,
        existingKeywords
      });

      // Update the post with generated SEO data
      if (postId) {
        const { error } = await supabase
          .from('blog_posts')
          .update({
            meta_description: seoSuggestions.metaDescription,
            focus_keyword: seoSuggestions.focusKeyword,
            suggested_keywords: seoSuggestions.relatedKeywords,
            seo_score: seoSuggestions.seoScore,
            last_seo_update: new Date().toISOString()
          })
          .eq('id', postId);

        if (error) throw error;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          suggestions: seoSuggestions 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'GET') {
      const url = new URL(req.url);
      const action = url.searchParams.get('action');

      switch (action) {
        case 'analyze-all':
          // Analyze and update all posts
          const result = await analyzeAllPosts(supabase);
          return new Response(
            JSON.stringify(result),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        case 'trending-keywords':
          // Get trending keywords by category
          const category = url.searchParams.get('category') || 'technology';
          const trending = await getTrendingKeywords(category);
          return new Response(
            JSON.stringify({ trending }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        case 'seo-health':
          // Get SEO health report
          const healthReport = await getSEOHealthReport(supabase);
          return new Response(
            JSON.stringify(healthReport),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );

        default:
          return new Response(
            JSON.stringify({ status: 'ok', message: 'AI SEO Optimizer is running' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
    }

  } catch (error) {
    console.error('AI SEO Optimizer error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Generate AI-powered SEO suggestions
async function generateSEOSuggestions({ content, title, category, existingKeywords = [] }) {
  try {
    // Extract key phrases from content
    const keyPhrases = extractKeyPhrases(content);
    
    // Analyze content for SEO potential
    const contentAnalysis = analyzeContent(content, title);
    
    // Get trending keywords for the category
    const trendingKeywords = await getTrendingKeywords(category);
    
    // Generate meta description
    const metaDescription = generateMetaDescription(content, title, keyPhrases);
    
    // Determine best focus keyword
    const focusKeyword = determineFocusKeyword(keyPhrases, trendingKeywords, existingKeywords);
    
    // Generate related keywords
    const relatedKeywords = generateRelatedKeywords(focusKeyword, keyPhrases, trendingKeywords);
    
    // Calculate SEO score
    const seoScore = calculateSEOScore(contentAnalysis, focusKeyword, metaDescription);

    return {
      metaDescription,
      focusKeyword,
      relatedKeywords,
      seoScore,
      analysis: contentAnalysis,
      recommendations: generateRecommendations(contentAnalysis, seoScore)
    };

  } catch (error) {
    console.error('Error generating SEO suggestions:', error);
    return {
      metaDescription: title.substring(0, 155) + '...',
      focusKeyword: extractMainKeyword(title),
      relatedKeywords: [],
      seoScore: 50,
      analysis: { error: error.message },
      recommendations: ['Error generating recommendations']
    };
  }
}

// Extract key phrases from content using NLP techniques
function extractKeyPhrases(content) {
  // Remove HTML tags and clean content
  const cleanContent = content.replace(/<[^>]*>/g, ' ').toLowerCase();
  
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 
    'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 
    'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
  ]);

  // Extract words and calculate frequency
  const words = cleanContent.match(/\b[a-z]{3,}\b/g) || [];
  const wordFreq = {};
  
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Extract 2-3 word phrases
  const phrases = [];
  const sentences = cleanContent.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const sentenceWords = sentence.match(/\b[a-z]{3,}\b/g) || [];
    for (let i = 0; i < sentenceWords.length - 1; i++) {
      if (!stopWords.has(sentenceWords[i]) && !stopWords.has(sentenceWords[i + 1])) {
        phrases.push(`${sentenceWords[i]} ${sentenceWords[i + 1]}`);
        
        // 3-word phrases
        if (i < sentenceWords.length - 2 && !stopWords.has(sentenceWords[i + 2])) {
          phrases.push(`${sentenceWords[i]} ${sentenceWords[i + 1]} ${sentenceWords[i + 2]}`);
        }
      }
    }
  });

  // Count phrase frequency
  const phraseFreq = {};
  phrases.forEach(phrase => {
    phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
  });

  // Return top keywords and phrases
  const topWords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);

  const topPhrases = Object.entries(phraseFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 15)
    .map(([phrase]) => phrase);

  return {
    words: topWords,
    phrases: topPhrases,
    wordFrequency: wordFreq,
    phraseFrequency: phraseFreq
  };
}

// Get trending keywords (simulated - would integrate with real APIs in production)
async function getTrendingKeywords(category) {
  // This would integrate with Google Trends API, SEMrush, or similar services
  // For now, return category-based trending keywords
  
  const trendingByCategory = {
    technology: [
      'artificial intelligence', 'machine learning', 'web development', 'react', 'typescript',
      'cloud computing', 'cybersecurity', 'blockchain', 'mobile app', 'api development',
      'data science', 'devops', 'software engineering', 'programming', 'coding'
    ],
    business: [
      'digital marketing', 'social media', 'content marketing', 'seo optimization', 'lead generation',
      'customer experience', 'brand strategy', 'email marketing', 'conversion rate', 'analytics'
    ],
    lifestyle: [
      'healthy living', 'work life balance', 'personal development', 'fitness tips', 'nutrition',
      'mental health', 'productivity', 'mindfulness', 'self care', 'wellness'
    ],
    travel: [
      'travel tips', 'budget travel', 'solo travel', 'adventure travel', 'travel guide',
      'backpacking', 'luxury travel', 'family vacation', 'travel photography', 'destination guide'
    ]
  };

  return trendingByCategory[category.toLowerCase()] || trendingByCategory.technology;
}

// Generate optimized meta description
function generateMetaDescription(content, title, keyPhrases) {
  const cleanContent = content.replace(/<[^>]*>/g, ' ');
  const firstSentence = cleanContent.split(/[.!?]+/)[0]?.trim();
  
  // Try to create a compelling meta description
  let metaDesc = '';
  
  if (firstSentence && firstSentence.length > 50 && firstSentence.length < 140) {
    metaDesc = firstSentence;
  } else {
    // Create from title and top phrases
    const topPhrase = keyPhrases.phrases[0] || '';
    metaDesc = `Learn about ${title.toLowerCase()}${topPhrase ? ` including ${topPhrase}` : ''}. Comprehensive guide with practical tips and insights.`;
  }

  // Ensure optimal length (120-160 characters)
  if (metaDesc.length > 160) {
    metaDesc = metaDesc.substring(0, 157) + '...';
  } else if (metaDesc.length < 120) {
    metaDesc += ' Get started today!';
  }

  return metaDesc;
}

// Determine the best focus keyword
function determineFocusKeyword(keyPhrases, trendingKeywords, existingKeywords) {
  // Score keywords based on frequency and trending status
  const candidates = [...keyPhrases.phrases, ...keyPhrases.words.slice(0, 10)];
  const scored = candidates.map(keyword => {
    let score = keyPhrases.phraseFrequency[keyword] || keyPhrases.wordFrequency[keyword] || 1;
    
    // Boost score if trending
    if (trendingKeywords.some(trend => 
      trend.toLowerCase().includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(trend.toLowerCase())
    )) {
      score *= 2;
    }
    
    // Reduce score if already used
    if (existingKeywords.includes(keyword)) {
      score *= 0.5;
    }
    
    // Prefer 2-3 word phrases over single words
    if (keyword.includes(' ')) {
      score *= 1.5;
    }

    return { keyword, score };
  });

  // Return highest scoring keyword
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.keyword || keyPhrases.words[0] || 'content';
}

// Generate related keywords
function generateRelatedKeywords(focusKeyword, keyPhrases, trendingKeywords) {
  const related = new Set();
  
  // Add variations of focus keyword
  const focusWords = focusKeyword.split(' ');
  focusWords.forEach(word => {
    keyPhrases.phrases.forEach(phrase => {
      if (phrase.includes(word) && phrase !== focusKeyword) {
        related.add(phrase);
      }
    });
  });

  // Add trending keywords that relate to content
  trendingKeywords.forEach(trend => {
    if (keyPhrases.words.some(word => trend.toLowerCase().includes(word))) {
      related.add(trend);
    }
  });

  // Add top phrases
  keyPhrases.phrases.slice(1, 6).forEach(phrase => related.add(phrase));

  return Array.from(related).slice(0, 10);
}

// Analyze content for SEO factors
function analyzeContent(content, title) {
  const cleanContent = content.replace(/<[^>]*>/g, ' ');
  const wordCount = cleanContent.split(/\s+/).length;
  const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  
  return {
    wordCount,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgSentenceLength: wordCount / sentences.length,
    hasHeadings: /<h[1-6]>/i.test(content),
    hasLists: /<[uo]l>/i.test(content),
    hasImages: /<img/i.test(content),
    hasLinks: /<a\s+href/i.test(content),
    readabilityScore: calculateReadabilityScore(sentences, wordCount)
  };
}

// Calculate readability score (simplified Flesch Reading Ease)
function calculateReadabilityScore(sentences, wordCount) {
  const avgSentenceLength = wordCount / sentences.length;
  const avgWordsPerSentence = wordCount / sentences.length;
  
  // Simplified score: lower is better (easier to read)
  let score = 100;
  if (avgSentenceLength > 20) score -= 20;
  if (avgSentenceLength > 30) score -= 20;
  if (avgWordsPerSentence > 25) score -= 10;
  
  return Math.max(0, Math.min(100, score));
}

// Calculate overall SEO score
function calculateSEOScore(analysis, focusKeyword, metaDescription) {
  let score = 0;
  
  // Content length (20 points)
  if (analysis.wordCount >= 300) score += 10;
  if (analysis.wordCount >= 600) score += 10;
  
  // Structure (20 points)
  if (analysis.hasHeadings) score += 10;
  if (analysis.paragraphCount >= 3) score += 10;
  
  // Engagement elements (20 points)
  if (analysis.hasImages) score += 5;
  if (analysis.hasLists) score += 5;
  if (analysis.hasLinks) score += 10;
  
  // Readability (20 points)
  if (analysis.readabilityScore >= 60) score += 20;
  else if (analysis.readabilityScore >= 40) score += 10;
  
  // SEO elements (20 points)
  if (focusKeyword && focusKeyword.length > 0) score += 10;
  if (metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160) score += 10;
  
  return Math.min(100, score);
}

// Generate SEO recommendations
function generateRecommendations(analysis, seoScore) {
  const recommendations = [];
  
  if (analysis.wordCount < 300) {
    recommendations.push('Increase content length to at least 300 words for better SEO');
  }
  
  if (!analysis.hasHeadings) {
    recommendations.push('Add headings (H1, H2, H3) to improve content structure');
  }
  
  if (!analysis.hasImages) {
    recommendations.push('Add relevant images with alt text to enhance engagement');
  }
  
  if (!analysis.hasLists) {
    recommendations.push('Use bullet points or numbered lists to improve readability');
  }
  
  if (analysis.readabilityScore < 40) {
    recommendations.push('Simplify sentences to improve readability');
  }
  
  if (analysis.avgSentenceLength > 25) {
    recommendations.push('Break up long sentences for better readability');
  }
  
  if (seoScore >= 80) {
    recommendations.push('Great SEO! Consider adding internal links to related content');
  }
  
  return recommendations;
}

// Extract main keyword from title
function extractMainKeyword(title) {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  const words = title.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  const filtered = words.filter(word => !stopWords.has(word));
  return filtered.slice(0, 2).join(' ') || title.toLowerCase();
}

// Analyze all posts in the database
async function analyzeAllPosts(supabase) {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, content, category, meta_description, focus_keyword')
      .eq('status', 'published');

    if (error) throw error;

    const results = [];
    
    for (const post of posts) {
      try {
        const suggestions = await generateSEOSuggestions({
          content: post.content,
          title: post.title,
          category: post.category,
          existingKeywords: []
        });

        // Update the post
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update({
            meta_description: suggestions.metaDescription,
            focus_keyword: suggestions.focusKeyword,
            seo_score: suggestions.seoScore,
            last_seo_update: new Date().toISOString()
          })
          .eq('id', post.id);

        if (updateError) {
          console.error(`Error updating post ${post.id}:`, updateError);
        }

        results.push({
          id: post.id,
          title: post.title,
          suggestions,
          updated: !updateError
        });

      } catch (postError) {
        console.error(`Error processing post ${post.id}:`, postError);
        results.push({
          id: post.id,
          title: post.title,
          error: postError.message,
          updated: false
        });
      }
    }

    return {
      success: true,
      processed: results.length,
      updated: results.filter(r => r.updated).length,
      results
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Get SEO health report
async function getSEOHealthReport(supabase) {
  try {
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, meta_description, focus_keyword, seo_score, status')
      .eq('status', 'published');

    if (error) throw error;

    const totalPosts = posts.length;
    const postsWithMetaDesc = posts.filter(p => p.meta_description && p.meta_description.length > 0).length;
    const postsWithFocusKeyword = posts.filter(p => p.focus_keyword && p.focus_keyword.length > 0).length;
    const avgSeoScore = posts.reduce((sum, p) => sum + (p.seo_score || 0), 0) / totalPosts;
    
    const lowScorePosts = posts.filter(p => (p.seo_score || 0) < 60);
    const highScorePosts = posts.filter(p => (p.seo_score || 0) >= 80);

    return {
      totalPosts,
      seoHealth: {
        metaDescriptionCoverage: Math.round((postsWithMetaDesc / totalPosts) * 100),
        focusKeywordCoverage: Math.round((postsWithFocusKeyword / totalPosts) * 100),
        averageSeoScore: Math.round(avgSeoScore),
        highPerformingPosts: highScorePosts.length,
        lowPerformingPosts: lowScorePosts.length
      },
      recommendations: [
        `${totalPosts - postsWithMetaDesc} posts need meta descriptions`,
        `${totalPosts - postsWithFocusKeyword} posts need focus keywords`,
        `${lowScorePosts.length} posts have SEO scores below 60 and need optimization`
      ],
      lowScorePosts: lowScorePosts.map(p => ({
        id: p.id,
        title: p.title,
        seoScore: p.seo_score || 0
      }))
    };

  } catch (error) {
    return {
      error: error.message
    };
  }
}
