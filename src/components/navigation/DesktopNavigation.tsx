import { Link, useLocation } from 'react-router-dom';
import { LogIn, User, Settings, PenTool, Edit, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const DesktopNavigation = () => {
  const { user, userRole, username, signOut, isNanopro } = useAuth();
  const location = useLocation();
  const isAdmin = userRole === 'admin';

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `font-medium transition-colors ${
      isActive 
        ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
        : 'text-gray-700 hover:text-blue-600'
    }`;
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <Link to="/" className={getLinkClass('/')}>
        Home
      </Link>
      <Link to="/about" className={getLinkClass('/about')}>
        About
      </Link>
      <Link to="/contact" className={getLinkClass('/contact')}>
        Contact
      </Link>
      
      {!user ? (
        <Link to="/auth">
          <Button>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </Link>
      ) : (
        <div className="flex items-center space-x-4">
          {/* User Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center space-x-2 focus:outline-none">
              <User className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">
                {username || user.email?.split('@')[0]}
              </span>
              <svg 
                className="w-4 h-4 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-medium text-gray-900 truncate">
                  {username || user.email?.split('@')[0]}
                </div>
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
              
              {/* Navigation Links */}
              {isAdmin && (
                <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Settings className="inline w-4 h-4 mr-2 align-text-bottom" />
                  Admin
                </Link>
              )}
              
              {(userRole === 'editor' || userRole === 'admin') && (
                <Link to="/editor-panel" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <PenTool className="inline w-4 h-4 mr-2 align-text-bottom" />
                  Editor Dashboard
                </Link>
              )}
              
              {(userRole === 'admin' || userRole === 'editor') && (
                <Link to="/write" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Edit className="inline w-4 h-4 mr-2 align-text-bottom" />
                  Write
                </Link>
              )}
              
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t border-gray-100"
              >
                <LogOut className="inline w-4 h-4 mr-2 align-text-bottom" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DesktopNavigation;
