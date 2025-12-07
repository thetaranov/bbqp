import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  // Генерация "случайного" паттерна без явных повторений рядом
  const gridImages = useMemo(() => {
    // Нам нужно много картинок, чтобы заполнить огромную область
    const pool = [...images, ...images, ...images, ...images, ...images];

    // Простой шаффл для создания ощущения неповторяющегося паттерна
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Возвращаем достаточно элементов для сетки 12x12
    return pool.slice(0, 144);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      {/* 
         Анимация: pan-diagonal (определена в tailwind.config.js).
         Размер контейнера 250% чтобы при движении не было видно краев.
      */}
      <div className="w-[250%] h-[250%] -ml-[50%] -mt-[50%] grid grid-cols-8 md:grid-cols-12 gap-1 animate-pan-diagonal">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full aspect-square overflow-hidden bg-[#111]"
          >
            <img 
              src={src} 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Легкое затемнение, чтобы картинки не спорили с контентом, но были хорошо видны */}
      <div className="absolute inset-0 bg-black/40"></div>
    </div>
  );
};

export default InfiniteGridBackground;