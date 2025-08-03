import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Check if we're on a post page
  const isPostPage = location.pathname.startsWith('/post/') || 
                     (location.pathname !== '/' && 
                      !location.pathname.includes('/admin') && 
                      !location.pathname.includes('/editor') &&
                      !location.pathname.includes('/write') &&
                      !location.pathname.includes('/auth'));

  // Show button when scrolled down 400px on post pages, 600px elsewhere
  const toggleVisibility = () => {
    const scrollThreshold = isPostPage ? 400 : 600;
    
    if (window.scrollY > scrollThreshold) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [isPostPage]);

  return (
    <button
      onClick={scrollToTop}
      className={`fixed z-50 transition-all duration-300 ${
        isPostPage 
          ? 'bottom-8 right-8 bg-blue-600/80 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg' 
          : 'bottom-6 right-6 bg-gray-700/70 hover:bg-gray-700 text-white p-2 rounded-full shadow-md'
      } ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      <ChevronUp className={`${isPostPage ? 'h-6 w-6' : 'h-5 w-5'}`} />
    </button>
  );
};

export default BackToTopButton;