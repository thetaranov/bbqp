import React from 'react';
import { FileText } from 'lucide-react';
import Reveal from './Reveal';

interface FooterProps {
  setRef: (el: HTMLDivElement | null) => void;
  onPrivacyOpen: () => void;
  onTermsOpen: () => void;
}

const SiteFooter: React.FC<FooterProps> = ({ setRef, onPrivacyOpen, onTermsOpen }) => {

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: black; }
          #canvas-container { width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div data-us-project="OzI2W3RpiS8R2jyvFcSM" style="width:100%; height: 100%"></div>
        <script src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.2/dist/unicornStudio.umd.js"></script>
        <script>
          window.onload = function() {
            if (window.UnicornStudio) {
              window.UnicornStudio.init();
            }
          };
        </script>
      </body>
    </html>
  `;

  return (
    <footer id="contact" ref={setRef} className="snap-section h-[100svh] relative overflow-hidden flex flex-col justify-center items-center">

      <div className="absolute top-0 left-0 w-full h-[118%] z-0">
         <iframe
            title="footer-background"
            srcDoc={iframeContent}
            className="w-full h-full border-0"
            style={{ pointerEvents: 'auto' }}
            loading="lazy"
         />
      </div>

      <div className="absolute inset-0 z-[1] bg-black/40 pointer-events-none"></div>

      <div className="relative z-10 w-full pointer-events-none">
        <Reveal className="w-full max-w-4xl mx-auto px-6 text-center pointer-events-auto">
          <div className="mb-6">
            <div className="text-3xl md:text-5xl font-bold tracking-tighter mb-2 text-white drop-shadow-2xl">bbqp</div>
            <p className="text-sm text-gray-300 font-medium mb-6 drop-shadow-md">Инновации в искусстве приготовления.</p>

            <div className="mb-6 text-left text-sm text-gray-200 bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
              <div className="mb-4">
                <h3 className="font-bold text-white mb-2 text-base">Официальный дистрибьютор в РФ (продажи и гарантия)</h3>
                <p className="mb-1">ООО «АТТА»</p>
                <p className="mb-1">445043, г. Тольятти, ул. Коммунальная, д. 37А</p>
                <p>Электронная почта: <a href="mailto:st@atta-k.ru" className="text-orange-500 hover:text-orange-400 transition-colors">st@atta-k.ru</a></p>
              </div>
              <div>
                <h3 className="font-bold text-white mb-2 text-base">Уполномоченный представитель в РФ (запросы и предложения)</h3>
                <p className="mb-1">Юридический отдел ТСЦ АО «САМТЕК»</p>
                <p className="mb-1">445027, г. Тольятти, а/я 3147</p>
                <p className="mb-1">Электронная почта: <a href="mailto:info@sam-tech.ru" className="text-orange-500 hover:text-orange-400 transition-colors">info@sam-tech.ru</a></p>
                <p>Бесплатная линия для регионов РФ: <span className="font-bold text-white">8 800 7000 994</span></p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 mt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
            <p>© 2025 bbqp. Все права защищены.</p>

            <div className="flex flex-wrap justify-center gap-6 items-center">
              <button onClick={onPrivacyOpen} className="hover:text-white transition-colors">Конфиденциальность</button>
              <button onClick={onTermsOpen} className="hover:text-white transition-colors">Условия</button>

              <a href="/assets/docs/MANUAL.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <FileText size={12} /> Руководство
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
};

export default SiteFooter;