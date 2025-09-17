import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getBuyMeCoffeeUrl, PAYMENT_CONFIG } from '@/config/payment';

const Footer = () => {
  const { userRole } = useAuth();
  const categories = [
    'Technology', 'Business', 'Design', 'Development', 
    'Education', 'Lifestyle', 'Travel', 'Other'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <h3 className="text-xl font-bold">wecandotoo</h3>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Empowering voices and sharing knowledge through quality content and meaningful connections.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Home
              </Link>
              <Link to="/about" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                About
              </Link>
              <Link to="/contact" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Contact
              </Link>
              <a 
                href={getBuyMeCoffeeUrl({ description: PAYMENT_CONFIG.messages.coffee })}
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium"
              >
                ☕ Buy me a coffee
              </a>
              <Link to="/premium" className="block text-gold-400 hover:text-gold-300 transition-colors text-sm font-medium">
                🔒 Premium Content
              </Link>
              <Link to="/privacy-policy" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Privacy Policy
              </Link>
              {(userRole === 'admin' || userRole === 'editor') && (
                <Link to="/write" className="block text-gray-300 hover:text-blue-400 transition-colors text-sm">
                  Write
                </Link>
              )}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {categories.map((category) => (
                <Link
                  key={category}
                  to={`/?category=${category.toLowerCase()}`}
                  className="block text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="space-y-2">
              <a 
                href="mailto:hello@wecandotoo.com" 
                className="block text-gray-300 hover:text-blue-400 transition-colors text-sm"
              >
                hello@wecandotoo.com
              </a>
              <a 
                href="mailto:arif.js@hotmail.com" 
                className="block text-gray-300 hover:text-blue-400 transition-colors text-sm"
              >
                arif.js@hotmail.com
              </a>
              <div className="pt-2">
                <p className="text-gray-400 text-xs">
                  Follow us on social media for updates
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 wecandotoo. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/privacy-policy" className="text-gray-300 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/contact" className="text-gray-300 hover:text-blue-400 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;