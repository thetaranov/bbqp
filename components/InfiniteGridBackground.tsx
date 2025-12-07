import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    let pool: string[] = [];
    // Делаем массив ОЧЕНЬ большим, чтобы заполнить огромный контейнер
    for (let i = 0; i < 100; i++) pool = pool.concat(images);

    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (let i = 1; i < pool.length; i++) {
        if (pool[i] === pool[i-1]) {
            const swapIdx = (i + 5 + Math.floor(Math.random() * 20)) % pool.length;
            [pool[i], pool[swapIdx]] = [pool[swapIdx], pool[i]];
        }
    }
    // Ограничиваем разумным числом, но достаточным для h-[350%]
    return pool.slice(0, 1000);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]" style={{ perspective: '1200px' }}>
        <style>{`
            @keyframes wall-sway {
                0%, 100% { transform: rotateY(-12deg) rotateX(5deg) scale(1.5); }
                50% { transform: rotateY(12deg) rotateX(-5deg) scale(1.5); }
            }
            .wall-3d-wrapper {
                width: 100%;
                height: 100%;
                /* Анимация с увеличенным scale(1.5), чтобы скрыть края */
                animation: wall-sway 25s ease-in-out infinite;
                transform-style: preserve-3d;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `}</style>

      <div className="wall-3d-wrapper">
          {/* 
             Увеличили высоту контейнера до h-[350%], чтобы при наклоне сверху и снизу не было пустот.
             Ширина w-[250%] достаточна.
             grid-cols-[repeat(16,1fr)] / 32 - сохраняем мелкую сетку.
          */}
          <div className="w-[250%] h-[350%] grid grid-cols-[repeat(16,1fr)] md:grid-cols-[repeat(32,1fr)] gap-1 animate-pan-diagonal -ml-[50%] -mt-[50%]">
            {gridImages.map((src, index) => (
              <div 
                key={`grid-img-${index}`} 
                className="relative w-full bg-[#0a0a0a] overflow-hidden"
                style={{ aspectRatio: '1/1' }} 
              >
                <img 
                  src={src} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
      </div>

      <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
    </div>
  );
};

export default InfiniteGridBackground;