// components/ConfiguratorPanel.tsx
import React from 'react';
import { ArrowRight, ChevronLeft, Settings2, Upload } from 'lucide-react';
import { Option, ConfigCategory } from '../types'; 

interface ConfiguratorPanelProps {
  isMobile: boolean;
  config: Record<string, Option>;
  openCategory: string | null;
  customFile: File | null;
  configOptions: ConfigCategory[];
  toggleCategory: (id: string) => void;
  handleSelect: (categoryId: string, option: Option) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  calculateTotal: () => number;
  getOrderLink: () => string;
}

const ConfiguratorPanel: React.FC<ConfiguratorPanelProps> = ({
  isMobile,
  config,
  openCategory,
  customFile,
  configOptions,
  toggleCategory,
  handleSelect,
  handleFileChange,
  calculateTotal,
  getOrderLink,
}) => {
  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-6 border-b border-white/10 flex-shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings2 size={20} className="text-orange-500" />
            Конфигуратор
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-wider">Соберите свой bbqp</p>
        </div>
        {!isMobile && (
          <div className="text-right">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Итого</div>
            <div className="text-xl font-bold text-white">{calculateTotal().toLocaleString()} ₽</div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {configOptions.map((category) => (
          <div key={category.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:bg-white/10 group backdrop-blur-sm">
            <button onClick={() => toggleCategory(category.id)} className="w-full flex items-center justify-between p-4 text-left transition-colors">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-gray-300 group-hover:text-white transition-colors">{category.name}</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_orange]"></span>
                  <span className="text-[11px] text-gray-500 truncate max-w-[180px]">{config[category.id].label}</span>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 transition-transform duration-300 ${openCategory === category.id ? 'bg-white/10 rotate-180' : 'bg-transparent'}`}>
                <ChevronLeft size={16} className="-rotate-90 text-gray-400" />
              </div>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openCategory === category.id ? 'max-h-[300px]' : 'max-h-0'}`}>
              <div className="p-4 pt-0">
                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-white/10">
                  {category.options.map((opt) => {
                    const isSelected = config[category.id].value === opt.value;
                    const isDisabled = opt.disabled;
                    return (
                      <button 
                        key={opt.value} 
                        onClick={() => handleSelect(category.id, opt)} 
                        disabled={isDisabled}
                        className={`relative flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all duration-200 border 
                            ${isSelected 
                                ? 'bg-orange-600/20 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.2)]' 
                                : isDisabled 
                                    ? 'bg-white/5 border-white/5 text-gray-600 cursor-not-allowed'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                      >
                        <span className="z-10">{opt.label}</span>
                        {opt.price > 0 && !isDisabled && <span className={`z-10 ${isSelected ? 'text-orange-200' : 'text-gray-500'}`}>+{opt.price.toLocaleString()} ₽</span>}
                      </button>
                    );
                  })}
                </div>
                {category.id === 'engraving' && config.engraving.value === 'custom' && (
                  <div className="mt-3 pt-3 border-t border-white/10 animate-fade-in">
                    <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-gray-400">Ваш эскиз</label>
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 text-gray-400 px-4 py-3 rounded-xl text-xs font-bold transition-all border-dashed">
                        <Upload size={14} className="text-orange-500" />
                        <span>{customFile ? 'Файл выбран' : 'Загрузить файл'}</span>
                        <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 border-t border-white/10 bg-black/40 backdrop-blur-md flex-shrink-0">
        <div className={`flex justify-between items-end mb-4 ${!isMobile ? 'lg:hidden' : ''}`}>
          <span className="text-sm text-gray-500 font-medium">Итого:</span>
          <span className="text-2xl font-bold tracking-tight text-white">{calculateTotal().toLocaleString()} ₽</span>
        </div>
        <a href={getOrderLink()} target="_blank" rel="noopener noreferrer" className="group w-full bg-orange-600 text-white py-4 rounded-xl text-sm font-bold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(234,88,12,0.4)] active:scale-[0.98]">
          <span>Оформить заказ</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default ConfiguratorPanel;