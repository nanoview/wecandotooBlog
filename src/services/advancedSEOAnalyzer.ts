// Enhanced SEO Analysis Engine
// Advanced algorithms for comprehensive SEO scoring and optimization

export interface AdvancedSEOAnalysis {
  overallScore: number;
  contentScore: number;
  technicalScore: number;
  keywordScore: number;
  readabilityScore: number;
  userExperienceScore: number;
  performanceScore: number;
  detailedBreakdown: SEOScoreBreakdown;
  recommendations: SEORecommendation[];
  competitorAnalysis?: CompetitorAnalysis;
  trendingOpportunities: string[];
}

export interface SEOScoreBreakdown {
  // Content Quality (30 points)
  wordCount: { score: number; current: number; target: number; };
  headingStructure: { score: number; hasH1: boolean; hasH2H3: boolean; };
  contentDepth: { score: number; paragraphs: number; readingTime: number; };
  multimedia: { score: number; images: number; videos: number; };
  
  // Technical SEO (25 points)
  metaTitle: { score: number; length: number; hasKeyword: boolean; };
  metaDescription: { score: number; length: number; hasKeyword: boolean; };
  urlStructure: { score: number; isOptimized: boolean; hasKeyword: boolean; };
  schemaMarkup: { score: number; hasSchema: boolean; type: string; };
  
  // Keyword Optimization (25 points)
  primaryKeyword: { score: number; density: number; prominence: number; };
  secondaryKeywords: { score: number; count: number; distribution: number; };
  keywordNaturalness: { score: number; overOptimization: boolean; };
  lsiKeywords: { score: number; count: number; relevance: number; };
  
  // User Experience (20 points)
  readability: { score: number; fleschScore: number; gradeLevel: number; };
  engagement: { score: number; hasCallToAction: boolean; hasLinks: boolean; };
  mobileOptimization: { score: number; responsive: boolean; };
  pageSpeed: { score: number; loadTime: number; optimized: boolean; };
}

export interface SEORecommendation {
  category: 'critical' | 'important' | 'minor' | 'enhancement';
  type: 'content' | 'technical' | 'keywords' | 'ux' | 'performance';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'moderate' | 'complex';
  estimatedScoreGain: number;
  actionItems: string[];
  priority: number;
}

export interface CompetitorAnalysis {
  topCompetitors: Array<{
    url: string;
    title: string;
    metaDescription: string;
    wordCount: number;
    seoScore: number;
    keywordUsage: string[];
  }>;
  gapAnalysis: string[];
  opportunities: string[];
}

export class AdvancedSEOAnalyzer {
  
  static analyzeContent(content: string, title: string, metaDescription: string, focusKeyword: string): AdvancedSEOAnalysis {
    const breakdown = this.calculateDetailedBreakdown(content, title, metaDescription, focusKeyword);
    const recommendations = this.generateAdvancedRecommendations(breakdown);
    const overallScore = this.calculateOverallScore(breakdown);
    
    return {
      overallScore,
      contentScore: this.calculateContentScore(breakdown),
      technicalScore: this.calculateTechnicalScore(breakdown),
      keywordScore: this.calculateKeywordScore(breakdown),
      readabilityScore: breakdown.readability.score,
      userExperienceScore: this.calculateUXScore(breakdown),
      performanceScore: breakdown.pageSpeed.score,
      detailedBreakdown: breakdown,
      recommendations: recommendations.sort((a, b) => b.priority - a.priority),
      trendingOpportunities: this.identifyTrendingOpportunities(content, focusKeyword)
    };
  }

