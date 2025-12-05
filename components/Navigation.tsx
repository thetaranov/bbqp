import React, { useState, useEffect, useRef } from 'react';
import { NAV_LINKS } from '../constants';
import { Menu, X, MessageSquare } from 'lucide-react';

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

  // Исправлено: удалена сложная логика классов, теперь фон стабилен
  const baseNavClasses = `fixed top-0 left-0 right-0 z-[100] py-4 transition-all duration-700`;
  const loadedClasses = isIntroComplete 
    ? 'opacity-100 translate-y-0 bg-black/60 backdrop-blur-md border-b border-white/10' 
    : 'opacity-0 -translate-y-4';

  useEffect(() => {
    const activeIndex = NAV_LINKS.findIndex(link => link.href.substring(1) === activeSection);

    if (activeIndex !== -1 && itemsRef.current[activeIndex]) {
      const element = itemsRef.current[activeIndex];
      if (element) {
        setIndicatorStyle({
          left: element.offsetLeft,
          width: element.offsetWidth,
          opacity: 1
        });
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
      element.scrollIntoView({ behavior: 'smooth' });
    }

    setIsMobileMenuOpen(false);
  };

  const handleConfiguratorScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('models');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav ref={navRef} className={`${baseNavClasses} ${loadedClasses}`}>
      <div className="max-w-[95rem] mx-auto px-6 lg:px-8 flex justify-between items-center min-h-[40px]">
        <a 
          href="#" 
          onClick={(e) => handleScrollTo(e, "#hero")} 
          className={`text-2xl md:text-3xl font-bold tracking-tighter z-10 relative hover:opacity-80 transition-opacity duration-1000 text-white`}
        >
          bbqp
        </a>

        <div className="hidden lg:flex items-center relative rounded-full p-1 border transition-colors duration-500 bg-white/5 border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <div 
            className="absolute h-[calc(100%-8px)] top-1 bg-orange-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.5)]"
            style={{ 
              left: indicatorStyle.left, 
              width: indicatorStyle.width,
              opacity: indicatorStyle.opacity,
              transitionProperty: 'left, width, opacity',
              transitionDuration: '350ms',
              transitionTimingFunction: 'cubic-bezier(0.2, 0, 0.2, 1.4)' 
            }}
          />

          {NAV_LINKS.map((link, index) => (
            <a
              key={link.name}
              href={link.href}
              ref={(el) => { itemsRef.current[index] = el; }}
              onClick={(e) => handleScrollTo(e, link.href)}
              className={`relative z-10 px-5 py-2 text-sm font-medium transition-all duration-500 ${
                activeSection === link.href.substring(1) 
                  ? 'text-white drop-shadow-md' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
           <a 
            href="#models"
            onClick={handleConfiguratorScroll}
            className="relative overflow-hidden px-6 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10">Собрать свой</span>
          </a>
        </div>

        <div className="lg:hidden absolute right-6 flex items-center gap-4">
          <button
            className={`p-1 transition-colors z-20 text-white`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={`lg:hidden absolute top-full left-0 w-full border-t p-6 flex flex-col gap-1 shadow-2xl animate-fade-in h-screen z-10 bg-black/95 backdrop-blur-xl border-white/10`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className={`text-lg font-semibold py-3 border-b last:border-0 flex items-center justify-between transition-colors duration-200 ${
                 activeSection === link.href.substring(1) 
                 ? 'text-orange-500 border-orange-500/20' 
                 : `text-white border-gray-500/20`
              }`}
            >
              {link.name}
              {activeSection === link.href.substring(1) && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shadow-[0_0_10px_orange]"></div>}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navigation;