import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  // Создаем массив изображений достаточного размера для заполнения большой сетки.
  // Дублируем исходный массив, чтобы заполнить сетку 8x12 (96 элементов) для плавности на больших экранах
  const gridImages = useMemo(() => {
    const repeated = [];
    // Нам нужно достаточно много картинок, чтобы заполнить 200% ширины и высоты
    // При 10 исходных картинках, повторим их 10 раз -> 100 картинок
    for (let i = 0; i < 12; i++) {
        repeated.push(...images);
    }
    return repeated;
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      {/* 
         Контейнер 200% ширины и высоты. 
         Анимация pan-diagonal двигает его от 0,0 до -50%,-50%.
         Это создает эффект бесконечного движения.
      */}
      <div className="w-[250%] h-[250%] -ml-[20%] -mt-[20%] grid grid-cols-8 md:grid-cols-10 gap-4 animate-pan-diagonal opacity-60">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full aspect-square rounded-xl overflow-hidden shadow-lg border border-white/5 bg-white/5"
          >
            <img 
              src={src} 
              alt="" 
              className="w-full h-full object-cover transform scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Легкая виньетка по краям экрана для эстетики, не перекрывающая картинки полностью */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/80"></div>
    </div>
  );
};

export default InfiniteGridBackground;