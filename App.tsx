import React, { useState, useEffect, useRef, Suspense, lazy, useMemo } from 'react';
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import FeaturesSection from './components/MenuSection';
import ParallaxImage from './components/ParallaxImage';
import Reveal from './components/Reveal';
import ParticlesOverlay from './components/ParticlesOverlay';
import { DETAILS_ITEMS } from './constants';
import { Check, ArrowRight, Upload, ChevronLeft, Settings2, X, Box, ScanLine, FileText } from 'lucide-react';
import FloatingFormulasOverlay from './components/FloatingFormulasOverlay';
import Modal from './components/Modal';
import ConfiguratorPanel from './components/ConfiguratorPanel';
import SiteFooter from './components/Footer';
import { Option, ConfigCategory } from './types';

// Lazy Load Heavy Components
const ChefBot = lazy(() => import('./components/ChefBot'));
// RecipeGenerator удален

const CONFIG_OPTIONS: ConfigCategory[] = [
  { id: 'model', name: 'Модель', options: [ { label: 'Model V', price: 25000, value: 'v' }, { label: 'Model W', price: 35000, value: 'w' } ] },
  { id: 'color', name: 'Материал', options: [ { label: 'Black Matt (Сталь)', price: 0, value: 'black' }, { label: 'Stainless (Нержавейка)', price: 15000, value: 'stainless' } ] },
  { id: 'engraving', name: 'Гравировка', options: [ { label: 'Без гравировки', price: 0, value: 'none' }, { label: 'Стандартная', price: 1000, value: 'standard' }, { label: 'Свой эскиз', price: 5000, value: 'custom' } ] }
];

