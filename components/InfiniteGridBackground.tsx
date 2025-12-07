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
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#0a0a0a]">
      {/* 
         Контейнер 200% ширины и высоты.
         Анимация pan-diagonal двигает его.
         Используем grid-cols-8 (моб) и grid-cols-12 (десктоп) для создания мелкой сетки.
         gap-px создает тонкие линии между квадратами для четкости.
      */}
      <div className="w-[200%] h-[200%] grid grid-cols-12 md:grid-cols-20 gap-px animate-pan-diagonal -ml-[20%] -mt-[20%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full aspect-square bg-[#111] overflow-hidden"
          >
            <img 
              src={src} 
              alt="" 
              className="w-full h-full object-cover opacity-70"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Затемнение для читаемости текста */}
      <div className="absolute inset-0 bg-black/60"></div>
    </div>
  );
};

export default InfiniteGridBackground;