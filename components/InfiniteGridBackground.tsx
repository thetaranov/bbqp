import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    const pool = [];
    // Делаем массив очень большим для бесшовности
    for (let i = 0; i < 50; i++) {
        pool.push(...images); 
    }
    // Тщательно перемешиваем
    return pool.sort(() => 0.5 - Math.random()).slice(0, 600);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      {/* 
         Увеличили контейнер и количество колонок.
         gap-1 создает тонкие разделители.
      */}
      <div className="w-[200%] h-[200%] grid grid-cols-12 md:grid-cols-24 gap-1 animate-pan-diagonal -ml-[20%] -mt-[20%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full h-full overflow-hidden bg-[#111]"
            style={{ aspectRatio: '1/1' }} // Принудительный квадрат
          >
            <img 
              src={src} 
              alt="" 
              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity duration-700"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Легкое затемнение для контраста текста */}
      <div className="absolute inset-0 bg-black/50"></div>
    </div>
  );
};

export default InfiniteGridBackground;