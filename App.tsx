import React, { useState, useEffect, useRef, Suspense, lazy, useMemo, useCallback } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturesSection from './components/MenuSection';
import ParallaxImage from './components/ParallaxImage';
import Reveal from './components/Reveal';
import ParticlesOverlay from './components/ParticlesOverlay';
import { DETAILS_ITEMS } from './constants';
import { Check, ArrowRight, Upload, ChevronLeft, Loader2, Settings2, X, MoveRight, Box, ScanLine, RotateCcw, FileText } from 'lucide-react';

// Lazy Load Heavy Components
const ChefBot = lazy(() => import('./components/ChefBot'));
const Grill3D = lazy(() => import('./components/Grill3D'));
const RecipeGenerator = lazy(() => import('./components/RecipeGenerator'));

// Optimization Constants
const SECTION_ORDER = ['hero', 'features', 'autodraft', 'details', 'personalize', 'military', 'models', 'ai-chef'];

// Configuration Data
type Option = { label: string; price: number; value: string };
type ConfigCategory = { id: string; name: string; options: Option[] };

const CONFIG_OPTIONS: ConfigCategory[] = [
  {
    id: 'model',
    name: 'Модель',
    options: [
      { label: 'Model V', price: 25000, value: 'v' },
      { label: 'Model W', price: 35000, value: 'w' }
    ]
  },
  {
    id: 'color',
    name: 'Материал',
    options: [
      { label: 'Black Matt (Сталь)', price: 0, value: 'black' },
      { label: 'Stainless (Нержавейка)', price: 15000, value: 'stainless' }
    ]
  },
  {
    id: 'engraving',
    name: 'Гравировка',
    options: [
      { label: 'Без гравировки', price: 0, value: 'none' },
      { label: 'Стандартная', price: 1000, value: 'standard' },
      { label: 'Свой эскиз', price: 5000, value: 'custom' }
    ]
  }
];

const PHYSICS_FORMULAS = [
  "Q = c·m·Δt", "C + O₂ → CO₂ + Q", "F = m·a", "P + ρv²/2 = const", "PV = nRT",
  "Q = q·m", "v = √(2ΔP/ρ)", "ΔU = Q - W", "Q = L·m", "Q = r·m", "η = 1 - T₂/T₁", "dQ = dU + pdV"
];

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const FloatingFormula: React.FC<{ item: any, pool: string[] }> = ({ item, pool }) => {
  const [text, setText] = useState(item.formula);
  return (
     <div
        className="absolute font-scientific font-bold text-gray-800 select-none whitespace-nowrap pointer-events-none opacity-0"
        style={{
          left: `${item.left}%`, 
          top: `${item.top}%`, 
          fontSize: `${1.0 + (item.scale * 0.4)}rem`, 
          filter: `blur(${item.blur}px)`,
          '--scale': item.scale,
          '--max-opacity': item.opacity,
          animation: `comet-move ${item.duration}s linear infinite`, 
          animationDelay: `${item.delay}s`,
        } as React.CSSProperties}
        onAnimationIteration={() => {
            setText(pool[Math.floor(Math.random() * pool.length)]);
        }}
     >
        {text}
     </div>
  );
};

const MarqueeImage = React.memo(({ src, className }: { src: string, className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-black/40 border border-white/5 rounded-2xl ${className}`}>
        <img 
            src={src} 
            alt="" 
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${loaded ? 'opacity-80' : 'opacity-0'}`} 
        />
    </div>
  );
});

