import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              My Blog
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Home
            </Link>
            <Link to="/about" className="text-base font-medium text-gray-500 hover:text-gray-900">
              About
            </Link>
            <Link to="/contact" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </div>
          <div className="hidden md:flex items-center">
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
          <div className="md:hidden flex items-center">
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" size="icon">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-base font-medium text-gray-500 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link to="/about" className="text-base font-medium text-gray-500 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="text-base font-medium text-gray-500 hover:text-gray-900" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              <Button asChild>
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