  private static calculateDetailedBreakdown(content: string, title: string, metaDescription: string, focusKeyword: string): SEOScoreBreakdown {
    const words = content.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Content Quality Analysis
    const headings = {
      h1: (content.match(/<h1[^>]*>/gi) || []).length,
      h2: (content.match(/<h2[^>]*>/gi) || []).length,
      h3: (content.match(/<h3[^>]*>/gi) || []).length,
    };
    
    const multimedia = {
      images: (content.match(/<img[^>]*>/gi) || []).length,
      videos: (content.match(/<video[^>]*>/gi) || content.match(/youtube|vimeo/gi) || []).length
    };

    // Technical SEO Analysis
    const titleAnalysis = this.analyzeTitleTag(title, focusKeyword);
    const metaAnalysis = this.analyzeMetaDescription(metaDescription, focusKeyword);
    
    // Keyword Analysis
    const keywordAnalysis = this.analyzeKeywordUsage(content, title, focusKeyword);
    
    // Readability Analysis
    const readabilityAnalysis = this.calculateAdvancedReadability(content, sentences.length, wordCount);
    
    return {
      // Content Quality (30 points)
      wordCount: {
        score: this.scoreWordCount(wordCount),
        current: wordCount,
        target: wordCount < 1000 ? 1000 : wordCount < 2000 ? 2000 : 3000
      },
      headingStructure: {
        score: this.scoreHeadingStructure(headings),
        hasH1: headings.h1 > 0,
        hasH2H3: headings.h2 > 0 || headings.h3 > 0
      },
      contentDepth: {
        score: this.scoreContentDepth(paragraphs.length, wordCount),
        paragraphs: paragraphs.length,
        readingTime: Math.ceil(wordCount / 200)
      },
      multimedia: {
        score: this.scoreMultimedia(multimedia),
        images: multimedia.images,
        videos: multimedia.videos
      },

      // Technical SEO (25 points)
      metaTitle: titleAnalysis,
      metaDescription: metaAnalysis,
      urlStructure: {
        score: 20, // Would need actual URL to analyze
        isOptimized: true,
        hasKeyword: true
      },
      schemaMarkup: {
        score: content.includes('schema.org') ? 25 : 0,
        hasSchema: content.includes('schema.org'),
        type: 'article'
      },

      // Keyword Optimization (25 points)
      primaryKeyword: keywordAnalysis.primary,
      secondaryKeywords: keywordAnalysis.secondary,
      keywordNaturalness: keywordAnalysis.naturalness,
      lsiKeywords: keywordAnalysis.lsi,

      // User Experience (20 points)
      readability: readabilityAnalysis,
      engagement: this.analyzeEngagement(content),
      mobileOptimization: {
        score: 20, // Assume optimized
        responsive: true
      },
      pageSpeed: {
        score: 18, // Good default
        loadTime: 2.5,
        optimized: true
      }
    };
  }

  private static scoreWordCount(count: number): number {
    if (count >= 2000) return 30;
    if (count >= 1500) return 25;
    if (count >= 1000) return 20;
    if (count >= 500) return 15;
    if (count >= 300) return 10;
    return 5;
  }

  private static scoreHeadingStructure(headings: any): number {
    let score = 0;
    if (headings.h1 > 0) score += 10;
    if (headings.h2 >= 2) score += 10;
    if (headings.h3 >= 1) score += 5;
    return Math.min(25, score);
  }

  private static scoreContentDepth(paragraphs: number, wordCount: number): number {
    let score = 0;
    if (paragraphs >= 5) score += 10;
    if (wordCount / paragraphs >= 100) score += 10; // Good paragraph length
    if (paragraphs >= 8) score += 5;
    return Math.min(25, score);
  }

  private static scoreMultimedia(multimedia: any): number {
    let score = 0;
    if (multimedia.images >= 1) score += 10;
    if (multimedia.images >= 3) score += 5;
    if (multimedia.videos >= 1) score += 5;
    return Math.min(20, score);
  }

  private static analyzeTitleTag(title: string, keyword: string): any {
    const length = title.length;
    const hasKeyword = keyword && title.toLowerCase().includes(keyword.toLowerCase());
    
    let score = 0;
    if (length >= 30 && length <= 60) score += 15;
    else if (length >= 20 && length <= 70) score += 10;
    else score += 5;
    
    if (hasKeyword) score += 10;
    
    return {
      score: Math.min(25, score),
      length,
      hasKeyword
    };
  }

  private static analyzeMetaDescription(description: string, keyword: string): any {
    const length = description.length;
    const hasKeyword = keyword && description.toLowerCase().includes(keyword.toLowerCase());
    
    let score = 0;
    if (length >= 120 && length <= 160) score += 15;
    else if (length >= 100 && length <= 180) score += 10;
    else if (length > 0) score += 5;
    
    if (hasKeyword) score += 10;
    
    return {
      score: Math.min(25, score),
      length,
      hasKeyword
    };
  }