function App() {
  const TELEGRAM_LINK = "https://t.me/thetaranov";
  const [config, setConfig] = useState<Record<string, Option>>({ model: CONFIG_OPTIONS[0].options[0], color: CONFIG_OPTIONS[1].options[1], engraving: CONFIG_OPTIONS[2].options[1] });
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [openCategory, setOpenCategory] = useState<string | null>('model'); 
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [mobileConfigOpen, setMobileConfigOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [is3DActive, setIs3DActive] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Состояние для слайдера деталей
  const [activeDetailIndex, setActiveDetailIndex] = useState(0);
  const [isHoveringDetails, setIsHoveringDetails] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Авто-переключение деталей
  useEffect(() => {
    let interval: number;
    if (!isHoveringDetails && activeSection === 'details') {
        interval = setInterval(() => {
            setActiveDetailIndex((prev) => (prev + 1) % DETAILS_ITEMS.length);
        }, 4000); // 4 секунды на слайд
    }
    return () => clearInterval(interval);
  }, [isHoveringDetails, activeSection]);

  useEffect(() => {
    const timer = setTimeout(() => setIntroComplete(true), 500);
    return () => clearTimeout(timer);
  }, []);

    useEffect(() => {
  // Помечаем страницу как загруженную
  if (window.markPageAsLoaded) {
    window.markPageAsLoaded();
  }
}, []);

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
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
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
    return () => {
      if (mainContainer) mainContainer.classList.remove('overflow-hidden');
    };
  }, [mobileConfigOpen]);

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el;
  };

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
      <Navigation activeSection={activeSection} isIntroComplete={introComplete} />

      <main className={`snap-container h-full w-full`}>
        <div id="hero" ref={setRef('hero')} className="snap-section h-[100svh]">
            <Hero startAnimation={introComplete} isActive={activeSection === 'hero'} />
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

        {/* --- СЕКЦИЯ DETAILS (НОВЫЙ ДИЗАЙН) --- */}
        <section id="details" ref={setRef('details')} className="snap-section h-[100svh] bg-[#050505] text-white flex items-center justify-center overflow-hidden relative">
            <div className="container mx-auto px-6 h-full flex flex-col md:flex-row">

                {/* ЛЕВАЯ ЧАСТЬ: Карусель (Галерея) */}
                <div className="w-full md:w-1/2 h-[40vh] md:h-full flex items-center justify-center relative order-1 md:order-1 p-4">
                     <div className="relative w-full h-full max-h-[60vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        {DETAILS_ITEMS.map((item, idx) => (
                            <div 
                                key={item.id}
                                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${idx === activeDetailIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                            >
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden"></div>
                                <div className="absolute bottom-6 left-6 md:hidden">
                                    <h3 className="text-xl font-bold text-white">{item.title}</h3>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>

                {/* ПРАВАЯ ЧАСТЬ: Текст и список */}
                <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center order-2 md:order-2 p-4 md:pl-12 relative z-10">
                    <Reveal>
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tighter">
                            Внимание к <span className="text-orange-500">деталям</span>
                        </h2>

                        <div 
                            className="space-y-2"
                            onMouseEnter={() => setIsHoveringDetails(true)}
                            onMouseLeave={() => setIsHoveringDetails(false)}
                        >
                            {DETAILS_ITEMS.map((item, idx) => (
                                <div 
                                    key={item.id}
                                    onClick={() => setActiveDetailIndex(idx)}
                                    className={`group cursor-pointer p-4 rounded-2xl transition-all duration-300 border border-transparent ${
                                        idx === activeDetailIndex 
                                        ? 'bg-white/10 border-white/10' 
                                        : 'hover:bg-white/5 hover:pl-6'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className={`text-lg font-bold transition-colors ${idx === activeDetailIndex ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                            {item.title}
                                        </h3>
                                        {idx === activeDetailIndex && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>}
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-500 ${idx === activeDetailIndex ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>

            </div>
            {/* Фоновый градиент для текста на мобилках */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none z-0 md:hidden"></div>
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
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-200">
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

        <SiteFooter
          setRef={setRef('contact')}
          onPrivacyOpen={() => setIsPrivacyOpen(true)}
          onTermsOpen={() => setIsTermsOpen(true)}
          onAIOpen={() => setIsChatOpen(true)}
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
                <p>Продавец обязуется передать в собственность Покупателя, а Покупатель обязуется оплатить и принять товар (печь-мангал bbqp и аксессуары), заказанный на Сайте в соответствии с выбранной конфигурацией на основании Счета-оферты.</p>
                <h4>3. Оформление заказа и оплата</h4>
                <p>Заказ на продукцию bbqp оформляется через конфигуратор на Сайте с последующим перенаправлением в мессенджер Telegram для подтверждения деталей с менеджером. Менеджер выставляет счет на оплату, который Покупатель может оплатить любым удобным способом (банковский перевод, онлайн-оплата). Цена товара фиксируется в счете и не подлежит изменению. Товар считается оплаченным с момента поступления денежных средств на расчетный счет Продавца.</p>
                <h4>4. Условия доставки</h4>
                <p>Доставка осуществляется по всей территории Российской Федерации с помощью транспортных компаний-партнеров («Деловые Линии», «ПЭК», «СДЭК» и другие). Стоимость и ориентировочные сроки доставки рассчитываются менеджером индивидуально при оформлении заказа и зависят от региона Покупателя и габаритов груза. Доставка может быть осуществлена до терминала транспортной компании в городе Покупателя или до конкретного адреса («до двери»). Обязательство Продавца по передаче товара считается исполненным с момента передачи груза первому перевозчику (транспортной компании). Риск случайной гибели или повреждения товара переходит к Покупателю с этого же момента.</p>
                <h4>5. Гарантия и возврат</h4>
                <p>На всю продукцию bbqp предоставляется гарантия производителя. Срок и условия гарантийного обслуживания указаны в сопроводительной документации к товару (паспорте изделия). Возврат товара надлежащего качества возможен в течение 7 дней с момента получения при условии сохранения товарного вида, потребительских свойств, а также документа, подтверждающего факт покупки. Возврат товара ненадлежащего качества осуществляется в соответствии с законодательством РФ.</p>
            </div>
          </Modal>

      <Suspense fallback={null}>
          <ChefBot 
            visible={true} 
            externalIsOpen={isChatOpen} 
            onToggle={setIsChatOpen} 
            showFloatingButton={false} 
          />
      </Suspense>
    </div>
  );
}

export default App;