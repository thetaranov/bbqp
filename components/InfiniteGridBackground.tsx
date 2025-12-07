import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  // Генерируем массив изображений для заполнения большой сетки
  const gridImages = useMemo(() => {
    const pool = [];
    // Увеличиваем количество повторений для заполнения мелкой сетки
    for (let i = 0; i < 40; i++) {
        pool.push(...images); 
    }
    // Перемешиваем
    return pool.sort(() => 0.5 - Math.random()).slice(0, 400);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-black">
      {/* 
         Контейнер 200% ширины и высоты.
         Анимация pan-diagonal двигает его.
         Используем grid-cols-8 (моб) и grid-cols-12 (десктоп) для создания мелкой сетки.
      */}
      <div className="w-[250%] h-[250%] grid grid-cols-12 md:grid-cols-20 gap-1 animate-pan-diagonal -ml-[20%] -mt-[20%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full aspect-square overflow-hidden bg-[#111]"
          >
            <img 
              src={src} 
              alt="" 
              className="w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity duration-500"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Равномерное затемнение для читаемости текста */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
    </div>
  );
};

export default InfiniteGridBackground;