  private static analyzeKeywordUsage(content: string, title: string, keyword: string): any {
    if (!keyword) {
      return {
        primary: { score: 0, density: 0, prominence: 0 },
        secondary: { score: 0, count: 0, distribution: 0 },
        naturalness: { score: 0, overOptimization: false },
        lsi: { score: 0, count: 0, relevance: 0 }
      };
    }

    const fullText = (title + ' ' + content).toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const words = fullText.split(/\s+/);
    const keywordCount = (fullText.match(new RegExp(keywordLower, 'g')) || []).length;
    const density = (keywordCount / words.length) * 100;

    // Primary keyword analysis
    const titleHasKeyword = title.toLowerCase().includes(keywordLower);
    const firstParagraph = content.split('\n')[0] || '';
    const firstParagraphHasKeyword = firstParagraph.toLowerCase().includes(keywordLower);
    
    let primaryScore = 0;
    if (density >= 0.5 && density <= 2.5) primaryScore += 15;
    else if (density > 0 && density < 4) primaryScore += 10;
    if (titleHasKeyword) primaryScore += 5;
    if (firstParagraphHasKeyword) primaryScore += 5;

    // Naturalness check
    const overOptimized = density > 3;
    const naturalness = overOptimized ? 10 : 25;

    return {
      primary: { score: Math.min(25, primaryScore), density, prominence: titleHasKeyword ? 1 : 0 },
      secondary: { score: 15, count: 3, distribution: 0.8 }, // Estimated
      naturalness: { score: naturalness, overOptimization: overOptimized },
      lsi: { score: 15, count: 5, relevance: 0.7 } // Estimated
    };
  }

  private static calculateAdvancedReadability(content: string, sentences: number, words: number): any {
    if (sentences === 0 || words === 0) {
      return { score: 0, fleschScore: 0, gradeLevel: 0 };
    }

    // Simplified Flesch Reading Ease
    const avgSentenceLength = words / sentences;
    const avgSyllables = words * 1.5; // Rough estimate
    const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * (avgSyllables / words));
    
    let score = 0;
    if (fleschScore >= 60) score = 20;
    else if (fleschScore >= 40) score = 15;
    else if (fleschScore >= 20) score = 10;
    else score = 5;

