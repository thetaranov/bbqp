import React, { useMemo } from 'react';

interface InfiniteGridBackgroundProps {
  images: string[];
}

const InfiniteGridBackground: React.FC<InfiniteGridBackgroundProps> = ({ images }) => {
  const gridImages = useMemo(() => {
    // Если картинок нет, возвращаем пустой массив
    if (!images || images.length === 0) return [];

    let pool: string[] = [];
    // Много копий для заполнения очень мелкой сетки (нужно >1000 элементов)
    // Если исходных картинок 10, повторяем 120 раз = 1200 ячеек
    for (let i = 0; i < 120; i++) {
        pool = pool.concat(images);
    }

    // Алгоритм Тасования Фишера — Йетса
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Проход для устранения одинаковых соседей по горизонтали
    for (let i = 1; i < pool.length; i++) {
        if (pool[i] === pool[i-1]) {
            // Ищем кандидата на замену подальше
            const swapIdx = (i + 5 + Math.floor(Math.random() * 20)) % pool.length;
            [pool[i], pool[swapIdx]] = [pool[swapIdx], pool[i]];
        }
    }

    return pool;
  }, [images]);

  return (
    <div className="absolute inset-0 overflow-hidden select-none pointer-events-none z-0 bg-[#050505]">
      {/* 
         Сетка:
         - w-[300%]: чтобы при диагональном сдвиге не кончались квадраты.
         - grid-cols-16 (моб) / grid-cols-32 (десктоп): очень мелкие квадраты.
         - gap-px: тончайший разделитель.
         - animate-pan-diagonal: медленное движение.
      */}
      <div className="w-[300%] grid grid-cols-16 md:grid-cols-32 gap-px animate-pan-diagonal -ml-[50%] -mt-[50%]">
        {gridImages.map((src, index) => (
          <div 
            key={`grid-img-${index}`} 
            className="relative w-full pt-[100%] overflow-hidden bg-[#0a0a0a]"
          >
            <img 
              src={src} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-50 hover:opacity-90 transition-opacity duration-700 ease-in-out"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Затемнение фона для текста */}
      <div className="absolute inset-0 bg-black/60"></div>
    </div>
  );
};

export default InfiniteGridBackground;