const OptimizedMarqueeRow = ({ reverse = false, items, speed = 1, itemClassName = "" }: { reverse?: boolean, items: typeof DETAILS_ITEMS, speed?: number, itemClassName?: string }) => {
    const [containerWidth, setContainerWidth] = useState(0);
    const rowRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const animationFrameRef = useRef<number>(0);
    const marqueeItems = useMemo(() => [...items, ...items, ...items, ...items], [items]); 

    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
             for (const entry of entries) {
                 setContainerWidth(entry.contentRect.width);
             }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        const el = rowRef.current;
        if (!el) return;
        const animate = () => {
            const totalWidth = el.scrollWidth;
            const oneSetWidth = totalWidth / 4;
            if (oneSetWidth <= 0) { animationFrameRef.current = requestAnimationFrame(animate); return; }
            if (reverse) {
                positionRef.current += speed;
                if (positionRef.current >= 0) positionRef.current = -oneSetWidth * 2;
            } else {
                positionRef.current -= speed;
                if (positionRef.current <= -oneSetWidth * 2) positionRef.current = -oneSetWidth;
            }
            el.style.transform = `translate3d(${positionRef.current}px, 0, 0)`;
            animationFrameRef.current = requestAnimationFrame(animate);
        };
        if (positionRef.current === 0) positionRef.current = -100;
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
    }, [reverse, speed]);

    return (
        <div ref={containerRef} className="relative w-full overflow-hidden select-none pointer-events-none">
            <div ref={rowRef} className="flex gap-4 md:gap-6 w-max will-change-transform" style={{ transform: 'translate3d(0,0,0)' }}>
                {marqueeItems.map((item, idx) => (
                    <MarqueeImage key={`${item.id}-${idx}`} src={item.image} className={`flex-shrink-0 ${itemClassName}`} />
                ))}
            </div>
        </div>
    );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
        <div className="p-6 border-t border-white/10">
          <button onClick={onClose} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const TELEGRAM_LINK = "https://t.me/thetaranov";
  const MODEL_URL = "/assets/models/mangal.obj";

  // Config State - DEFAULT: Stainless (1), Standard (1)
  const [config, setConfig] = useState<Record<string, Option>>({
    model: CONFIG_OPTIONS[0].options[0], 
    color: CONFIG_OPTIONS[1].options[1], 
    engraving: CONFIG_OPTIONS[2].options[1], 
  });

  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customTextureUrl, setCustomTextureUrl] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>('model'); 
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [introStep, setIntroStep] = useState(0); 
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const personalizationVideoRef = useRef<HTMLVideoElement>(null);

  const row1Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);
  const row2Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);
  const row3Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);

  const formulaData = useMemo(() => {
    const pos: any[] = [];
    const usedRects: {l: number, t: number, w: number, h: number}[] = [];
    const shuffledFormulas = [...PHYSICS_FORMULAS].sort(() => 0.5 - Math.random());
    // Increased count to 16 as per reference
    for (let i = 0; i < 16; i++) {
        let placed = false, attempts = 0;
        while (!placed && attempts < 2000) {
            const l = Math.random() * 95, t = Math.random() * 95;
            const overlap = usedRects.some(r => l < r.l + 22 && l + 22 > r.l && t < r.t + 14 && t + 14 > r.t);
            const imageOverlap = (l > 70 && t > 20 && t < 80);

            if (!overlap && !imageOverlap) {
                const scale = 0.5 + Math.random() * 1.0;
                let blur = 0; 
                if (scale > 1.2) blur = (scale - 1.2) * 1.5;
                if (l < 45 && t > 20 && t < 75) blur += 1.5;

                pos.push({
                    left: l, 
                    top: t, 
                    // duration from 6 to 14 seconds (doubled from 3-7)
                    duration: 6 + (Math.random() * 8), 
                    delay: -Math.random() * 10,
                    scale, 
                    blur, 
                    opacity: scale > 1.2 ? 0.35 : 0.5, 
                    formula: shuffledFormulas[i % shuffledFormulas.length]
                });
                usedRects.push({l, t, w: 22, h: 14});
                placed = true;
            }
            attempts++;
        }
    }
    return pos;
  }, []);

  useEffect(() => {
    const timer1 = setTimeout(() => setIntroStep(1), 1000);
    const timer2 = setTimeout(() => setIntroStep(2), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  const isIntroComplete = introStep >= 2;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { threshold: 0.5 });
    (Object.values(sectionRefs.current) as (Element | null)[]).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; };
  const handleSelect = (categoryId: string, option: Option) => setConfig(prev => ({ ...prev, [categoryId]: option }));
  const toggleCategory = (id: string) => setOpenCategory(openCategory === id ? null : id);
  const calculateTotal = () => (Object.values(config) as Option[]).reduce((acc, item) => acc + item.price, 0);

  const getOrderLink = () => {
    let text = `Здравствуйте! Хочу заказать bbqp:%0A` +
      Object.entries(config).map(([key, val]) => `- ${CONFIG_OPTIONS.find(c => c.id === key)?.name}: ${(val as Option).label}`).join('%0A') +
      `%0A%0AСтоимость: ${calculateTotal()} руб.`;
    if (config.engraving.value === 'custom' && customFile) text += `%0A%0AФайл: ${customFile.name}`;
    return `${TELEGRAM_LINK}?text=${text}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setCustomFile(file);
        setCustomTextureUrl(URL.createObjectURL(file));
    }
  };

  const scrollToConfigurator = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('models');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setOpenCategory('engraving');
        setIs3DActive(true);
        if (isMobile) setMobileConfigOpen(true);
    }
  };

  const handleStartOver = () => {
    const hero = document.getElementById('hero');
    if (hero) hero.scrollIntoView({ behavior: 'smooth' });
  };

  const SectionLoader = () => (
    <div className="w-full h-full flex items-center justify-center bg-transparent">
      <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
    </div>
  );

  const shouldRenderSection = (sectionId: string) => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    const targetIndex = SECTION_ORDER.indexOf(sectionId);
    return Math.abs(currentIndex - targetIndex) <= 1;
  };

  const ConfiguratorPanel = () => (
    <div className="flex flex-col h-full text-white">
         <div className="p-6 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Settings2 size={20} className="text-orange-500"/>
                    Конфигуратор
                </h2>
                <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-wider">Соберите свой bbqp</p>
            </div>
            {!isMobile && (
                <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">Итого</div>
                    <div className="text-xl font-bold text-white">{calculateTotal().toLocaleString()} ₽</div>
                </div>
            )}
         </div>
         <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {CONFIG_OPTIONS.map((category) => (
               <div key={category.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10 group backdrop-blur-sm">
                  <button onClick={() => toggleCategory(category.id)} className={`w-full flex items-center justify-between p-4 text-left transition-colors`}>
                     <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{category.name}</span>
                        <div className="flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_orange]"></span>
                             <span className="text-[11px] text-gray-500 truncate max-w-[180px]">{config[category.id].label}</span>
                        </div>
                     </div>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-transform duration-300 ${openCategory === category.id ? 'bg-white/10 rotate-180' : 'bg-transparent'}`}>
                        <ChevronLeft size={16} className="-rotate-90 text-gray-400"/>
                     </div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openCategory === category.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="p-4 pt-0">
                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
                            {category.options.map((opt) => {
                                const isSelected = config[category.id].value === opt.value;
                                return (
                                   <button key={opt.value} onClick={() => handleSelect(category.id, opt)} className={`relative flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${isSelected ? 'bg-orange-600/20 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                      <span className="z-10">{opt.label}</span>
                                      {opt.price > 0 && <span className={`z-10 ${isSelected ? 'text-orange-200' : 'text-gray-500'}`}>+{opt.price.toLocaleString()} ₽</span>}
                                   </button>
                                );
                            })}
                        </div>
                        {category.id === 'engraving' && config[category.id].value === 'custom' && (
                           <div className="mt-3 pt-3 border-t border-white/10 animate-fade-in">
                              <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-gray-400">Ваш эскиз</label>
                              <div className="flex items-center gap-2">
                                  <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-400 px-4 py-3 rounded-xl text-xs font-bold transition-all border-dashed">
                                      <Upload size={14} className="text-orange-500" />
                                      <span>{customFile ? 'Файл выбран' : 'Загрузить файл'}</span>
                                      <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="hidden" />
                                  </label>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            ))}
         </div>
         <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md flex-shrink-0">
            <div className={`flex justify-between items-end mb-4 ${!isMobile ? 'lg:hidden' : ''}`}>
               <span className="text-sm text-gray-500 font-medium">Итого:</span>
               <span className="text-2xl font-bold tracking-tight text-white">{calculateTotal().toLocaleString()} ₽</span>
            </div>
            <a href={getOrderLink()} target="_blank" rel="noopener noreferrer" className="group w-full bg-orange-600 text-white py-4 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(234,88,12,0.4)] active:scale-[0.98]">
               <span>Оформить заказ</span>
               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
         </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white selection:bg-orange-500 selection:text-white relative">
      {/* Global styles for animation */}
      <style>{`
         @keyframes comet-move {
            0% { 
                opacity: 0; 
                transform: translate(-100px, -100px) scale(var(--scale)); 
            }
            15% { opacity: var(--max-opacity); }
            85% { opacity: var(--max-opacity); }
            100% { 
                opacity: 0; 
                transform: translate(350px, 350px) scale(var(--scale)); 
            }
         }
      `}</style>

      <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-colors duration-[1500ms] ease-in-out ${introStep >= 1 ? 'bg-transparent' : 'bg-black'} ${introStep >= 2 ? 'hidden' : ''}`}>
        <h1 className={`font-bold tracking-tighter text-white transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) absolute z-[101] whitespace-nowrap ${introStep >= 1 ? 'top-[22px] left-[24px] lg:left-[32px] text-2xl md:text-3xl translate-x-0 translate-y-0 opacity-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-8xl' } ${introStep >= 2 ? 'hidden' : 'block'}`}>bbqp</h1>
      </div>

      <Navigation activeSection={activeSection} isIntroComplete={isIntroComplete} onChatToggle={() => setIsChatOpen(!isChatOpen)} />

      {/* FORCE VISIBILITY TO FIX BLACK SCREEN ISSUE - Removed dynamic opacity toggle */}
      <main className={`snap-container h-full w-full transition-opacity duration-1000 opacity-100`}>

        <div id="hero" ref={setRef('hero')} className="snap-section min-h-[100svh] transition-opacity duration-[2500ms] ease-in-out">
            {shouldRenderSection('hero') && <Hero startAnimation={isIntroComplete} isActive={activeSection === 'hero'} />}
        </div>

        {/* Features Section */}
        <div id="features" ref={setRef('features')} className="snap-section min-h-[100svh] bg-black transition-opacity duration-[2500ms] ease-in-out">
             {shouldRenderSection('features') && (
              <div className="section-inner content-center space-y-unified">
                <FeaturesSection isActive={activeSection === 'features'} />
              </div>
             )}
        </div>

        {/* Autodraft Section */}
        <section id="autodraft" ref={setRef('autodraft')} className="snap-section min-h-[100svh] bg-white text-black relative transition-all duration-[2500ms] ease-in-out overflow-hidden">
           {shouldRenderSection('autodraft') && (
            <>
               <div className="hidden md:flex absolute inset-0 w-full h-full z-0 justify-center items-center">
                  <img src="/assets/images/model-preview.png" alt="Grill AutoDraft System" className="unified-media" />
               </div>
               <div className="md:hidden absolute top-1/2 left-0 w-full h-[40vh] z-[1] flex items-center justify-center pointer-events-none -translate-y-1/2">
                   <img src="/assets/images/model-preview.png" alt="Grill AutoDraft System Mobile" className="h-full object-contain mix-blend-multiply" />
               </div>
               <div className="absolute inset-0 z-[5] overflow-hidden pointer-events-none">
                 {formulaData.map((item, i) => <FloatingFormula key={i} item={item} pool={PHYSICS_FORMULAS} />)}
               </div>
               <div className="section-inner content-center space-y-unified">
                  <Reveal>
                      <h2 className="unified-title text-center">Просто закиньте угли, физика сделает все за вас</h2>
                      <div className="unified-text text-center max-w-2xl mx-auto">
                         <p>Система автоподдува создаёт идеальную тягу. Угли разгораются быстрее. Никаких усилий — только результат.</p>
                      </div>
                  </Reveal>
               </div>
            </>
           )}
        </section>

        {/* Details Section */}
        <section id="details" ref={setRef('details')} className="snap-section min-h-[100svh] bg-[#050505] text-white transition-all duration-[2500ms] ease-in-out flex flex-col justify-center overflow-hidden relative group">
          {shouldRenderSection('details') && (
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none"></div>
              <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
              <div className="absolute inset-0 flex items-center justify-center z-[2] overflow-hidden" style={{ perspective: '500px' }}>
                 <div className="flex flex-col gap-6 md:gap-8 justify-center origin-center animate-wobble" style={{ width: '220%', height: '160%', transform: 'rotateY(-25deg) rotateX(2deg) translateX(-10%) scale(1.6)', maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
                     <OptimizedMarqueeRow items={row1Items} speed={0.4} itemClassName="w-40 h-40 md:w-64 md:h-64 aspect-square" />
                     <OptimizedMarqueeRow items={row2Items} reverse={true} speed={0.5} itemClassName="w-40 h-40 md:w-64 md:h-64 aspect-square" />
                     <OptimizedMarqueeRow items={row3Items} speed={0.6} itemClassName="w-40 h-40 md:w-64 md:h-64 aspect-square" />
                 </div>
              </div>
              <div className="section-inner content-center space-y-unified relative z-20">
                 <Reveal>
                     <h2 className="unified-title">Для тех, кто ценит детали</h2>
                 </Reveal>
                 <div className="max-w-3xl mx-auto">
                     <p className="unified-text text-center">Каждая деталь создана с одержимостью качеством на основе опыта ведущих дизайнеров, материаловедов и испытательных тестов топ-пользователей</p>
                 </div>
              </div>
            </>
          )}
        </section>

        {/* Personalize Section */}
        <section id="personalize" ref={setRef('personalize')} className="snap-section min-h-[100svh] bg-[#050505] text-white relative transition-all duration-[2500ms] ease-in-out overflow-hidden">
           {shouldRenderSection('personalize') && (
            <>
               <div className="absolute inset-0 z-0">
                    <video ref={personalizationVideoRef} src="/assets/videos/personalize.mp4" autoPlay loop muted playsInline onLoadedMetadata={() => { if (personalizationVideoRef.current) personalizationVideoRef.current.playbackRate = 1.0; }} className="w-full h-full object-cover object-[100%_50%] scale-[1.35] translate-x-0 md:translate-x-0 md:scale-100 md:object-center opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent hidden md:block"></div>
               </div>
               <div className="section-inner content-start space-y-unified relative z-20">
                    <Reveal>
                        <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
                             <ScanLine size={16} className="text-orange-500 animate-pulse" />
                             <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-orange-500/80">ПЕРСОНАЛИЗАЦИЯ</span>
                        </div>
                        <h2 className="unified-title">Персонализируйте</h2>
                        <div className="unified-text space-y-small max-w-xl">
                           <p>Поздравление именинника или юбиляра</p>
                           <p>Корпоративный девиз</p>
                           <p>Индивидуальная гравировка</p>
                        </div>
                        <div className="mt-8">
                            <button onClick={scrollToConfigurator} className="unified-button unified-button-primary">
                               <span className="font-bold">Загрузить макет</span>
                               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </Reveal>
               </div>
            </>
           )}
        </section>

        {/* Military Section */}
        <section id="military" ref={setRef('military')} className="snap-section min-h-[100svh] bg-[#1c1c1c] text-white relative transition-all duration-[2500ms] ease-in-out">
           {shouldRenderSection('military') && (
            <>
               <div className="hidden md:block absolute inset-0 z-0 opacity-100">
                    <ParallaxImage src="/assets/images/military-bg.png" alt="Military Background" className="w-full h-full" imageClassName="object-cover" speed={0.1} />
               </div>
               <div className="md:hidden absolute inset-0 z-0 opacity-100 overflow-hidden">
                    <img src="/assets/images/military-bg-mobile.png" alt="Military Background Mobile" className="w-full h-[110%] object-cover -translate-y-[10%]" />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-black via-black/80 to-transparent"></div>
               </div>
               <ParticlesOverlay flipped={true} active={activeSection === 'military'} />
               <div className="section-inner content-start space-y-unified relative z-10">
                  <Reveal className="unified-card max-w-xl">
                     <div className="inline-block px-3 py-1 border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm rounded-full mb-6">
                        <span className="text-xs font-bold tracking-wider text-orange-400 uppercase">Эксклюзив</span>
                     </div>
                     <h2 className="unified-subtitle mb-6">Военная серия</h2>
                     <div className="unified-text mb-8"><p>Тактический сувенир и дань уважения. Брутальный дизайн, спецпокрытие, армейская эстетика.</p></div>
                     <div className="space-y-medium mb-10">
                        {[{ title: "Тактическое покрытие", desc: "Покрытие не предполагается при использовании нержавейки. Нано покрытие для долгого хранения" }, { title: "Персональная гравировка", desc: "Позывной или звание — бесплатно" }].map((item, i) => (
                           <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                              <div className="mt-1 flex-shrink-0"><div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-600/20"><Check className="w-3 h-3" /></div></div>
                              <div><div className="font-bold text-white">{item.title}</div><p className="text-sm text-gray-300 mt-1">{item.desc}</p></div>
                           </div>
                        ))}
                     </div>
                     <div className="flex flex-row gap-3">
                        <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="unified-button unified-button-primary flex-1">
                          Получить
                        </a>
                     </div>
                  </Reveal>
               </div>
            </>
           )}
        </section>

        {/* Models Section */}
        <section id="models" ref={setRef('models')} className="snap-section min-h-[100svh] bg-gray-200 transition-all duration-[2500ms] ease-in-out relative overflow-hidden">
           {shouldRenderSection('models') && (
            <>
               {/* 3D SCENE BACKGROUND */}
               <div className="absolute inset-0 w-full h-full">
                    {/* Placeholder - CENTERED */}
                    <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-200 transition-opacity duration-500 ${is3DActive ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <img src="/assets/images/model-preview.png" alt="3D Preview" className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-60 blur-sm scale-105" />
                        <button onClick={() => setIs3DActive(true)} className="relative z-30 group flex flex-col items-center gap-4 transition-transform hover:scale-105">
                            <div className="w-24 h-24 rounded-full bg-black/5 backdrop-blur-md text-gray-800 border border-black/10 flex items-center justify-center shadow-lg group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-500 transition-colors">
                                <Box size={40} strokeWidth={1.2} className="ml-1" />
                            </div>
                            <div className="bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg"><span className="text-base font-bold text-white uppercase tracking-wider">Запустить 3D</span></div>
                        </button>
                    </div>

                    {is3DActive && (
                        <div className="absolute inset-0 w-full h-full z-0">
                            <Suspense fallback={<SectionLoader />}>
                                <Grill3D url={MODEL_URL} enableControls={!isMobile} isVisible={activeSection === 'models'} engravingType={config.engraving.value as 'none'|'standard'|'custom'} textureUrl={config.engraving.value === 'custom' ? customTextureUrl : null} color={config.color.value as 'black' | 'stainless'} onLoad={() => setIsModelLoaded(true)} />
                            </Suspense>
                        </div>
                    )}
               </div>

               {/* UI OVERLAY */}
               <div className="relative z-10 w-full h-full pointer-events-none">
                  {mobileConfigOpen && (
                    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md lg:hidden flex items-end sm:items-center justify-center animate-fade-in pointer-events-auto">
                        <div className="bg-[#111] w-full sm:w-[90%] h-[85vh] sm:h-[80vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col relative animate-slide-up overflow-hidden border border-white/10">
                            <button onClick={() => setMobileConfigOpen(false)} className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24} /></button>
                            <ConfiguratorPanel />
                        </div>
                    </div>
                  )}
                  <div className="lg:hidden absolute bottom-24 left-0 w-full z-30 flex justify-center pointer-events-auto">
                    <button onClick={() => setMobileConfigOpen(true)} className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all hover:bg-orange-700 active:scale-95"><Settings2 size={20} /><span className="font-bold text-sm">Настроить конфигурацию</span></button>
                  </div>
                  {is3DActive && isModelLoaded && (
                      <div className="hidden lg:flex absolute right-[10%] top-1/2 -translate-y-1/2 w-[350px] max-h-[80vh] pointer-events-auto">
                          <div className="w-full bg-black/60 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col animate-fade-in"><ConfiguratorPanel /></div>
                      </div>
                  )}
               </div>
            </>
           )}
        </section>

        {/* AI Chef Section */}
        <div id="ai-chef" ref={setRef('ai-chef')} className="snap-section min-h-[100svh] bg-[#050505] transition-all duration-[2500ms] ease-in-out">
             {shouldRenderSection('ai-chef') && (
              <div className="section-inner content-center">
                <Suspense fallback={<SectionLoader />}><RecipeGenerator /></Suspense>
              </div>
             )}
        </div>

        {/* Footer Section */}
        <footer className="snap-section min-h-[100svh] bg-black text-white transition-opacity duration-[2500ms] ease-in-out">
          <div className="section-inner content-center space-y-unified">
            <Reveal>
               <div className="mb-6">
                  <div className="text-4xl md:text-5xl font-bold tracking-tighter mb-2">bbqp</div>
                  <p className="text-sm text-gray-500 font-medium mb-8">Инновации в искусстве приготовления.</p>

                  {/* Контактная информация */}
                  <div className="mb-8 text-left text-sm text-gray-400 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-bold text-white mb-2">Официальный дистрибьютор в РФ (продажи и гарантия)</h3>
                      <p className="mb-1">ООО «АТТА»</p>
                      <p className="mb-1">445043, г. Тольятти, ул. Коммунальная, д. 37А</p>
                      <p>Электронная почта: <a href="mailto:st@atta-k.ru" className="text-orange-500 hover:text-orange-400">st@atta-k.ru</a></p>
                    </div>

                    <div>
                      <h3 className="font-bold text-white mb-2">Уполномоченный представитель в РФ (жалобы и предложения)</h3>
                      <p className="mb-1">Юридический отдел ТСЦ АО «САМТЕК»</p>
                      <p className="mb-1">445027, г. Тольятти, а/я 3147</p>
                      <p className="mb-1">Электронная почта: <a href="mailto:info@sam-tech.ru" className="text-orange-500 hover:text-orange-400">info@sam-tech.ru</a></p>
                      <p>Бесплатная линия для регионов РФ: <span className="font-bold">8 800 7000 994</span></p>
                    </div>
                  </div>
               </div>

               <button onClick={handleStartOver} className="unified-button unified-button-secondary mb-12">
                 <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" />
                 <span className="font-bold text-sm">Начать сначала</span>
               </button>

               <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600">
                 <p>© 2025 bbqp. Все права защищены.</p>
                 <div className="flex gap-6">
                   <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors">Конфиденциальность</button>
                   <button onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors">Условия</button>
                   <a href="/assets/docs/MANUAL.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                     <FileText size={12} /> Руководство
                   </a>
                 </div>
               </div>
            </Reveal>
          </div>
        </footer>

      </main>

      {/* Модальные окна */}
      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Политика конфиденциальности">
        <div className="prose prose-invert max-w-none">
          <h3>1. Общие положения</h3>
          <p>Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые ООО «АТТА» (далее – Оператор).</p>

          <h3>2. Основные понятия</h3>
          <p><strong>Персональные данные</strong> – любая информация, относящаяся к прямо или косвенно определенному или определяемому физическому лицу (субъекту персональных данных).</p>
          <p><strong>Обработка персональных данных</strong> – любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.</p>

          <h3>3. Цели обработки персональных данных</h3>
          <ul>
            <li>Заключение, исполнение и прекращение гражданско-правовых договоров</li>
            <li>Предоставление доступа к сервисам и функциям сайта</li>
            <li>Обратная связь с пользователем</li>
            <li>Информирование о новых продуктах и акциях</li>
            <li>Обработка запросов и заявок от пользователя</li>
          </ul>

          <h3>4. Правовые основания обработки персональных данных</h3>
          <p>Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте. Заполняя соответствующие формы и/или отправляя свои персональные данные Оператору, Пользователь выражает свое согласие с данной Политикой.</p>

          <h3>5. Порядок сбора, хранения, передачи и других видов обработки персональных данных</h3>
          <p>Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.</p>

          <h3>6. Заключительные положения</h3>
          <p>Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору с помощью электронной почты <a href="mailto:info@sam-tech.ru" className="text-orange-500">info@sam-tech.ru</a>.</p>
          <p>В данном документе будут отражены любые изменения политики обработки персональных данных Оператором.</p>
        </div>
      </Modal>

      <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Условия использования">
        <div className="prose prose-invert max-w-none">
          <h3>1. Общие положения</h3>
          <p>Настоящие Условия использования (далее — «Условия») регулируют использование веб-сайта bbqp (далее — «Сайт»). Используя Сайт, вы соглашаетесь с настоящими Условиями.</p>

          <h3>2. Интеллектуальная собственность</h3>
          <p>Все материалы, размещенные на Сайте, включая, но не ограничиваясь: тексты, графические изображения, логотипы, аудио- и видеоматериалы, программы для ЭВМ, базы данных, являются объектами интеллектуальной собственности ООО «АТТА» и защищены законодательством Российской Федерации об интеллектуальной собственности.</p>

          <h3>3. Использование Сайта</h3>
          <p>Вы обязуетесь использовать Сайт только в законных целях и способами, которые не нарушают права третьих лиц и не ограничивают или не препятствуют использованию Сайта другими пользователями.</p>

          <h3>4. Информация о продуктах</h3>
          <p>Информация о продуктах, представленная на Сайте, включая описания, характеристики и цены, носит справочный характер и может быть изменена без предварительного уведомления. Изображения продуктов могут отличаться от реального вида.</p>

          <h3>5. Конфигуратор и заказ</h3>
          <p>Используя конфигуратор на Сайте, вы можете собрать желаемую конфигурацию продукта. После завершения конфигурации вы будете перенаправлены в Telegram для оформления заказа. Окончательная цена и условия поставки согласовываются индивидуально с менеджером.</p>

          <h3>6. Ограничение ответственности</h3>
          <p>Сайт предоставляется «как есть». Мы не гарантируем, что Сайт будет работать непрерывно, без ошибок или дефектов. Мы не несем ответственности за любые прямые или косвенные убытки, возникшие в результате использования или невозможности использования Сайта.</p>

          <h3>7. Внешние ссылки</h3>
          <p>Сайт может содержать ссылки на сторонние веб-сайты. Мы не контролируем и не несем ответственности за содержание, политику конфиденциальности или практику любых сторонних сайтов.</p>

          <h3>8. Изменения условий</h3>
          <p>Мы оставляем за собой право вносить изменения в настоящие Условия в любое время. Продолжение использования Сайта после внесения изменений означает ваше согласие с новыми Условиями.</p>

          <h3>9. Контактная информация</h3>
          <p>По всем вопросам, связанным с настоящими Условиями, обращайтесь по адресу: <a href="mailto:info@sam-tech.ru" className="text-orange-500">info@sam-tech.ru</a> или по телефону: 8 800 7000 994 (бесплатно по РФ).</p>

          <h3>10. Применимое право</h3>
          <p>Настоящие Условия регулируются законодательством Российской Федерации. Все споры подлежат разрешению в судебных органах по месту нахождения ООО «АТТА».</p>
        </div>
      </Modal>

      <Suspense fallback={null}><ChefBot visible={isIntroComplete} externalIsOpen={isChatOpen} onToggle={setIsChatOpen} /></Suspense>
    </div>
  );
}

export default App;