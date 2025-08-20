import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, User, Tag, ChevronRight, Star, Loader2, LogIn, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import BlogPost from '@/components/BlogPost';
import CategoryFilter from '@/components/CategoryFilter';
import Header from '@/components/navigation/Header';
import { categories as fallbackCategories } from '@/data/blogData';
import { useAuth } from '@/hooks/useAuth';
import { usePageTracking } from '@/hooks/useVisitorTracking';
import { fetchBlogPosts, fetchCategories, searchBlogPosts, fetchBlogPostsByCategory, fetchBlogPostsByTag } from '@/services/blogService';
import { BlogPost as BlogPostType } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import BackToTopButton from '@/components/BackToTopButton';
import Footer from '@/components/Footer';
import NewsletterSubscription from '@/components/NewsletterSubscription';

// Lazy load non-critical components
const GoogleAd = lazy(() => import('@/components/GoogleAd'));
const DeferredComponent = lazy(() => import('@/components/DeferredComponent'));

const Index = () => {
  const { user, userRole, username, signOut, isNanopro } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State for dynamic data
  const [blogPosts, setBlogPosts] = useState<BlogPostType[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Helper to check if current user is admin
  const isAdmin = userRole === 'admin';
  
  // Track homepage visits (don't track admin users)
  usePageTracking('homepage', '/', !user || userRole !== 'admin');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle URL parameters for tag filtering
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
      loadBlogPostsByTag(tagFromUrl);
    } else {
      setSelectedTag(null);
    }
  }, [searchParams]);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else if (selectedTag) {
        loadBlogPostsByTag(selectedTag);
      } else if (selectedCategory === 'All') {
        loadBlogPosts();
      } else {
        handleCategoryChange(selectedCategory);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTag]);

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 Loading initial data...');
      
      // Load posts and categories in parallel
      const [postsData, categoriesData] = await Promise.all([
        fetchBlogPosts().catch((error) => {
          console.error('❌ Error fetching posts:', error);
          return [];
        }), // Return empty array on error
        fetchCategories().catch(() => fallbackCategories)
      ]);

      console.log('📝 Posts loaded:', postsData.length, 'posts');
      console.log('📋 First post:', postsData[0]?.title);
      setBlogPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Use empty posts array and fallback categories
      setBlogPosts([]);
      setCategories(fallbackCategories);
      toast({
        title: "Error loading posts",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadBlogPosts = useCallback(async () => {
    try {
      const posts = await fetchBlogPosts();
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  }, []);

  const loadBlogPostsByTag = useCallback(async (tag: string) => {
    try {
      setLoading(true);
      console.log('🏷️ Loading posts by tag:', tag);
      const posts = await fetchBlogPostsByTag(tag);
      setBlogPosts(posts);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error loading posts by tag:', error);
      toast({
        title: "Error",
        description: `Failed to load posts with tag "${tag}". Please try again.`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
      setCurrentPage(1); // Reset to first page when searching
      const results = await searchBlogPosts(searchTerm.trim());
      setBlogPosts(results);
    } catch (error) {
      console.error('Error searching posts:', error);
      toast({
        title: "Error",
        description: "Failed to search posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  }, [toast]);

  const handleCategoryChange = useCallback(async (category: string) => {
    console.log(`🏷️ Category changed to: "${category}"`);
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
    
    // Clear tag filter when changing categories
    if (selectedTag) {
      setSearchParams({});
      setSelectedTag(null);
    }
    
    if (searchTerm.trim()) {
      // If there's a search term, don't change posts yet
      console.log('⏭️ Skipping category filter due to active search');
      return;
    }

    try {
      if (category === 'All') {
        console.log('📄 Fetching all posts...');
        const allPosts = await fetchBlogPosts();
        console.log('✅ Received all posts:', allPosts.length);
        setBlogPosts(allPosts);
      } else {
        console.log(`🔍 Fetching posts for category: "${category}"`);
        const categoryPosts = await fetchBlogPostsByCategory(category);
        console.log(`✅ Received category posts:`, categoryPosts.length);
        setBlogPosts(categoryPosts);
      }
    } catch (error) {
      console.error('💥 Error filtering by category:', error);
      toast({
        title: "Error",
        description: "Failed to filter posts. Please try again.",
        variant: "destructive"
      });
    }
  }, [selectedTag, setSearchParams, toast]);

  // Filter posts for display (used when searching within a category)
  const filteredPosts = blogPosts.filter(post => {
    if (!searchTerm.trim()) return true;
    
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get featured post (latest published post or first in filtered results)
  const featuredPost = useMemo(() => {
    console.log('🎯 Selecting featured post');
    console.log('🎯 filteredPosts:', filteredPosts?.length || 0);
    console.log('🎯 blogPosts:', blogPosts?.length || 0);
    
    if (filteredPosts && filteredPosts.length > 0) {
      // If we have filtered posts, use the first one
      const selected = filteredPosts[0];
      console.log('🎯 Selected from filtered posts:', {
        id: selected.id,
        title: selected.title,
        slug: selected.slug,
        hasSlug: !!selected.slug
      });
      return selected;
    } else if (blogPosts && blogPosts.length > 0) {
      // If no filtered posts but we have posts, use the latest one
      const selected = blogPosts[0];
      console.log('🎯 Selected from all posts:', {
        id: selected.id,
        title: selected.title,
        slug: selected.slug,
        hasSlug: !!selected.slug
      });
      return selected;
    }
    console.log('🎯 No posts available for featured post');
    return null;
  }, [filteredPosts, blogPosts]);
  const displayPosts = filteredPosts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <Header variant="full" />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Amazing Stories
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore thought-provoking articles, tutorials, and insights from our community of writers
          </p>
          
          {/* Privacy Policy Link - Prominent for Google Verification */}
          <div className="mb-6">
            <Link 
              to="/privacy-policy" 
              className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
            >
              Privacy Policy & Terms of Service
            </Link>
          </div>
          
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
            )}
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-12 py-3 w-full rounded-full border-2 focus:border-blue-500"
            />
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <Star className="w-6 h-6 text-yellow-500 mr-2" />
            <h3 className="text-2xl font-bold text-gray-900">Featured Article</h3>
          </div>
          
          {loading ? (
            <Card className="overflow-hidden shadow-lg">
              <div className="md:flex">
                <div className="md:w-2/3 bg-gray-200 animate-pulse h-64"></div>
                <div className="md:w-1/3 p-8 space-y-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
            </Card>
          ) : featuredPost ? (
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-2/3">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-1/3 p-8">
                  <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {featuredPost.category}
                  </Badge>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                    <Link 
                      to={featuredPost.slug ? `/${featuredPost.slug}` : `/post/${featuredPost.id}`}
                      onClick={() => {
                        console.log('🔗 Link clicked for featured post:');
                        console.log('  - Title:', featuredPost.title);
                        console.log('  - Slug:', featuredPost.slug);
                        console.log('  - ID:', featuredPost.id);
                        console.log('  - Target URL:', featuredPost.slug ? `/${featuredPost.slug}` : `/post/${featuredPost.id}`);
                      }}
                    >
                      {featuredPost.title}
                    </Link>
                  </h4>
                  <p className="text-gray-600 mb-6 line-clamp-3">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <img
                        src={featuredPost.author.avatar}
                        alt={featuredPost.author.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{featuredPost.author.name}</p>
                        <p className="text-xs text-gray-500">{featuredPost.date}</p>
                      </div>
                    </div>
                    <Link 
                      to={featuredPost.slug ? `/${featuredPost.slug}` : `/post/${featuredPost.id}`}
                      onClick={() => {
                        console.log('🔗 Read More clicked for featured post:');
                        console.log('  - Title:', featuredPost.title);
                        console.log('  - Slug:', featuredPost.slug);
                        console.log('  - ID:', featuredPost.id);
                        console.log('  - Target URL:', featuredPost.slug ? `/${featuredPost.slug}` : `/post/${featuredPost.id}`);
                      }}
                    >
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        Read More <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="overflow-hidden shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <PenTool className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="text-2xl font-semibold text-gray-900">Start Your Blog Journey</h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    No posts yet? Create your first blog post and watch your content come to life!
                  </p>
                  {(user && (userRole === 'admin' || userRole === 'editor' || isNanopro)) && (
                    <div className="pt-4">
                      <Link to="/write">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          <PenTool className="w-4 h-4 mr-2" />
                          Write Your First Post
                        </Button>
                      </Link>
                    </div>
                  )}
                  {!user && (
                    <div className="pt-4">
                      <Link to="/auth">
                        <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign In to Write
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-4">
        <div className="max-w-6xl mx-auto">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </section>

      {/* Tag Filter Display */}
      {selectedTag && (
        <section className="px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Showing posts tagged with:
                </span>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  #{selectedTag}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchParams({});
                  setSelectedTag(null);
                  loadBlogPosts();
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filter
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Latest Articles</h3>
            {(searchTerm || selectedTag) && (
              <div className="text-sm text-gray-600">
                {displayPosts.length} result{displayPosts.length !== 1 ? 's' : ''} 
                {searchTerm && ` for "${searchTerm}"`}
                {selectedTag && ` tagged with "${selectedTag}"`}
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : displayPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayPosts
                  .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
                  .map((post) => (
                    <BlogPost key={post.id} post={post} />
                  ))}
              </div>
              
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-8">
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(displayPosts.length / postsPerPage)}
                </span>
                <Button 
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(displayPosts.length / postsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(displayPosts.length / postsPerPage)}
                  className="flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h4 className="text-xl font-semibold mb-2">No Articles Found</h4>
                <p>
                  {searchTerm 
                    ? `No articles found for "${searchTerm}". Try a different search term.`
                    : selectedCategory !== 'All' 
                      ? `No articles found in "${selectedCategory}" category.`
                      : 'No articles available at the moment. Check back soon!'}
                </p>
              </div>
              {(searchTerm || selectedCategory !== 'All') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    loadBlogPosts();
                  }}
                >
                  Show All Articles
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Ad - Between blog posts and newsletter */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<div className="h-32 bg-gray-200 animate-pulse rounded"></div>}>
            <GoogleAd slot="banner" className="flex justify-center" />
          </Suspense>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Get the latest articles delivered straight to your inbox
          </p>
          <NewsletterSubscription />
        </div>
      </section>


      {/* Floating Action Button for Write (Mobile) */}
      {user && (userRole === 'admin' || userRole === 'editor') && (
        <Link
          to="/write"
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40 md:hidden"
        >
          <PenTool className="w-6 h-6" />
        </Link>
      )}

      <BackToTopButton />
      
      {/* Privacy Policy Link - Required for Google Verification */}
      <div className="bg-gray-50 border-t py-4 text-center">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-sm text-gray-600">
            By using this website, you agree to our{' '}
            <Link 
              to="/privacy-policy" 
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Privacy Policy
            </Link>
            {' '}and{' '}
            <Link 
              to="/privacy-policy" 
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
