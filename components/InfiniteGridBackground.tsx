import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    // Создаем большой пул
    let pool: string[] = [];
    for (let i = 0; i < 60; i++) {
        pool = pool.concat(images);
    }

    // Умное перемешивание (Fisher-Yates Shuffle)
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Дополнительная проверка: стараемся не ставить одинаковые картинки подряд
    for (let i = 1; i < pool.length; i++) {
        if (pool[i] === pool[i-1]) {
            // Если текущая совпадает с предыдущей, меняем её со следующей (или случайной)
            const swapIdx = (i + Math.floor(Math.random() * 10)) % pool.length;
            [pool[i], pool[swapIdx]] = [pool[swapIdx], pool[i]];
        }
    }

    return pool.slice(0, 800); // Возвращаем много элементов
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      <div className="w-[300%] grid grid-cols-12 md:grid-cols-24 gap-1 animate-pan-diagonal -ml-[50%] -mt-[50%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full pt-[100%] overflow-hidden bg-[#111]"
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