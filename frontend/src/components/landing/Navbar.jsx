import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    // Set initial mobile state
    checkMobile();

    const handleResize = () => {
      checkMobile();
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">JF</span>
          </div>
          <span className={`text-xl font-bold ${scrolled ? 'text-gray-800' : 'text-white'}`}>
            JobFit
          </span>
        </div>

        {!isMobile ? (
          <>
            <ul className="hidden md:flex space-x-8 items-center">
              <li>
                <a
                  href="#features"
                  className={`hover:text-blue-600 transition-colors duration-200 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#testimonials"
                  className={`hover:text-blue-600 transition-colors duration-200 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className={`hover:text-blue-600 transition-colors duration-200 ${
                    scrolled ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  Contact
                </a>
              </li>
            </ul>

            <div className="hidden md:flex items-center space-x-4">
              <button className={`font-medium transition-colors duration-200 ${
                scrolled ? 'text-blue-700 hover:text-blue-800' : 'text-white hover:text-blue-200'
              }`}>
                Log in
              </button>
              <button className={`px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                scrolled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-white text-blue-700 hover:bg-blue-50'
              }`}>
                Get Started
              </button>
            </div>
          </>
        ) : (
          <button
            className={`md:hidden ${scrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="md:hidden bg-white absolute top-full left-0 w-full px-6 py-5 flex flex-col space-y-4 border-t border-gray-200 shadow-lg z-40">
          <a
            href="#features"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Testimonials
          </a>
          <a
            href="#contact"
            className="text-gray-700 hover:text-blue-600 transition-colors duration-200 py-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </a>
          <div className="flex flex-col space-y-3 pt-2">
            <button className="text-blue-700 hover:text-blue-800 font-medium transition-colors duration-200 text-left">
              Log in
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 w-full">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
