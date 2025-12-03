import React, { useState, useEffect, useRef } from 'react';
import { NAV_LINKS } from '../constants';
import { Menu, X, MessageSquare, Settings } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  isIntroComplete?: boolean;
  onChatToggle?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeSection, isIntroComplete = true, onChatToggle }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const itemsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const navRef = useRef<HTMLElement>(null);

  // Always Dark Theme / Hero Style
  const bgClass = 'bg-black/90 backdrop-blur-md border-b border-white/10';
  const logoColorClass = 'text-white';
  const inactiveColorClass = 'text-gray-400 hover:text-white';
  const mobileMenuBg = 'bg-black/95 backdrop-blur-xl';

  useEffect(() => {
    const activeIndex = NAV_LINKS.findIndex(link => link.href.substring(1) === activeSection);

    if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
      const element = itemsRef.current[activeIndex];
      if (element) {
        const parent = element.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const elementRect = element.getBoundingClientRect();
          setIndicatorStyle({
            left: elementRect.left - parentRect.left,
            width: elementRect.width,
            opacity: 1
          });
        }
      }
    } else {
      setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection]);

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);

    if (element) {
      const offset = 80; // Отступ для навигации
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }

    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-500 py-3 ${bgClass} ${isIntroComplete ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <a 
            href="#" 
            onClick={(e) => handleScrollTo(e, "#hero")} 
            className={`text-2xl font-bold tracking-tighter ${logoColorClass} hover:opacity-80 transition-opacity`}
          >
            bbqp
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1 relative">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              {/* Sliding Indicator */}
              <div 
                className="absolute h-10 bg-white/10 rounded-full transition-all duration-300"
                style={{ 
                  left: indicatorStyle.left, 
                  width: indicatorStyle.width,
                  opacity: indicatorStyle.opacity,
                }}
              />

              {NAV_LINKS.map((link, index) => (
                <a
                  key={link.name}
                  href={link.href}
                  ref={(el) => { itemsRef.current[index] = el; }}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className={`relative z-10 px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                    activeSection === link.href.substring(1) 
                      ? 'text-white' 
                      : inactiveColorClass
                  }`}
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="ml-4 flex items-center space-x-2">
              <a 
                href="https://t.me/thetaranov"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-full hover:bg-orange-700 transition-colors"
              >
                Собрать свой
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            <button
              className={`p-2 ${logoColorClass} hover:text-orange-500 transition-colors`}
              onClick={onChatToggle}
              aria-label="Support"
            >
              <MessageSquare size={22} />
            </button>

            <button
              className={`p-2 ${logoColorClass}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`lg:hidden fixed inset-0 top-14 ${mobileMenuBg} animate-fadeIn`}>
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleScrollTo(e, link.href)}
                  className={`block py-3 px-4 rounded-lg text-lg font-medium transition-colors ${
                    activeSection === link.href.substring(1) 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-4 mt-4 border-t border-white/10">
                <a 
                  href="https://t.me/thetaranov"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-orange-600 text-white text-center font-semibold rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Собрать свой bbqp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;