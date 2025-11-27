import { Menu, X as CloseIcon } from "lucide-react";
import { X as MultiplyIcon } from "lucide-react";
import logo from '../assets/logoNEXTGEN.png';
import Hypelogo from '../assets/Hype_page-0001.png';
import { useState, useEffect } from "react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Check if Contact section is in view
  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Hide header when contact section is 100px from top
        if (rect.top <= 100) {
          setIsHeaderVisible(false);
        } else {
          setIsHeaderVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll function
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Height of fixed header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    closeMobileMenu();
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-coral-primary transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-4 lg:px-8 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <img 
              src={logo}
              alt="NextGen Brothers Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <MultiplyIcon className="w-8 h-8 text-black" strokeWidth={1.5} />
          <div className="w-20 h-20 flex items-center justify-center overflow-hidden">
            <img 
              src={Hypelogo}
              alt="Hype Logo" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
          <a 
            href="#home"
            onClick={(e) => scrollToSection(e, 'home')}
            className="px-6 py-2 text-black border border-black text-sm uppercase tracking-wide transition-colors hover:bg-gray-section hover:text-black"
          >
            Home
          </a>
          <a 
            href="#artists"
            onClick={(e) => scrollToSection(e, 'artists')}
            className="px-6 py-2 border border-black text-black text-sm uppercase tracking-wide bg-transparent transition-colors hover:bg-gray-section"
          >
            Our Artists
          </a>
          <a 
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className="px-6 py-2 border border-black text-black text-sm uppercase tracking-wide bg-transparent transition-colors hover:bg-gray-section"
          >
            Contact
          </a>
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button 
          className="md:hidden w-10 h-10 flex items-center justify-center z-50"
          aria-label="Toggle Menu"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <CloseIcon className="w-6 h-6 text-black" strokeWidth={3} />
          ) : (
            <Menu className="w-6 h-6 text-black" strokeWidth={3} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed top-0 right-0 h-screen w-64 bg-coral-primary border-l-2 border-black transform transition-transform duration-300 ease-in-out z-40 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-4 p-8 mt-24">
          <a 
            href="#home"
            onClick={(e) => scrollToSection(e, 'home')}
            className="px-6 py-3 text-black border border-black text-sm uppercase tracking-wide transition-colors hover:bg-gray-section hover:text-black text-center"
          >
            Home
          </a>
          <a 
            href="#artists"
            onClick={(e) => scrollToSection(e, 'artists')}
            className="px-6 py-3 border border-black text-black text-sm uppercase tracking-wide bg-transparent transition-colors hover:bg-gray-section text-center"
          >
            Our Artists
          </a>
          <a 
            href="#contact"
            onClick={(e) => scrollToSection(e, 'contact')}
            className="px-6 py-3 border border-black text-black text-sm uppercase tracking-wide bg-transparent transition-colors hover:bg-gray-section text-center"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
