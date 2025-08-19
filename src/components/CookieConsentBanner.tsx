import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsentBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="w-6 h-6 text-yellow-400" />
          <p className="text-sm">
            We use cookies and similar technologies to improve your experience. By using our site, you agree to our 
            <Link to="/privacy-policy" className="underline hover:text-gray-200 ml-1">
              Privacy & Cookie Policy
            </Link>.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            size="sm" 
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Accept & Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
