import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PHRASES = [
  "Приготовьтесь", "Включите шеф-повара", "Зажигайте", "Наслаждайтесь процессом",
  "Переключайте режимы", "Творите", "Используйте возможности", "Персонализируйте",
  "Дарите эмоции", "Контролируйте температуру", "Собирайтесь вместе", "Согревайте",
  "Отдыхайте", "Перемещайте на колесах", "Заботьтесь", "Станьте героем пикника", "Веселитесь",
];

interface HeroProps {
    startAnimation?: boolean;
    isActive?: boolean;
}

const Hero: React.FC<HeroProps> = ({ startAnimation = true, isActive = true }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Удалена ошибочная строка constQP_REF
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    if (!isActive) {
        videoRef.current?.pause();
        return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const playPromise = videoRef.current?.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      } else {
        videoRef.current?.pause();
      }
    }, { threshold: 0.5 });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => { 
      if (containerRef.current) observer.unobserve(containerRef.current); 
    };
  }, [isActive]);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5;
      setIsVideoLoaded(true);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  };

  useEffect(() => {
    if (!startAnimation) return;
    const interval = setInterval(() => setCurrentPhraseIndex((prev) => (prev + 1) % PHRASES.length), 3000);
    return () => clearInterval(interval);
  }, [startAnimation]);

  const currentPhrase = PHRASES[currentPhraseIndex];

  const handleExplore = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-black text-white overflow-hidden">
      {isActive && (
        <div className="absolute inset-0 z-0">
            <video 
                ref={videoRef}
                src="/assets/videos/hero.mp4"
                autoPlay 
                loop 
                muted 
                playsInline 
                onLoadedMetadata={handleVideoLoaded} 
                onCanPlay={handleVideoLoaded} 
                preload="auto" 
                className={`w-full h-full object-cover scale-135 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {!isVideoLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
              </div>
            )}
        </div>
      )}
      <div className="absolute inset-0 bg-black/30 z-[1]"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-[2] md:hidden pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col justify-center h-full">
        <h1 
          key={currentPhraseIndex}
          className={`tracking-tight text-3xl md:text-5xl lg:text-7xl font-bold min-h-[160px] md:min-h-[200px] flex flex-col justify-center items-center leading-tight transition-opacity duration-1000 drop-shadow-2xl ${startAnimation ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}
          style={{ textShadow: '0 4px 8px rgba(0,0,0,0.9), 0 8px 24px rgba(0,0,0,0.8), 0 0 60px rgba(0,0,0,0.9)' }}
        >
           {currentPhrase}
        </h1>
      </div>

      {/* Кнопка Исследовать - поднята выше на мобильных (bottom-20) */}
      <div className={`absolute bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-1000 ${startAnimation ? 'opacity-100' : 'opacity-0'}`}>
        <button 
            onClick={handleExplore}
            className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors group"
        >
            <span className="text-sm font-medium tracking-widest uppercase">Исследовать</span>
            <ChevronDown className="animate-bounce-slow group-hover:translate-y-1 transition-transform" size={24} />
        </button>
      </div>
    </section>
  );
};

export default Hero;