    return {
      score,
      fleschScore: Math.max(0, Math.min(100, fleschScore)),
      gradeLevel: Math.max(1, Math.min(20, 20 - (fleschScore / 10)))
    };
  }

  private static analyzeEngagement(content: string): any {
    const hasCallToAction = /call.{0,10}action|cta|sign.{0,5}up|subscribe|download|contact|learn.{0,5}more/i.test(content);
    const hasLinks = /<a\s+href/i.test(content);
    const hasLists = /<[uo]l>/i.test(content);
    const hasQuestions = /\?/g.test(content);
    
    let score = 0;
    if (hasCallToAction) score += 5;
    if (hasLinks) score += 5;
    if (hasLists) score += 5;
    if (hasQuestions) score += 5;
    
    return {
      score: Math.min(20, score),
      hasCallToAction,
      hasLinks
    };
  }

  private static generateAdvancedRecommendations(breakdown: SEOScoreBreakdown): SEORecommendation[] {
    const recommendations: SEORecommendation[] = [];

    // Content recommendations
    if (breakdown.wordCount.score < 25) {
      recommendations.push({
        category: 'important',
        type: 'content',
        title: 'Increase Content Length',
        description: `Your content has ${breakdown.wordCount.current} words. Aim for ${breakdown.wordCount.target}+ words for better search rankings.`,
        impact: 'high',
        effort: 'moderate',
        estimatedScoreGain: 25 - breakdown.wordCount.score,
        actionItems: [
          'Add more detailed explanations',
          'Include examples and case studies',
          'Add FAQ section',
          'Expand on key points'
        ],
        priority: 8
      });
    }

    // Technical SEO recommendations
    if (breakdown.metaTitle.score < 20) {
      recommendations.push({
        category: 'critical',
        type: 'technical',
        title: 'Optimize Meta Title',
        description: `Your title is ${breakdown.metaTitle.length} characters. Optimize to 30-60 characters with focus keyword.`,
        impact: 'high',
        effort: 'easy',
        estimatedScoreGain: 20 - breakdown.metaTitle.score,
        actionItems: [
          'Keep title between 30-60 characters',
          'Include primary keyword near the beginning',
          'Make it compelling and click-worthy',
          'Avoid keyword stuffing'
        ],
        priority: 9
      });
    }

    if (breakdown.metaDescription.score < 20) {
      recommendations.push({
        category: 'important',
        type: 'technical',
        title: 'Improve Meta Description',
        description: `Your meta description is ${breakdown.metaDescription.length} characters. Optimize to 120-160 characters.`,
        impact: 'high',
        effort: 'easy',
        estimatedScoreGain: 20 - breakdown.metaDescription.score,
        actionItems: [
          'Write 120-160 character description',
          'Include primary keyword naturally',
          'Add compelling call-to-action',
          'Summarize main value proposition'
        ],
        priority: 8
      });
    }

    // Keyword recommendations
    if (breakdown.primaryKeyword.score < 20) {
      recommendations.push({
        category: 'critical',
        type: 'keywords',
        title: 'Optimize Keyword Usage',
        description: `Keyword density is ${breakdown.primaryKeyword.density.toFixed(2)}%. Aim for 0.5-2.5% for optimal SEO.`,
        impact: 'high',
        effort: 'moderate',
        estimatedScoreGain: 20 - breakdown.primaryKeyword.score,
        actionItems: [
          'Include keyword in title and first paragraph',
          'Use keyword in H2/H3 headings naturally',
          'Maintain 0.5-2.5% keyword density',
          'Add related keywords and synonyms'
        ],
        priority: 9
      });
    }

    // Readability recommendations
    if (breakdown.readability.score < 15) {
      recommendations.push({
        category: 'important',
        type: 'ux',
        title: 'Improve Readability',
        description: `Readability score is ${breakdown.readability.fleschScore.toFixed(1)}. Aim for 60+ for better user experience.`,
        impact: 'medium',
        effort: 'moderate',
        estimatedScoreGain: 15 - breakdown.readability.score,
        actionItems: [
          'Use shorter sentences (15-20 words)',
          'Break up long paragraphs',
          'Use simple, clear language',
          'Add bullet points and lists'
        ],
        priority: 6
      });
    }

    // Engagement recommendations
    if (breakdown.engagement.score < 15) {
      recommendations.push({
        category: 'enhancement',
        type: 'ux',
        title: 'Enhance User Engagement',
        description: 'Add more engagement elements to keep readers on your page longer.',
        impact: 'medium',
        effort: 'easy',
        estimatedScoreGain: 15 - breakdown.engagement.score,
        actionItems: [
          'Add clear call-to-action buttons',
          'Include internal links to related content',
          'Add social sharing buttons',
          'Include interactive elements'
        ],
        priority: 5
      });
    }

    return recommendations;
  }

  private static calculateOverallScore(breakdown: SEOScoreBreakdown): number {
    return breakdown.wordCount.score + 
           breakdown.headingStructure.score + 
           breakdown.contentDepth.score + 
           breakdown.multimedia.score +
           breakdown.metaTitle.score + 
           breakdown.metaDescription.score + 
           breakdown.urlStructure.score + 
           breakdown.schemaMarkup.score +
           breakdown.primaryKeyword.score + 
           breakdown.secondaryKeywords.score + 
           breakdown.keywordNaturalness.score + 
           breakdown.lsiKeywords.score +
           breakdown.readability.score + 
           breakdown.engagement.score + 
           breakdown.mobileOptimization.score + 
           breakdown.pageSpeed.score;
  }

  private static calculateContentScore(breakdown: SEOScoreBreakdown): number {
    return breakdown.wordCount.score + breakdown.headingStructure.score + 
           breakdown.contentDepth.score + breakdown.multimedia.score;
  }

  private static calculateTechnicalScore(breakdown: SEOScoreBreakdown): number {
    return breakdown.metaTitle.score + breakdown.metaDescription.score + 
           breakdown.urlStructure.score + breakdown.schemaMarkup.score;
  }

  private static calculateKeywordScore(breakdown: SEOScoreBreakdown): number {
    return breakdown.primaryKeyword.score + breakdown.secondaryKeywords.score + 
           breakdown.keywordNaturalness.score + breakdown.lsiKeywords.score;
  }

  private static calculateUXScore(breakdown: SEOScoreBreakdown): number {
    return breakdown.readability.score + breakdown.engagement.score + 
           breakdown.mobileOptimization.score;
  }

  private static identifyTrendingOpportunities(content: string, keyword: string): string[] {
    // This would integrate with trending keyword APIs in production
    return [
      'Add FAQ section for voice search optimization',
      'Include recent statistics and data',
      'Optimize for featured snippets',
      'Add video content for multimedia SEO',
      'Include social proof and testimonials'
    ];
  }
}
