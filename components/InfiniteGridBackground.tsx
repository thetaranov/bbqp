import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  // Генерируем массив изображений.
  // Нам нужно достаточно элементов, чтобы заполнить контейнер 200%x200% с мелкой сеткой.
  const gridImages = useMemo(() => {
    // Дублируем исходный массив много раз
    const pool = [];
    // Для мелкой сетки нужно много элементов (например, сетка 12 колонок * 20 рядов = 240 элементов)
    for (let i = 0; i < 30; i++) {
        pool.push(...images); 
    }
    // Перемешиваем для визуального разнообразия
    return pool.sort(() => 0.5 - Math.random()).slice(0, 300);
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-black">
      {/* 
         Контейнер 200% ширины и высоты.
         Анимация pan-diagonal двигает его от 0,0 до -50%,-50%.
         В точке -50% картинка должна идеально совпадать с точкой 0, создавая бесшовную петлю.
      */}
      <div className="w-[200%] h-[200%] grid grid-cols-12 md:grid-cols-16 gap-4 animate-pan-diagonal opacity-50">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#111] border border-white/5"
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

      {/* Затемнение, чтобы текст читался идеально */}
      <div className="absolute inset-0 bg-black/60"></div>
    </div>
  );
};

export default InfiniteGridBackground;