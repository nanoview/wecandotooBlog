import { useEffect } from 'react';

const SitemapXML = () => {
  useEffect(() => {
    // Redirect to the sitemap URL
    window.location.href = 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/sitemap';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to XML Sitemap...</h1>
        <p className="text-gray-600">
          If you're not redirected automatically, 
          <a 
            href="https://rowcloxlszwnowlggqon.supabase.co/functions/v1/sitemap" 
            className="text-blue-600 hover:underline ml-1"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SitemapXML;
