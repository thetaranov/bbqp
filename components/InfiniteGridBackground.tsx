import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    let pool: string[] = [];
    for (let i = 0; i < 60; i++) pool = pool.concat(images);
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
    return pool.slice(0, 600);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505] perspective-[1000px]">
        {/* Добавили стили для 3D перспективы и анимации стены */}
        <style>{`
            @keyframes wall-sway {
                0%, 100% { transform: rotateY(-5deg) rotateX(2deg) scale(1.1); }
                50% { transform: rotateY(5deg) rotateX(-2deg) scale(1.1); }
            }
            .wall-3d {
                animation: wall-sway 20s ease-in-out infinite;
                transform-style: preserve-3d;
            }
        `}</style>

      {/* Обертка для 3D трансформации */}
      <div className="absolute inset-0 wall-3d">
          <div className="w-[250%] grid grid-cols-16 md:grid-cols-32 gap-1 animate-pan-diagonal -ml-[50%] -mt-[50%]">
            {gridImages.map((src, index) => (
              <div 
                key={`grid-img-${index}`} 
                className="relative w-full aspect-square bg-[#0a0a0a] overflow-hidden shadow-lg"
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

      {/* Затемнение поверх 3D слоя */}
      <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
    </div>
  );
};

export default InfiniteGridBackground;