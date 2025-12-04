import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturesSection from './components/MenuSection';
import ParallaxImage from './components/ParallaxImage';
import Reveal from './components/Reveal';
import ParticlesOverlay from './components/ParticlesOverlay';
import { DETAILS_ITEMS, NAV_LINKS } from './constants';
import { Check, ArrowRight, Upload, ChevronLeft, Loader2, Settings2, X, Box, ScanLine, FileText } from 'lucide-react';

// Lazy Load Heavy Components
const ChefBot = lazy(() => import('./components/ChefBot'));
const RecipeGenerator = lazy(() => import('./components/RecipeGenerator'));

// Optimization Constants
const SECTION_ORDER = ['hero', 'features', 'autodraft', 'details', 'personalize', 'military', 'models', 'ai-chef', 'contact'];

// Configuration Data
type Option = { label: string; price: number; value: string };
type ConfigCategory = { id: string; name: string; options: Option[] };

const CONFIG_OPTIONS: ConfigCategory[] = [
  { id: 'model', name: 'Модель', options: [ { label: 'Model V', price: 25000, value: 'v' }, { label: 'Model W', price: 35000, value: 'w' } ] },
  { id: 'color', name: 'Материал', options: [ { label: 'Black Matt (Сталь)', price: 0, value: 'black' }, { label: 'Stainless (Нержавейка)', price: 15000, value: 'stainless' } ] },
  { id: 'engraving', name: 'Гравировка', options: [ { label: 'Без гравировки', price: 0, value: 'none' }, { label: 'Стандартная', price: 1000, value: 'standard' }, { label: 'Свой эскиз', price: 5000, value: 'custom' } ] }
];

