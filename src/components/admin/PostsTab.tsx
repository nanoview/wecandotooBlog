import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Edit, Trash2, Share2, Zap } from 'lucide-react';

interface Post {
  id: string; // This will be the database UUID
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  tags?: string[];
  published_at: string;
  seo_score?: number;
}

interface PostsTabProps {
  posts: Post[];
  onRefresh: () => void;
}

export default function PostsTab({ posts, onRefresh }: PostsTabProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [optimizing, setOptimizing] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const postsPerPage = 10;

  const optimizePost = async (postId: string) => {
    try {
      setOptimizing(true);
      setFallbackUrl(null);
      
      // Get post details first
      const { data: post, error: postError } = await supabase
        .from('blog_posts')
        .select('title, excerpt, content, slug, category, tags, seo_score')
        .eq('id', postId)
        .single();
      
      if (postError) throw postError;
      
      const postUrl = `https://wecandotoo.com/blog/${post.slug}`;
      const editUrl = `https://wecandotoo.com/edit/${post.slug}`;
      const currentScore = post.seo_score || 0;
      
      // Check if post needs optimization (below 80%)
      if (currentScore >= 80) {
        if (!confirm(`This post already has a good SEO score (${currentScore}%). Do you still want to optimize it for 95%+ score?`)) {
          setOptimizing(false);
          return;
        }
      }
      
      // Create comprehensive prompt targeting 95% SEO score
      const promptText = [
        '🎯 **URGENT SEO OPTIMIZATION REQUEST - TARGET: 95%+ SCORE**',
        `Current SEO Score: ${currentScore}% (${currentScore < 80 ? 'NEEDS IMPROVEMENT' : 'GOOD BUT CAN BE BETTER'})`,
        'Transform this blog post to achieve 95%+ SEO score with comprehensive optimization.',
        '',
        '📍 **POST LINKS:**',
        `• Live URL: ${postUrl}`,
        `• Edit URL: ${editUrl}`,
        '',
        '📊 **CURRENT POST TO OPTIMIZE:**',
        '',
        `**TITLE:** ${post.title || 'Untitled'}`,
        `**SLUG:** /${post.slug || 'no-slug'}`,
        `**CATEGORY:** ${post.category || 'Uncategorized'}`,
        `**EXCERPT:** ${post.excerpt || 'No excerpt provided'}`,
        `**TAGS:** ${Array.isArray(post.tags) ? post.tags.join(', ') : 'No tags'}`,
        `**CONTENT LENGTH:** ${post.content ? post.content.length : 0} characters`,
        `**CURRENT SEO SCORE:** ${currentScore}%`,
        '',
        '📝 **FULL CONTENT TO ANALYZE:**',
        '```',
        post.content || 'No content provided',
        '```',
        '',
        '🚀 **OPTIMIZATION TARGET: 95%+ SEO SCORE**',
        '',
        '**1. SEO TITLE OPTIMIZATION (50-60 characters)**',
        '   • Include primary keyword at the beginning',
        '   • Make it compelling and click-worthy',
        '   • Ensure uniqueness and relevance',
        '   • Target search intent effectively',
        '',
        '**2. META DESCRIPTION (150-160 characters)**',
        '   • Include primary keyword naturally',
        '   • Add compelling call-to-action',
        '   • Summarize key value proposition',
        '   • Create urgency or curiosity',
        '',
        '**3. CONTENT STRUCTURE FOR 95% SCORE:**',
        '   • Engaging introduction (150-200 words)',
        '   • Clear H2/H3 headings with target keywords',
        '   • Minimum 2000+ words comprehensive content',
        '   • Strong conclusion with clear CTA',
        '   • FAQ section (5-7 relevant questions)',
        '   • Table of contents for long content',
        '',
        '**4. ADVANCED KEYWORD OPTIMIZATION:**',
        '   • Primary keyword density: 1-2%',
        '   • 5-10 related LSI keywords naturally integrated',
        '   • Long-tail keyword variations',
        '   • Semantic keyword clusters',
        '   • Featured snippet optimization',
        '',
        '**5. TECHNICAL SEO FOR 95% SCORE:**',
        '   • Optimized URL slug (if needed)',
        '   • Internal linking strategy (3-5 relevant links)',
        '   • External authoritative links (2-3 sources)',
        '   • Image alt texts with keywords',
        '   • Schema markup recommendations',
        '   • Mobile-first optimization',
        '',
        '**6. USER ENGAGEMENT OPTIMIZATION:**',
        '   • Scannable content with bullet points',
        '   • Statistics and data inclusion',
        '   • Actionable tips and advice',
        '   • Personal examples or case studies',
        '   • Clear value propositions',
        '   • Multiple CTAs throughout content',
        '',
        '**7. CONTENT GAPS TO FILL:**',
        '   • Missing information that users expect',
        '   • Related subtopics to cover comprehensively',
        '   • Common questions to address',
        '   • Trending aspects of the topic',
        '   • Practical examples and tutorials',
        '',
        '📐 **WRITING GUIDELINES FOR 95% SCORE:**',
        '• Write for humans first, search engines second',
        '• Use conversational, engaging tone',
        '• Include personal insights and expertise',
        '• Add specific examples and case studies',
        '• Ensure perfect grammar and readability',
        '• Optimize for voice search queries',
        '• Include actionable takeaways',
        '',
        '🎯 **DELIVERABLES FOR 95% SEO SCORE:**',
        '1. **Optimized SEO Title** (copy-paste ready)',
        '2. **Perfect Meta Description** (copy-paste ready)',
        '3. **Keyword-Rich H2/H3 Structure** (copy-paste ready)',
        '4. **Content Sections to Add/Improve** (specific text)',
        '5. **Comprehensive FAQ Section** (5-7 Q&As)',
        '6. **Internal/External Link Strategy** (specific URLs)',
        '7. **Technical SEO Checklist** (step-by-step)',
        '8. **Content Expansion Suggestions** (reach 2000+ words)',
        '',
        '💡 **SUCCESS METRICS:**',
        `🎯 Target: Transform ${currentScore}% → 95%+ SEO Score`,
        `� Goal: Increase wecandotoo.com organic traffic`,
        `🔗 Focus: ${postUrl}`,
        `✏️ Edit at: ${editUrl}`,
        '',
        '⚡ **URGENT**: This post needs immediate optimization to compete effectively!'
      ].join('\n');

      // Create ChatGPT URL with automatic opening
      const maxChunkSize = 7000;
      
      if (promptText.length > maxChunkSize) {
        // Split into chunks for very long content
        const chunks = [];
        let currentChunk = '';
        const lines = promptText.split('\n');
        
        for (const line of lines) {
          if ((currentChunk + line + '\n').length > maxChunkSize && currentChunk) {
            chunks.push(currentChunk);
            currentChunk = line + '\n';
          } else {
            currentChunk += line + '\n';
          }
        }
        if (currentChunk) chunks.push(currentChunk);
        
        // Open first chunk immediately
        const mainPrompt = chunks[0];
        const seoPrompt = encodeURIComponent(mainPrompt);
        const chatGptUrl = `https://chatgpt.com/?q=${seoPrompt}`;
        
        // Auto-open ChatGPT
        window.open(chatGptUrl, '_blank');
        
        if (chunks.length > 1) {
          setTimeout(() => {
            alert(`Additional content for complete optimization:\n\n${chunks.slice(1).join('\n\n--- NEXT SECTION ---\n\n')}`);
          }, 1000);
        }
        
        alert(`🚀 ChatGPT opened for SEO optimization! Target: ${currentScore}% → 95%+ score`);
      } else {
        // Content fits in single URL - open immediately
        const seoPrompt = encodeURIComponent(promptText);
        const chatGptUrl = `https://chatgpt.com/?q=${seoPrompt}`;
        
        // Auto-open ChatGPT
        window.open(chatGptUrl, '_blank');
        alert(`🚀 ChatGPT opened for SEO optimization! Target: ${currentScore}% → 95%+ score`);
      }
      
    } catch (error) {
      console.error('Error generating SEO optimization prompt:', error);
      alert('Failed to generate SEO optimization prompt');
    } finally {
      setOptimizing(false);
    }
  };

  const deletePost = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      
      alert('Post deleted successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const unpublishPost = async (postId: string, title: string) => {
    if (!confirm(`Are you sure you want to unpublish "${title}"?`)) return;
    
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          published_at: null,
          status: 'draft'
        })
        .eq('id', postId);
      
      if (error) throw error;
      
      alert('Post unpublished successfully!');
      onRefresh();
    } catch (error) {
      console.error('Error unpublishing post:', error);
      alert('Failed to unpublish post');
    }
  };

  const sharePost = async (slug: string, title: string) => {
    const url = `https://wecandotoo.com/blog/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        });
      } catch (error) {
        // User cancelled or error occurred
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    }
  };

  const getSEOScoreColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getSEOScoreBadge = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Calculate pagination - safely handle undefined posts
  const safePostsArray = posts || [];
  const totalPages = Math.ceil(safePostsArray.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const currentPosts = safePostsArray.slice(startIndex, startIndex + postsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fallback URL display */}
      {fallbackUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">ChatGPT SEO Optimization</h4>
          <p className="text-blue-700 mb-3">Click the link below to open ChatGPT with your SEO optimization prompt:</p>
          <a 
            href={fallbackUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="w-4 h-4 mr-2" />
            Open ChatGPT SEO Optimizer
          </a>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Posts ({safePostsArray.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SEO Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Published
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {post.excerpt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {post.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSEOScoreBadge(post.seo_score)}`}>
                      {post.seo_score ? `${post.seo_score}%` : 'Not scored'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Draft'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => window.open(`https://wecandotoo.com/blog/${post.slug}`, '_blank')}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Post"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/edit/${post.id}`)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => optimizePost(post.id)}
                        disabled={optimizing}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded disabled:opacity-50"
                        title="Fix Now - AI SEO Optimization"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => sharePost(post.slug, post.title)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Share Post"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => unpublishPost(post.id, post.title)}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded"
                        title="Unpublish Post"
                      >
                        Unpublish
                      </button>
                      <button
                        onClick={() => deletePost(post.id, post.title)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(startIndex + postsPerPage, safePostsArray.length)} of {safePostsArray.length} posts
            </div>
            <div className="flex space-x-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
