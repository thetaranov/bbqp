import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    let pool: string[] = [];
    // Делаем массив очень большим
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
    return pool.slice(0, 1200);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      {/* 
         ИСПРАВЛЕНИЕ:
         Вместо несуществующих классов grid-cols-32 используем произвольные значения в скобках [].
         grid-cols-[repeat(16,1fr)] - 16 колонок на мобильном
         md:grid-cols-[repeat(32,1fr)] - 32 колонки на десктопе (очень мелкая сетка)
      */}
      <div className="w-[250%] grid grid-cols-[repeat(16,1fr)] md:grid-cols-[repeat(32,1fr)] gap-1 animate-pan-diagonal -ml-[50%] -mt-[50%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full aspect-square bg-[#0a0a0a] overflow-hidden"
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
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
  );
};

export default InfiniteGridBackground;