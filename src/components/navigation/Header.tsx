import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import Logo from './Logo';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  variant?: 'full' | 'simple';
  showBackButton?: boolean;
  backTo?: string;
  backLabel?: string;
}

const Header = ({ 
  variant = 'full', 
  showBackButton = false, 
  backTo = '/', 
  backLabel = 'Back to Home' 
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  if (variant === 'simple') {
    return (
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo />
            
            {/* Desktop Navigation for simple variant */}
            <DesktopNavigation />
            
            {/* Mobile Menu Button for simple variant */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Toggle mobile menu"
              >
                <MoreVertical className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation for simple variant */}
          <MobileNavigation 
            isOpen={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)} 
          />
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Desktop Navigation */}
          <DesktopNavigation />
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Toggle mobile menu"
            >
              <MoreVertical className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <MobileNavigation 
          isOpen={mobileMenuOpen} 
          onClose={() => setMobileMenuOpen(false)} 
        />
      </div>
    </header>
  );
};

export default Header;
