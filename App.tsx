import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturesSection from './components/MenuSection';
import ParallaxImage from './components/ParallaxImage';
import Reveal from './components/Reveal';
import ParticlesOverlay from './components/ParticlesOverlay';
import { DETAILS_ITEMS } from './constants';
import { Check, ArrowRight, Upload, ChevronLeft, Loader2, Settings2, X, Box, ScanLine, FileText } from 'lucide-react';

// Lazy Load Heavy Components
const ChefBot = lazy(() => import('./components/ChefBot'));
const RecipeGenerator = lazy(() => import('./components/RecipeGenerator'));

const SECTION_ORDER = ['hero', 'features', 'autodraft', 'details', 'personalize', 'military', 'models', 'ai-chef', 'footer'];

type Option = { label: string; price: number; value: string };
type ConfigCategory = { id: string; name: string; options: Option[] };

const CONFIG_OPTIONS: ConfigCategory[] = [
  { id: 'model', name: 'Модель', options: [ { label: 'Model V', price: 25000, value: 'v' }, { label: 'Model W', price: 35000, value: 'w' } ] },
  { id: 'color', name: 'Материал', options: [ { label: 'Black Matt (Сталь)', price: 0, value: 'black' }, { label: 'Stainless (Нержавейка)', price: 15000, value: 'stainless' } ] },
  { id: 'engraving', name: 'Гравировка', options: [ { label: 'Без гравировки', price: 0, value: 'none' }, { label: 'Стандартная', price: 1000, value: 'standard' }, { label: 'Свой эскиз', price: 5000, value: 'custom' } ] }
];

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
  const [isMenuToggled, setIsMenuToggled] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
    }, { threshold: 0.5 });
    (Object.values(sectionRefs.current) as (Element | null)[]).forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const mainContainer = document.querySelector('.snap-container');
    if (mobileConfigOpen || isMenuToggled) {
      if (mainContainer) mainContainer.classList.add('overflow-hidden');
    } else {
      if (mainContainer) mainContainer.classList.remove('overflow-hidden');
    }
    return () => { if (mainContainer) mainContainer.classList.remove('overflow-hidden'); };
  }, [mobileConfigOpen, isMenuToggled]);

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

  const SectionLoader = () => ( <div className="w-full h-full flex items-center justify-center bg-transparent"><Loader2 className="w-8 h-8 animate-spin text-gray-600" /></div>);

  const ConfiguratorPanel = () => (
    <div className="flex flex-col h-full text-white">
         <div className="p-6 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2"><Settings2 size={20} className="text-orange-500"/>Конфигуратор</h2>
                <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-wider">Соберите свой bbqp</p>
            </div>
            {!isMobile && ( <div className="text-right"> <div className="text-[10px] text-gray-400 uppercase tracking-widest">Итого</div> <div className="text-xl font-bold text-white">{calculateTotal().toLocaleString()} ₽</div> </div> )}
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
                            {category.options.map((opt) => {
                                const isSelected = config[category.id].value === opt.value;
                                return ( <button key={opt.value} onClick={() => handleSelect(category.id, opt)} className={`relative flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all duration-200 border ${isSelected ? 'bg-orange-600/20 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}> <span className="z-10">{opt.label}</span> {opt.price > 0 && <span className={`z-10 ${isSelected ? 'text-orange-200' : 'text-gray-500'}`}>+{opt.price.toLocaleString()} ₽</span>} </button> );
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
               <span>Оформить заказ</span><ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
         </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden bg-black text-white selection:bg-orange-500 selection:text-white relative">
      <style>{`@keyframes comet-move { 0% { opacity: 0; transform: translate(-100px, -100px) scale(var(--scale)); } 15% { opacity: var(--max-opacity); } 85% { opacity: var(--max-opacity); } 100% { opacity: 0; transform: translate(350px, 350px) scale(var(--scale)); } }`}</style>
      <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-colors duration-[1500ms] ease-in-out ${introStep >= 1 ? 'bg-transparent' : 'bg-black'} ${introStep >= 2 ? 'hidden' : ''}`}>
        <h1 className={`font-bold tracking-tighter text-white transition-all duration-[1500ms] cubic-bezier(0.16, 1, 0.3, 1) absolute z-[101] whitespace-nowrap ${introStep >= 1 ? 'top-[22px] left-[24px] lg:left-[32px] text-2xl md:text-3xl translate-x-0 translate-y-0 opacity-0' : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl md:text-8xl' } ${introStep >= 2 ? 'hidden' : 'block'}`}>bbqp</h1>
      </div>
      <Navigation activeSection={activeSection} isIntroComplete={isIntroComplete} onChatToggle={() => setIsChatOpen(!isChatOpen)} onMenuToggle={setIsMenuToggled} />
      <main className={`snap-container h-full w-full transition-all duration-300 ${isMenuToggled ? 'blur-sm' : ''}`}>
        <div id="hero" ref={setRef('hero')} className="snap-section h-[100svh]"><Hero startAnimation={isIntroComplete} isActive={activeSection === 'hero'} /></div>
        <div id="features" ref={setRef('features')} className="snap-section h-[100svh] bg-black"><FeaturesSection isActive={activeSection === 'features'} /></div>
        <section id="autodraft" ref={setRef('autodraft')} className="snap-section h-[100svh] bg-white text-black relative overflow-hidden">{/* ... код без изменений ... */}</section>
        <section id="details" ref={setRef('details')} className="snap-section h-[100svh] bg-[#050505] text-white flex flex-col justify-center overflow-hidden relative group">{/* ... код без изменений ... */}</section>
        <section id="personalize" ref={setRef('personalize')} className="snap-section h-[100svh] bg-[#050505] text-white relative overflow-hidden flex items-center">{/* ... код без изменений ... */}</section>
        <section id="military" ref={setRef('military')} className="snap-section h-[100svh] bg-[#1c1c1c] text-white relative pt-28 pb-32 md:pb-0">{/* ... код без изменений ... */}</section>

        <section id="models" ref={setRef('models')} className="snap-section h-[100svh] bg-gray-200 relative flex flex-col md:grid md:grid-cols-2 md:items-center md:justify-items-center md:-mt-16">
          <div className="relative w-full h-[50vh] md:h-full flex items-center justify-center">
            {is3DActive ? (
              <iframe src={`/model.html?color=${config.color.value}`} title="BBQP 3D Model" className={`w-full h-full border-0 ${isMobile ? 'pointer-events-none' : ''}`} onLoad={() => setIsModelLoaded(true)}></iframe>
            ) : (
              <div className="flex items-center justify-center">
                 <button onClick={() => setIs3DActive(true)} className="group flex flex-col items-center gap-4 transition-transform hover:scale-105">
                    <div className="w-24 h-24 rounded-full bg-black/5 backdrop-blur-md text-gray-800 border border-black/10 flex items-center justify-center shadow-lg group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-500 transition-colors"><Box size={40} strokeWidth={1.2} className="ml-1" /></div>
                    <div className="bg-black/60 backdrop-blur-md px-8 py-3 rounded-full border border-white/10 shadow-lg"><span className="text-base font-bold text-white uppercase tracking-wider">Показать модель</span></div>
                 </button>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center justify-start p-8">
             <div className="w-full max-w-sm bg-black/60 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"><ConfiguratorPanel /></div>
          </div>
          {isMobile && (
             <div className="flex-1 flex flex-col items-center justify-start pointer-events-auto z-40 p-4 pt-8">
               <button onClick={() => setMobileConfigOpen(true)} className="flex items-center gap-3 bg-orange-600 text-white px-8 py-4 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all hover:bg-orange-700 active:scale-95"><Settings2 size={20} /><span className="font-bold text-sm">Настроить конфигурацию</span></button>
             </div>
          )}
          {mobileConfigOpen && (
            <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md lg:hidden flex items-end sm:items-center justify-center animate-fade-in pointer-events-auto">
                <div className="bg-[#111] w-full sm:w-[90%] h-[75vh] sm:h-auto sm:max-h-[80vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl flex flex-col relative animate-slide-up overflow-hidden border border-white/10">
                    <button onClick={() => setMobileConfigOpen(false)} className="absolute top-4 right-4 z-20 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"><X size={24} /></button>
                    <ConfiguratorPanel />
                </div>
            </div>
          )}
        </section>

        <div id="ai-chef" ref={setRef('ai-chef')} className="snap-section h-[100svh] bg-[#050505]"><Suspense fallback={<SectionLoader />}><RecipeGenerator /></Suspense></div>

        <footer id="footer" ref={setRef('footer')} className="snap-section h-[100svh] bg-black text-white flex flex-col justify-center items-center pb-12 md:pb-0">
          {/* ... код футера ... */}
        </footer>
      </main>

      <Modal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} title="Политика конфиденциальности"> <div className="prose prose-invert max-w-none text-sm space-y-4"> {/* ... полный текст ... */} </div> </Modal>
      <Modal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} title="Условия использования"> <div className="prose prose-invert max-w-none text-sm space-y-4"> {/* ... полный текст ... */} </div> </Modal>

      <Suspense fallback={null}><ChefBot visible={isIntroComplete} externalIsOpen={isChatOpen} onToggle={setIsChatOpen} /></Suspense>
    </div>
  );
}

export default App;