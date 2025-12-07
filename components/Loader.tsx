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

  // Логика загрузки скрипта Unicorn Studio (для фона)
  useEffect(() => {
    const scriptId = 'unicorn-studio-script-loader';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js";
      script.onload = function() {
        const win = window as any;
        if (win.UnicornStudio && !win.UnicornStudio.isInitialized) {
          win.UnicornStudio.init();
          win.UnicornStudio.isInitialized = true;
        }
      };
      document.head.appendChild(script);
    } else {
        // Если скрипт уже есть, пробуем инициализировать снова
        const win = window as any;
        if (win.UnicornStudio) {
            win.UnicornStudio.init();
        }
    }
  }, []);

  if (!shouldRender) return null;

  // HTML код для изоляции фона в iframe (такой же как в футере)
  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: black; }
          #canvas-container { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div data-us-project="OzI2W3RpiS8R2jyvFcSM" style="width:100%; height: 100%"></div>
        <script src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js"></script>
        <script>
          window.onload = function() {
            if (window.UnicornStudio) {
              window.UnicornStudio.init();
            }
          };
        </script>
      </body>
    </html>
  `;

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-1000 ease-in-out ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Unicorn Studio Background via Iframe to isolate styles and scripts */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         <iframe
            title="loader-background"
            srcDoc={iframeContent}
            className="w-full h-full border-0"
            style={{ pointerEvents: 'none' }}
         />
      </div>

      {/* Overlay для затемнения фона, чтобы логотип читался лучше */}
      <div className="absolute inset-0 bg-black/40 z-[1]"></div>

      {/* Centered Logo Animation */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="flex text-6xl md:text-8xl font-bold tracking-tighter text-white drop-shadow-2xl">
            {/* Анимация подпрыгивания букв */}
            <span className="animate-bounce" style={{ animationDelay: '0s', animationDuration: '1.5s' }}>b</span>
            <span className="animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '1.5s' }}>b</span>
            <span className="animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1.5s' }}>q</span>
            <span className="animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '1.5s' }}>p</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;