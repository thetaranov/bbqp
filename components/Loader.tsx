import React, { useEffect, useState } from 'react';

interface LoaderProps {
  isLoading: boolean;
}

const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
  const [shouldRender, setShouldRender] = useState(true);

  // Убираем компонент из DOM после завершения анимации исчезновения
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShouldRender(false), 1000); // 1000ms - время анимации opacity
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Логика загрузки скрипта Unicorn Studio
  useEffect(() => {
    const scriptId = 'unicorn-studio-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js";
      script.onload = function() {
        const win = window as any;
        if (!win.UnicornStudio.isInitialized) {
          win.UnicornStudio.init();
          win.UnicornStudio.isInitialized = true;
        }
      };
      document.head.appendChild(script);
    } else {
        // Если скрипт уже есть, пробуем инициализировать снова (на случай ре-маунта)
        const win = window as any;
        if (win.UnicornStudio && !win.UnicornStudio.isInitialized) {
            win.UnicornStudio.init();
            win.UnicornStudio.isInitialized = true;
        }
    }
  }, []);

  if (!shouldRender) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-1000 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Unicorn Studio Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         <div 
            data-us-project="OzI2W3RpiS8R2jyvFcSM" 
            style={{ width: '100%', height: '100%' }}
         ></div>
      </div>

      {/* Overlay для затемнения фона, чтобы логотип читался лучше */}
      <div className="absolute inset-0 bg-black/40 z-[1]"></div>

      {/* Centered Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl animate-pulse">
            bbqp
        </h1>
        <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;