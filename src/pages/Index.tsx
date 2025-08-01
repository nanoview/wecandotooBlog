
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, User, Tag, ChevronRight, Star, LogIn, Settings, LogOut, Loader2, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import BlogPost from '@/components/BlogPost';
import CategoryFilter from '@/components/CategoryFilter';
import { blogPosts as fallbackPosts, categories as fallbackCategories } from '@/data/blogData';
import { useAuth } from '@/hooks/useAuth';
import { fetchBlogPosts, fetchCategories, searchBlogPosts, fetchBlogPostsByCategory } from '@/services/blogService';
import { BlogPost as BlogPostType } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, userRole, username, signOut, isNanopro } = useAuth();
  const { toast } = useToast();

  // State for dynamic data
  const [blogPosts, setBlogPosts] = useState<BlogPostType[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // Helper to check if current user is admin
  const isAdmin = userRole === 'admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else if (selectedCategory === 'All') {
        loadBlogPosts();
      } else {
        handleCategoryChange(selectedCategory);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load posts and categories in parallel
      const [postsData, categoriesData] = await Promise.all([
        fetchBlogPosts().catch(() => fallbackPosts), // Fallback to static data on error
        fetchCategories().catch(() => fallbackCategories)
      ]);

      setBlogPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      // Use fallback data
      setBlogPosts(fallbackPosts);
      setCategories(fallbackCategories);
      toast({
        title: "Notice",
        description: "Using offline content. Some features may be limited.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBlogPosts = async () => {
    try {
      const posts = await fetchBlogPosts();
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setSearchLoading(true);
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
  };

  const handleCategoryChange = async (category: string) => {
    console.log(`🏷️ Category changed to: "${category}"`);
    setSelectedCategory(category);
    
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
  };

  // Filter posts for display (used when searching within a category)
  const filteredPosts = blogPosts.filter(post => {
    if (!searchTerm.trim()) return true;
    
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts[0];
  const displayPosts = filteredPosts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BlogSpace
              </h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Contact
              </Link>
              {user && (
                <Link 
                  to="/write" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  Write
                </Link>
              )}
              {userRole === 'editor' && (
                <Link to="/editor" className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Editor
                </Link>
              )}
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Mini profile dropdown */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 focus:outline-none">
                      <User className="w-6 h-6 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">{username || user.email?.split('@')[0]}</span>
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="font-medium text-gray-900 truncate">{username || user.email?.split('@')[0]}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            isNanopro 
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isNanopro ? 'Super Admin' : userRole || 'user'}
                          </span>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</Link>
                      )}
                      <button
                        onClick={signOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
                      >
                        <LogOut className="inline w-4 h-4 mr-2 align-text-bottom" />Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/auth">
                  <Button>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Amazing Stories
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore thought-provoking articles, tutorials, and insights from our community of writers
          </p>
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
                    <Link to={`/post/${featuredPost.id}`}>{featuredPost.title}</Link>
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
                    <Link to={`/post/${featuredPost.id}`}>
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
              <CardContent className="p-8 text-center">
                <h4 className="text-xl font-semibold text-gray-600 mb-2">No Featured Post Available</h4>
                <p className="text-gray-500">Check back soon for new content!</p>
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

      {/* Blog Posts Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Latest Articles</h3>
            {searchTerm && (
              <div className="text-sm text-gray-600">
                {displayPosts.length} result{displayPosts.length !== 1 ? 's' : ''} for "{searchTerm}"
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayPosts.slice(featuredPost ? 1 : 0).map((post) => (
                <BlogPost key={post.id} post={post} />
              ))}
            </div>
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

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-8 text-lg">
            Get the latest articles delivered straight to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
            />
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <h4 className="text-xl font-bold">BlogSpace</h4>
              </div>
              <p className="text-gray-400">
                A platform for sharing knowledge and connecting with like-minded readers.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Categories</h5>
              <ul className="space-y-2 text-gray-400">
                {categories.slice(1, 6).map((category) => (
                  <li key={category}>
                    <button 
                      onClick={() => handleCategoryChange(category)}
                      className="hover:text-white transition-colors text-left"
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Connect</h5>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#" className="hover:text-white transition-colors">Twitter</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">LinkedIn</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link to="#" className="hover:text-white transition-colors">RSS</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BlogSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Write (Mobile) */}
      {user && (
        <Link
          to="/write"
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40 md:hidden"
        >
          <PenTool className="w-6 h-6" />
        </Link>
      )}
    </div>
  );
};

export default Index;
