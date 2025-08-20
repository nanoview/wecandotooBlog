import { Link, useLocation } from 'react-router-dom';
import { LogIn, User, Settings, PenTool, Edit, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavigation = ({ isOpen, onClose }: MobileNavigationProps) => {
  const { user, userRole, username, signOut } = useAuth();
  const location = useLocation();
  const isAdmin = userRole === 'admin';

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `px-2 py-1 font-medium transition-colors ${
      isActive 
        ? 'text-blue-600 bg-blue-50 rounded' 
        : 'text-gray-700 hover:text-blue-600'
    }`;
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden pt-4 pb-2 border-t mt-4 transition-all">
      <nav className="flex flex-col space-y-3">
        <Link 
          to="/" 
          className={getLinkClass('/')}
          onClick={onClose}
        >
          Home
        </Link>
        <Link 
          to="/about" 
          className={getLinkClass('/about')}
          onClick={onClose}
        >
          About
        </Link>
        <Link 
          to="/contact" 
          className={getLinkClass('/contact')}
          onClick={onClose}
        >
          Contact
        </Link>
        <Link 
          to="/privacy-policy" 
          className={getLinkClass('/privacy-policy')}
          onClick={onClose}
        >
          Privacy Policy
        </Link>
        
        {!user ? (
          <Link 
            to="/auth" 
            onClick={onClose}
            className="flex items-center"
          >
            <Button size="sm" className="w-full justify-start">
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
        ) : (
          <div className="border-t pt-2">
            <div className="px-2 py-1 flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {username || user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500">{userRole || 'user'}</div>
              </div>
            </div>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="flex items-center px-2 py-1 text-gray-700 hover:text-blue-600"
                onClick={onClose}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Link>
            )}
            
            {(userRole === 'editor' || userRole === 'admin') && (
              <Link 
                to="/editor-panel" 
                className="flex items-center px-2 py-1 text-gray-700 hover:text-blue-600"
                onClick={onClose}
              >
                <PenTool className="w-4 h-4 mr-2" />
                Editor Dashboard
              </Link>
            )}
            
            {(userRole === 'admin' || userRole === 'editor') && (
              <Link 
                to="/write" 
                className="flex items-center px-2 py-1 text-gray-700 hover:text-blue-600"
                onClick={onClose}
              >
                <Edit className="w-4 h-4 mr-2" />
                Write
              </Link>
            )}
            
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center px-2 py-1 text-red-600 hover:bg-gray-100 mt-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default MobileNavigation;
