import React from 'react';
import { Flame, Wind, ChevronRight } from 'lucide-react';
import Reveal from './Reveal';
import ParticlesOverlay from './ParticlesOverlay';

interface FeaturesSectionProps {
  isActive?: boolean;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ isActive = false }) => {
  return (
    <section className="relative w-full min-h-[100dvh] bg-black text-white overflow-hidden flex items-center">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Левая колонка - изображение */}
          <div className="order-2 lg:order-1">
            <div className="relative w-full max-w-[600px] mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent rounded-3xl blur-3xl"></div>
              <img 
                src="/assets/images/partition-mechanism.png" 
                alt="Grill Partition Mechanism" 
                className="relative z-10 w-full h-auto object-contain p-4"
                loading="lazy"
              />
            </div>
          </div>

          {/* Правая колонка - текст */}
          <div className="order-1 lg:order-2">
            <Reveal>
              <div className="mb-8">
                <span className="inline-block px-4 py-2 bg-orange-500/10 text-orange-400 rounded-full text-sm font-bold mb-4 border border-orange-500/20">
                  ИННОВАЦИЯ
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-white leading-tight">
                  Перегородка,<br />которая меняет всё
                </h2>
                <div className="text-gray-300 text-lg leading-relaxed mb-8">
                  <p className="mb-4">
                    Больше не нужно раздувать угли и тушить вспышки огня водой. 
                    Загрузите дрова в режиме «Печь», следите за термометром и одним движением 
                    переключите перегородку в режим «Мангал».
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="space-y-6 max-w-lg">
                <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm hover:border-orange-500/30">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10">
                      <Flame size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Режим печи</h3>
                      <p className="text-gray-400">Мощная тяга. От плова до кипятка.</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-sm hover:border-blue-500/30">
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
                      <Wind size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Режим мангала</h3>
                      <p className="text-gray-400">Рассеянное тепло. Идеально для шампуров.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      <ParticlesOverlay active={isActive} />
    </section>
  );
};

export default FeaturesSection;