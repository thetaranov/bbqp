import React, { useEffect, useRef, useState } from 'react';

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
          playPromise.catch(() => {
            // Автоплей заблокирован браузером
          });
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

  // Функция для установки скорости видео при загрузке
  const handleVideoLoaded = () => {
    if (videoRef.current) {
      // Устанавливаем скорость 50% от оригинальной
      videoRef.current.playbackRate = 0.5;
      setIsVideoLoaded(true);

      // Попробуем начать воспроизведение
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Автоплей заблокирован браузером, но скорость уже установлена
        });
      }
    }
  };

  useEffect(() => {
    if (!startAnimation) return;
    const interval = setInterval(() => setCurrentPhraseIndex((prev) => (prev + 1) % PHRASES.length), 3000);
    return () => clearInterval(interval);
  }, [startAnimation]);

  const currentPhrase = PHRASES[currentPhraseIndex];

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
                onLoadedMetadata={handleVideoLoaded} // Устанавливаем скорость при загрузке метаданных
                onCanPlay={handleVideoLoaded} // Также устанавливаем скорость, когда видео готово к воспроизведению
                preload="auto" // Предзагрузка видео
                className={`w-full h-full object-cover scale-135 transition-opacity duration-700 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
            {/* Показ плейсхолдера пока видео загружается */}
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
    </section>
  );
};

export default Hero;