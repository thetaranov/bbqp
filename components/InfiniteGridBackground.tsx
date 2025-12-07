import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    let pool: string[] = [];
    // Делаем массив чуть меньше, но достаточно большим
    for (let i = 0; i < 60; i++) {
        pool = pool.concat(images);
    }

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

    // Ограничиваем количество, чтобы не грузить DOM слишком сильно
    return pool.slice(0, 600);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      {/* 
         Используем CSS Grid с auto-rows
         w-[250%] h-[250%] - запас для движения
         grid-cols-8 (моб) и grid-cols-12 (десктоп) - оптимальный размер ячеек
      */}
      <div className="w-[250%] h-[250%] grid grid-cols-8 md:grid-cols-16 gap-1 animate-pan-diagonal -ml-[50%] -mt-[50%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full overflow-hidden bg-[#0a0a0a]"
            style={{ aspectRatio: '1/1' }} // Принудительный квадрат
          >
            <img 
              src={src} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-90 transition-opacity duration-700 ease-in-out"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-black/60"></div>
    </div>
  );
};

export default InfiniteGridBackground;