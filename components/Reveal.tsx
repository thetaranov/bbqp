import React from 'react';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Оставили для совместимости пропсов, но не используем
  threshold?: number;
}

const Reveal: React.FC<RevealProps> = ({ 
  children, 
  className = ""
}) => {
  // Мы убрали Observer и анимацию появления для оптимизации
  return (
    <div className={`${className} opacity-100 translate-y-0`}>
      {children}
    </div>
  );
};

export default Reveal;