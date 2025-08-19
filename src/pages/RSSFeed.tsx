import { useEffect } from 'react';

const RSSFeed = () => {
  useEffect(() => {
    // Redirect to the RSS feed URL
    window.location.href = 'https://rowcloxlszwnowlggqon.supabase.co/functions/v1/rss-feed';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to RSS Feed...</h1>
        <p className="text-gray-600">
          If you're not redirected automatically, 
          <a 
            href="https://rowcloxlszwnowlggqon.supabase.co/functions/v1/rss-feed" 
            className="text-blue-600 hover:underline ml-1"
          >
            click here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RSSFeed;