const PHYSICS_FORMULAS = [ "Q = c·m·Δt", "C + O₂ → CO₂ + Q", "F = m·a", "P + ρv²/2 = const", "PV = nRT", "Q = q·m", "v = √(2ΔP/ρ)", "ΔU = Q - W", "Q = L·m", "Q = r·m", "η = 1 - T₂/T₁", "dQ = dU + pdV" ];

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} className="text-gray-400" /></button>
        </div>
        <div className="overflow-y-auto flex-1">
          <div className="p-6">{children}</div>
        </div>
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <button onClick={onClose} className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors">Закрыть</button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const TELEGRAM_LINK = "https://t.me/thetaranov";

  const [config, setConfig] = useState<Record<string, Option>>({ model: CONFIG_OPTIONS[0].options[0], color: CONFIG_OPTIONS[1].options[1], engraving: CONFIG_OPTIONS[2].options[1] });
  const [openCategory, setOpenCategory] = useState<string | null>('model'); 
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const setRef = (id: string) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; };
  const handleSelect = (categoryId: string, option: Option) => setConfig(prev => ({ ...prev, [categoryId]: option }));
  const toggleCategory = (id: string) => setOpenCategory(openCategory === id ? null : id);
  const calculateTotal = () => (Object.values(config) as Option[]).reduce((acc, item) => acc + item.price, 0);

  const getOrderLink = () => {
    let text = `Здравствуйте! Хочу заказать bbqp:%0A` +
      Object.entries(config).map(([key, val]) => `- ${CONFIG_OPTIONS.find(c => c.id === key)?.name}: ${(val as Option).label}`).join('%0A') +
      `%0A%0AСтоимость: ${calculateTotal()} руб.`;
    return `${TELEGRAM_LINK}?text=${text}`;
  };

  const shouldRenderSection = (sectionId: string) => {
    const currentIndex = SECTION_ORDER.indexOf(activeSection);
    const targetIndex = SECTION_ORDER.indexOf(sectionId);
    return Math.abs(currentIndex - targetIndex) <= 1;
  };

  const ConfiguratorPanel = () => (
    <div className="flex flex-col h-full text-white">
         <div className="p-6 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2"><Settings2 size={20} className="text-orange-500"/>Конфигуратор</h2>
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
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-transform duration-300 ${openCategory === category.id ? 'bg-white/10 rotate-180' : 'bg-transparent'}`}><ChevronLeft size={16} className="-rotate-90 text-gray-400"/></div>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openCategory === category.id ? 'max-h-[250px] opacity-100' : 'max-h-0 opacity-0'}`}>
                     <div className="p-4 pt-0">
                        <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
                            {category.options.map((opt) => (
                               <button key={opt.value} onClick={() => handleSelect(category.id, opt)} className={`relative flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${config[category.id].value === opt.value ? 'bg-orange-600/20 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
                                  <span>{opt.label}</span>
                                  {opt.price > 0 && <span className={`${config[category.id].value === opt.value ? 'text-orange-200' : 'text-gray-500'}`}>+{opt.price.toLocaleString()} ₽</span>}
                               </button>
                            ))}
                        </div>
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
      <Navigation activeSection={activeSection} isIntroComplete={true} onChatToggle={() => setIsChatOpen(!isChatOpen)} />
      <main className="snap-container h-full w-full">
        <div id="hero" ref={setRef('hero')} className="snap-section h-[100svh]">{shouldRenderSection('hero') && <Hero />}</div>
        <div id="features" ref={setRef('features')} className="snap-section h-[100svh] bg-black">{shouldRenderSection('features') && <FeaturesSection />}</div>
        <div id="autodraft" ref={setRef('autodraft')} className="snap-section h-[100svh]">{/* ... */}</div>
        <div id="details" ref={setRef('details')} className="snap-section h-[100svh]">{/* ... */}</div>
        <div id="personalize" ref={setRef('personalize')} className="snap-section h-[100svh]">{/* ... */}</div>
        <div id="military" ref={setRef('military')} className="snap-section h-[100svh]">{/* ... */}</div>

        <section id="models" ref={setRef('models')} className="snap-section h-[100svh] bg-gray-200 relative">
           {shouldRenderSection('models') && (
            <>
               {/* --- Контейнер для 3D Модели --- */}
               <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full">
                  {is3DActive ? (
                     <div className="relative w-full h-full">
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
                        <div className="absolute inset-0 z-20 lg:hidden"></div>
                     </div>
                  ) : (
                     <div className="w-full h-full flex items-center justify-center">
                        <button onClick={() => setIs3DActive(true)} className="group flex flex-col items-center gap-4 transition-transform hover:scale-105">
                           <div className="w-24 h-24 rounded-full bg-black/5 backdrop-blur-md text-gray-800 border border-black/10 flex items-center justify-center shadow-lg group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-500 transition-colors">
                              <Box size={40} strokeWidth={1.2} className="ml-1" />
                           </div>
                           <div className="bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg"><span className="text-base font-bold text-white uppercase tracking-wider">Показать модель</span></div>
                        </button>
                     </div>
                  )}
               </div>

               {/* --- Контейнер для Конфигуратора (только ПК) --- */}
               <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:flex items-center justify-center pointer-events-auto pt-16">
                   <div className="w-full max-w-[380px] h-full max-h-[650px]">
                      <div className={`w-full h-full bg-black/60 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col transition-opacity duration-700 ${is3DActive ? 'opacity-100' : 'opacity-0'}`}>
                         <ConfiguratorPanel />
                      </div>
                   </div>
               </div>

               {/* --- UI для мобильных устройств --- */}
               {mobileConfigOpen && (
                 <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md lg:hidden flex items-end sm:items-center justify-center animate-fade-in pointer-events-auto">
                     <div className="bg-[#111] w-full sm:w-[90%] h-[80vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col relative animate-slide-up overflow-hidden border border-white/10">
                         <button onClick={() => setMobileConfigOpen(false)} className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24} /></button>
                         <ConfiguratorPanel />
                     </div>
                 </div>
               )}
               <div className={`lg:hidden absolute bottom-[12vh] left-0 w-full flex justify-center pointer-events-auto transition-opacity duration-500 ${is3DActive ? 'opacity-100' : 'opacity-0'}`}>
                 <button onClick={() => setMobileConfigOpen(true)} className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all hover:bg-orange-700 active:scale-95"><Settings2 size={20} /><span className="font-bold text-sm">Настроить конфигурацию</span></button>
               </div>
            </>
           )}
        </section>

        <div id="ai-chef" ref={setRef('ai-chef')} className="snap-section h-[100svh] bg-[#050505]">{shouldRenderSection('ai-chef') && <Suspense fallback={<div></div>}><RecipeGenerator /></Suspense>}</div>
        <footer id="contact" ref={setRef('contact')} className="snap-section h-[100svh] bg-black text-white">
          <Reveal className="w-full max-w-4xl mx-auto px-6 text-center">
             <div className="mb-6">
                <div className="text-3xl md:text-5xl font-bold tracking-tighter mb-2">bbqp</div>
                <p className="text-sm text-gray-500 font-medium mb-6">Инновации в искусстве приготовления.</p>
                <div className="mb-6 text-left text-sm text-gray-400">
                  <div className="mb-4">
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
             <div className="border-t border-white/10 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600">
               <p>© 2025 bbqp. Все права защищены.</p>
               <div className="flex gap-6">
                 <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-white transition-colors">Конфиденциальность</button>
                 <button onClick={() => setIsTermsOpen(true)} className="hover:text-white transition-colors">Условия</button>
                 <a href="/assets/docs/MANUAL.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1"><FileText size={12} /> Руководство</a>
               </div>
             </div>
          </Reveal>
        </footer>
      </main>
      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Политика конфиденциальности">{/* ... */}</Modal>
      <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Условия использования">{/* ... */}</Modal>
      <Suspense fallback={null}><ChefBot visible={true} externalIsOpen={isChatOpen} onToggle={setIsChatOpen} /></Suspense>
    </div>
  );
}

export default App;