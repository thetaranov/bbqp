import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturesSection from './components/MenuSection';
import ParallaxImage from './components/ParallaxImage';
import Reveal from './components/Reveal';
import ParticlesOverlay from './components/ParticlesOverlay';
import { DETAILS_ITEMS } from './constants';
import { Check, ArrowRight, Upload, ChevronLeft, Loader2, Settings2, X, Box, ScanLine, FileText } from 'lucide-react';
import FloatingFormulasOverlay from './components/FloatingFormulasOverlay';
import Modal from './components/Modal';
import ConfiguratorPanel from './components/ConfiguratorPanel';
import SiteFooter from './components/Footer';
import { Option, ConfigCategory } from './types';
import Loader from './components/Loader';

// Lazy Load Heavy Components
const ChefBot = lazy(() => import('./components/ChefBot'));
const RecipeGenerator = lazy(() => import('./components/RecipeGenerator'));

// Configuration Data
const CONFIG_OPTIONS: ConfigCategory[] = [
  { id: 'model', name: 'Модель', options: [ { label: 'Model V', price: 25000, value: 'v' }, { label: 'Model W', price: 35000, value: 'w' } ] },
  { id: 'color', name: 'Материал', options: [ { label: 'Black Matt (Сталь)', price: 0, value: 'black' }, { label: 'Stainless (Нержавейка)', price: 15000, value: 'stainless' } ] },
  { id: 'engraving', name: 'Гравировка', options: [ { label: 'Без гравировки', price: 0, value: 'none' }, { label: 'Стандартная', price: 1000, value: 'standard' }, { label: 'Свой эскиз', price: 5000, value: 'custom' } ] }
];

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const MarqueeImage = React.memo(({ src, className }: { src: string, className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-black/40 border border-white/5 rounded-2xl ${className}`}>
        <img src={src} alt="" loading="lazy" decoding="async" onLoad={() => setLoaded(true)} className={`w-full h-full object-cover transition-opacity duration-700 ease-out ${loaded ? 'opacity-80' : 'opacity-0'}`} />
    </div>
  );
});

// Добавлен проп `active` для остановки анимации
const OptimizedMarqueeRow = ({ reverse = false, items, speed = 1, itemClassName = "", active = true }: { reverse?: boolean, items: typeof DETAILS_ITEMS, speed?: number, itemClassName?: string, active?: boolean }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef(0);
    const animationFrameRef = useRef<number>(0);
    const marqueeItems = useMemo(() => [...items, ...items, ...items, ...items], [items]); 

    useEffect(() => {
        const el = rowRef.current;
        if (!el || !active) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const animate = () => {
            const oneSetWidth = el.scrollWidth / 4;
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
        animationFrameRef.current = requestAnimationFrame(animate);
        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
    }, [reverse, speed, active]);

    return (
        <div className="relative w-full overflow-hidden select-none pointer-events-none">
            {/* Увеличен gap-8 для большего расстояния */}
            <div ref={rowRef} className="flex gap-8 w-max will-change-transform">
                {marqueeItems.map((item, idx) => ( <MarqueeImage key={`${item.id}-${idx}`} src={item.image} className={`flex-shrink-0 ${itemClassName}`} /> ))}
            </div>
        </div>
    );
};

function App() {
  const TELEGRAM_LINK = "https://t.me/thetaranov";

  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState<Record<string, Option>>({ model: CONFIG_OPTIONS[0].options[0], color: CONFIG_OPTIONS[1].options[1], engraving: CONFIG_OPTIONS[2].options[1] });
  const [customFile, setCustomFile] = useState<File | null>(null);
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

  const row1Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);
  const row2Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);
  const row3Items = useMemo(() => shuffleArray(DETAILS_ITEMS), []);

  useEffect(() => {
    const clearFallbackTimer = () => {
      const win = window as any;
      if (win.fallbackTimer) {
        clearTimeout(win.fallbackTimer);
        win.fallbackTimer = null;
      }
    };

    const finishLoading = () => {
        clearFallbackTimer();
        setIsLoading(false);
        setTimeout(() => setIntroStep(1), 500);
        setTimeout(() => setIntroStep(2), 2000);
    };

    const handleLoadComplete = () => {
      finishLoading();
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', handleLoadComplete);
    }

    const safetyTimer = setTimeout(() => {
        finishLoading();
    }, 3500);

    return () => {
        window.removeEventListener('load', handleLoadComplete);
        clearTimeout(safetyTimer);
    };
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
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { threshold: 0.5 });
    Object.values(sectionRefs.current).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeSection === 'models' && !is3DActive) {
      setIs3DActive(true);
    }
  }, [activeSection, is3DActive]);

  useEffect(() => {
    const mainContainer = document.querySelector('.snap-container');
    if (mobileConfigOpen) {
      if (mainContainer) mainContainer.classList.add('overflow-hidden');
    } else {
      if (mainContainer) mainContainer.classList.remove('overflow-hidden');
    }
    return () => { if (mainContainer) mainContainer.classList.remove('overflow-hidden'); };
  }, [mobileConfigOpen]);

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
        setCustomFile(e.target.files[0]);
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

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white selection:bg-orange-500 selection:text-white relative">
      {isLoading && <Loader isLoading={isLoading} />}

      <Navigation activeSection={activeSection} isIntroComplete={isIntroComplete} onChatToggle={() => setIsChatOpen(!isChatOpen)} />
      <main className={`snap-container h-full w-full`}>
        <div id="hero" ref={setRef('hero')} className="snap-section h-[100svh]">
            <Hero startAnimation={isIntroComplete} isActive={activeSection === 'hero'} />
        </div>
        <div id="features" ref={setRef('features')} className="snap-section h-[100svh] bg-black">
            <FeaturesSection isActive={activeSection === 'features'} />
        </div>
        <section id="autodraft" ref={setRef('autodraft')} className="snap-section h-[100svh] bg-white text-black relative overflow-hidden flex items-center justify-center">
            <>
               <div className="hidden md:flex absolute inset-0 w-full h-full z-0 justify-center items-center pt-0 md:pt-0">
                  <img src="/assets/images/model-preview.png" alt="Grill AutoDraft System" className="w-full h-full md:h-[75%] object-contain object-center md:object-[center_right] md:mr-12 opacity-100 translate-y-0 md:translate-y-8" />
               </div>
               <div className="md:hidden absolute top-1/2 left-0 w-full h-[35vh] z-[1] flex items-center justify-center pointer-events-none -translate-y-1/2">
                   <img src="/assets/images/model-preview.png" alt="Grill AutoDraft System Mobile" className="h-full object-contain mix-blend-multiply" />
               </div>
               <div className="absolute inset-0 z-[5] overflow-hidden pointer-events-none">
                  <FloatingFormulasOverlay />
               </div>
               <div className="relative z-10 max-w-6xl mx-auto px-6 w-full h-full flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start pb-0 md:py-0 pt-0 md:pt-0">
                  <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-start text-center md:text-left h-full pr-0 md:pr-12 pb-0 md:pb-0">
                     <Reveal>
                        <h2 className="text-[7vw] md:text-5xl font-bold mb-6 tracking-tight text-black relative z-20">Просто закиньте угли, физика сделает все за вас</h2>
                        <div className="md:hidden w-full h-[35vh] mb-6"></div>
                        <div className="text-gray-600 text-sm md:text-xl leading-relaxed font-medium relative z-20">
                           <p>Система автоподдува создаёт идеальную тягу. Угли разгораются быстрее. Никаких усилий — только результат.</p>
                        </div>
                     </Reveal>
                  </div>
               </div>
            </>
        </section>

        {/* --- СЕКЦИЯ DETAILS (ИЗМЕНЕНО) --- */}
        <section id="details" ref={setRef('details')} className="snap-section h-[100svh] bg-[#050505] text-white flex flex-col justify-center overflow-hidden relative group">
            <>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-orange-900/10 blur-[120px] rounded-full pointer-events-none"></div>
              <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
              <div className="absolute inset-0 flex items-center justify-center z-[2] overflow-hidden" style={{ perspective: '500px' }}>
                 <div className="flex flex-col gap-8 justify-center origin-center" style={{ width: '220%', height: '160%', transform: 'rotateY(-25deg) rotateX(2deg) translateX(-10%) scale(1.6)', maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)' }}>
                     {/* Добавлен active проп для производительности */}
                     {/* Уменьшены размеры: w-32 h-32 */}
                     <OptimizedMarqueeRow active={activeSection === 'details'} items={row1Items} speed={0.4} itemClassName="w-32 h-32 aspect-square" />
                     <OptimizedMarqueeRow active={activeSection === 'details'} items={row2Items} reverse={true} speed={0.5} itemClassName="w-32 h-32 aspect-square" />
                     <OptimizedMarqueeRow active={activeSection === 'details'} items={row3Items} speed={0.6} itemClassName="w-32 h-32 aspect-square" />
                 </div>
              </div>

              {/* Левое выравнивание и градиент */}
              <div className="relative z-20 pointer-events-none w-full h-full flex flex-col items-start justify-center p-8 md:p-12 md:pl-24 bg-gradient-to-r from-black via-black/50 to-transparent">
                 <Reveal className="max-w-3xl">
                     <h2 className="text-[9vw] md:text-6xl lg:text-7xl font-bold tracking-tighter text-white drop-shadow-2xl mb-8 text-left">Для тех,<br />кто ценит детали</h2>
                 </Reveal>
                 <div className="flex justify-start max-w-xl">
                     <p className="text-gray-200 text-sm md:text-base font-medium tracking-wide m-0 text-left leading-relaxed drop-shadow-lg">Каждая деталь создана с одержимостью качеством на основе опыта ведущих дизайнеров, материаловедов и испытательных тестов топ-пользователей</p>
                 </div>
              </div>
            </>
        </section>

        <section id="personalize" ref={setRef('personalize')} className="snap-section h-[100svh] bg-[#050505] text-white relative overflow-hidden flex items-center">
            <>
               <div className="absolute inset-0 z-0">
                    <video src="/assets/videos/personalize.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover object-[100%_50%] scale-[1.35] translate-x-0 md:translate-x-0 md:scale-100 md:object-center opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent hidden md:block"></div>
               </div>
               <div className="container mx-auto px-6 relative z-20 w-full h-full flex flex-col justify-center items-center md:items-start text-center md:text-left">
                    <div className="max-w-xl pl-0 md:pl-12 border-l-0 md:border-l-2 border-orange-500/30 w-full">
                         <Reveal>
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-4 opacity-0 animate-fade-in" style={{animationDelay: '0.3s', animationFillMode: 'forwards'}}>
                                 <ScanLine size={16} className="text-orange-500 animate-pulse" />
                                 <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-orange-500/80">ПЕРСОНАЛИЗАЦИЯ</span>
                            </div>
                            <h2 className="text-[9vw] md:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">Персонализируйте</h2>
                            <div className="text-gray-300 text-sm md:text-base leading-relaxed mb-8 font-medium text-center md:text-left w-full md:w-auto space-y-2">
                               <p>Поздравление именинника или юбиляра</p><p>Корпоративный девиз</p><p>Индивидуальная гравировка</p>
                            </div>
                            <div className="flex justify-center md:justify-start">
                                <button onClick={scrollToConfigurator} className="group inline-flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all hover:bg-black/80 hover:scale-105">
                                   <span className="font-bold text-sm">Загрузить макет</span>
                                </button>
                            </div>
                         </Reveal>
                    </div>
               </div>
            </>
        </section>
        <section id="military" ref={setRef('military')} className="snap-section h-[100svh] bg-[#1c1c1c] text-white relative pt-28 pb-32 md:pb-0">
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
               <div className="relative z-10 max-w-5xl mx-auto px-6 w-full h-full flex flex-col justify-center">
                  <Reveal className="max-w-xl bg-black/20 backdrop-blur-[2px] bg-gradient-to-br from-white/5 to-transparent p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl mt-auto md:mt-0">
                     <div className="inline-block px-3 py-1 border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm rounded-full mb-4 md:mb-6"><span className="text-[10px] md:text-xs font-bold tracking-wider text-orange-400 uppercase">Эксклюзив</span></div>
                     <h2 className="mb-4 md:mb-6 tracking-tight text-[8vw] lg:text-5xl font-bold leading-tight drop-shadow-lg">Военная серия</h2>
                     <div className="space-y-4 text-gray-200 mb-6 md:mb-8 text-base md:text-lg leading-relaxed drop-shadow-md"><p>Тактический сувенир и дань уважения. Брутальный дизайн, спецпокрытие, армейская эстетика.</p></div>
                     <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                        {[{ title: "Тактическое покрытие", desc: "Покрытие не предполагается при использовании нержавейки. Нано покрытие для долгого хранения" }, { title: "Персональная гравировка", desc: "Позывной или звание — бесплатно" }].map((item, i) => (
                           <div key={i} className="flex items-start gap-4 p-3 md:p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                              <div className="mt-1 flex-shrink-0"><div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-600/20"><Check className="w-3 h-3" /></div></div>
                              <div><div className="font-bold text-sm md:text-base text-white">{item.title}</div><p className="text-[10px] md:text-xs text-gray-300 mt-1">{item.desc}</p></div>
                           </div>
                        ))}
                     </div>
                     <div className="flex flex-row gap-3">
                        <a href={TELEGRAM_LINK} target="_blank" rel="noopener noreferrer" className="bg-orange-600 text-white h-12 md:h-14 px-8 rounded-2xl text-sm md:text-base font-bold hover:bg-orange-700 transition-colors flex items-center justify-center flex-1 shadow-[0_0_25px_rgba(234,88,12,0.3)] hover:scale-[1.02]">Получить</a>
                     </div>
                  </Reveal>
               </div>
            </>
        </section>

        <section id="models" ref={setRef('models')} className="snap-section h-[100svh] bg-gray-200 relative">
            {is3DActive && (
              <div className="absolute inset-0 z-0">
                 {!isModelLoaded && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center">
                       <Loader2 className="w-12 h-12 animate-spin text-gray-500" />
                    </div>
                 )}
                 <iframe
                    src={`/model.html?color=${config.color.value}`}
                    title="BBQP 3D Model"
                    className="w-full h-full border-0 transition-opacity duration-500"
                    style={{ opacity: isModelLoaded ? 1 : 0 }}
                    onLoad={() => setIsModelLoaded(true)}
                 />
              </div>
            )}

            <div className={`w-full h-full flex items-center justify-center ${is3DActive ? 'bg-transparent' : 'bg-gray-200'}`}>
                {!is3DActive && (
                    <button onClick={() => setIs3DActive(true)} className="group flex flex-col items-center gap-4 transition-transform hover:scale-105">
                        <div className="w-24 h-24 rounded-full bg-black/5 backdrop-blur-md text-gray-800 border border-black/10 flex items-center justify-center shadow-lg group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-500 transition-colors">
                            <Box size={40} strokeWidth={1.2} className="ml-1" />
                        </div>
                        <div className="bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg"><span className="text-base font-bold text-white uppercase tracking-wider">Показать модель</span></div>
                    </button>
                )}
            </div>

            <div className={`absolute top-0 right-0 w-full lg:w-1/2 h-full flex items-center justify-center pointer-events-none ${!is3DActive && 'bg-gray-200'}`}>
               <div className="hidden lg:flex w-full max-w-[380px] h-full max-h-[600px] items-center pointer-events-auto pt-20">
                  <div className={`w-full h-full bg-black/60 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col transition-opacity duration-700 ${is3DActive ? 'opacity-100' : 'opacity-0'}`}>
                     <ConfiguratorPanel
                        isMobile={isMobile}
                        config={config}
                        openCategory={openCategory}
                        customFile={customFile}
                        configOptions={CONFIG_OPTIONS}
                        toggleCategory={toggleCategory}
                        handleSelect={handleSelect}
                        handleFileChange={handleFileChange}
                        calculateTotal={calculateTotal}
                        getOrderLink={getOrderLink}
                     />
                  </div>
               </div>
            </div>

            {mobileConfigOpen && (
             <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex items-end sm:items-center justify-center animate-fade-in pointer-events-auto">
                 <div className="bg-[#111] w-full sm:w-[90%] h-[80vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col relative animate-slide-up overflow-hidden border border-white/10">
                     <ConfiguratorPanel
                        isMobile={isMobile}
                        config={config}
                        openCategory={openCategory}
                        customFile={customFile}
                        configOptions={CONFIG_OPTIONS}
                        toggleCategory={toggleCategory}
                        handleSelect={handleSelect}
                        handleFileChange={handleFileChange}
                        calculateTotal={calculateTotal}
                        getOrderLink={getOrderLink}
                     />
                 </div>
             </div>
            )}
            <div className={`lg:hidden absolute bottom-[12vh] left-0 w-full flex justify-center pointer-events-auto transition-opacity duration-500 ${is3DActive ? 'opacity-100' : 'opacity-0'}`}>
              <button onClick={() => setMobileConfigOpen(true)} className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all hover:bg-orange-700 active:scale-95"><Settings2 size={20} /><span className="font-bold text-sm">Настроить конфигурацию</span></button>
            </div>
        </section>

        <div id="ai-chef" ref={setRef('ai-chef')} className="snap-section h-[100svh] bg-[#050505]">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-600" /></div>}>
                <RecipeGenerator />
            </Suspense>
        </div>

        <SiteFooter
          setRef={setRef('contact')}
          onPrivacyOpen={() => setIsPrivacyOpen(true)}
          onTermsOpen={() => setIsTermsOpen(true)}
        />
      </main>

      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Политика конфиденциальности">
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300 text-sm leading-relaxed">
          <h4>1. Общие положения</h4>
          <p>Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые ООО «АТТА» (далее – Оператор).</p>
          <p>Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.</p>
          <h4>2. Основные понятия, используемые в Политике</h4>
          <p><strong>Персональные данные</strong> – любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта bbqp.pro.</p>
          <p><strong>Обработка персональных данных</strong> – любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.</p>
          <h4>3. Цели обработки персональных данных</h4>
          <p>Цель обработки персональных данных Пользователя — информирование Пользователя посредством отправки электронных писем и сообщений в мессенджерах; заключение, исполнение и прекращение гражданско-правовых договоров; предоставление доступа Пользователю к сервисам, информации и/или материалам, содержащимся на веб-сайте. В частности, мы используем ваши данные для оформления и доставки заказа.</p>
          <h4>4. Правовые основания обработки персональных данных</h4>
          <p>Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте. Заполняя соответствующие формы и/или отправляя свои персональные данные Оператору, Пользователь выражает свое согласие с данной Политикой.</p>
          <h4>5. Порядок сбора, хранения, передачи и других видов обработки персональных данных</h4>
          <p>Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных. Ваши данные передаются третьим лицам (транспортным компаниям) только в целях исполнения договора купли-продажи и доставки товара.</p>
        </div>
      </Modal>

      <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Условия использования">
        <div className="prose prose-invert max-w-none space-y-4 text-gray-300 text-sm leading-relaxed">
            <h4>1. Общие положения</h4>
            <p>Настоящие Условия использования (далее — «Условия») являются публичной офертой и регулируют взаимоотношения между ООО «АТТА» (далее — «Продавец») и любым физическим или юридическим лицом (далее — «Покупатель») при использовании веб-сайта bbqp.pro (далее — «Сайт»). Использование Сайта, в том числе оформление заказа, означает полное и безоговорочное согласие Покупателя с настоящими Условиями.</p>
            <h4>2. Предмет соглашения</h4>
            <p>Продавец обязуется передать в собственность Покупателя, а Покупатель обязуется оплатить и принять товар (печь-мангал bbqp и аксессуары), заказанный на Сайте в соответствии с выбранной конфигурацией.</p>
            <h4>3. Оформление заказа и оплата</h4>
            <p>Заказ на продукцию bbqp оформляется через конфигуратор на Сайте с последующим перенаправлением в мессенджер Telegram для подтверждения деталей с менеджером. Менеджер выставляет счет на оплату, который Покупатель может оплатить любым удобным способом (банковский перевод, онлайн-оплата). Цена товара фиксируется в счете и не подлежит изменению. Товар считается оплаченным с момента поступления денежных средств на расчетный счет Продавца.</p>
            <h4>4. Условия доставки</h4>
            <p>Доставка осуществляется по всей территории Российской Федерации с помощью транспортных компаний-партнеров («Деловые Линии», «ПЭК», «СДЭК» и другие). Стоимость и ориентировочные сроки доставки рассчитываются менеджером индивидуально при оформлении заказа и зависят от региона Покупателя и габаритов груза. Доставка может быть осуществлена до терминала транспортной компании в городе Покупателя или до конкретного адреса («до двери»). Обязательство Продавца по передаче товара считается исполненным с момента передачи груза первому перевозчику (транспортной компании). Риск случайной гибели или повреждения товара переходит к Покупателю с этого же момента.</p>
            <h4>5. Гарантия и возврат</h4>
            <p>На всю продукцию bbqp предоставляется гарантия производителя. Срок и условия гарантийного обслуживания указаны в сопроводительной документации к товару (паспорте изделия). Возврат товара надлежащего качества возможен в течение 7 дней с момента получения при условии сохранения товарного вида, потребительских свойств, а также документа, подтверждающего факт покупки. Возврат товара ненадлежащего качества осуществляется в соответствии с законодательством РФ.</p>
        </div>
      </Modal>

      <Suspense fallback={null}><ChefBot visible={isIntroComplete} externalIsOpen={isChatOpen} onToggle={setIsChatOpen} /></Suspense>
    </div>
  );
}

export default App;