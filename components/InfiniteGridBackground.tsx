import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    const pool = [];
    // Много копий для заполнения сетки
    for (let i = 0; i < 50; i++) {
        pool.push(...images); 
    }
    return pool.sort(() => 0.5 - Math.random()).slice(0, 600);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      {/* 
         Используем grid-cols-12 (десктоп) и gap-1.
         ВАЖНО: aspect-square здесь работает для контейнера грида, 
         но нам нужно применить его к детям или использовать хак с padding.
      */}
      <div className="w-[200%] grid grid-cols-12 md:grid-cols-20 gap-1 animate-pan-diagonal -ml-[20%] -mt-[20%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full pt-[100%] overflow-hidden bg-[#111]" 
            // pt-[100%] — это padding-top: 100%, гарантирующий квадрат
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