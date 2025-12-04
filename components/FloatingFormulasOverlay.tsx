// components/FloatingFormulasOverlay.tsx

import React, { useState, useMemo } from 'react';

const PHYSICS_FORMULAS = [ "Q = c·m·Δt", "C + O₂ → CO₂ + Q", "F = m·g", "P + ρv²/2 = const", "PV = nRT", "Q = q·m", "v = √(2ΔP/ρ)", "ΔU = Q - W", "Q = L·m", "Q = r·m", "η = 1 - T₂/T₁", "dQ = dU + pdV" ];

const FloatingFormula: React.FC<{ item: any, pool: string[] }> = ({ item, pool }) => {
  const [text, setText] = useState(item.formula);
  return (
     <div
        className="absolute font-scientific font-bold text-gray-800 select-none whitespace-nowrap pointer-events-none opacity-0"
        style={{
          left: `${item.left}%`, top: `${item.top}%`, fontSize: `${1.0 + (item.scale * 0.4)}rem`, filter: `blur(${item.blur}px)`,
          '--scale': item.scale, '--max-opacity': item.opacity, animation: `comet-move ${item.duration}s linear infinite`, animationDelay: `${item.delay}s`,
        } as React.CSSProperties}
        onAnimationIteration={() => { setText(pool[Math.floor(Math.random() * pool.length)]); }}
     > {text} </div>
  );
};

const FloatingFormulasOverlay = () => {
  const formulaData = useMemo(() => {
    const pos: any[] = [];
    const usedRects: {l: number, t: number, w: number, h: number}[] = [];
    const shuffledFormulas = [...PHYSICS_FORMULAS].sort(() => 0.5 - Math.random());
    for (let i = 0; i < 16; i++) {
        let placed = false, attempts = 0;
        while (!placed && attempts < 2000) {
            const l = Math.random() * 95, t = Math.random() * 95;
            const overlap = usedRects.some(r => l < r.l + 22 && l + 22 > r.l && t < r.t + 14 && t + 14 > r.t);
            const imageOverlap = (l > 70 && t > 20 && t < 80);
            if (!overlap && !imageOverlap) {
                const scale = 0.5 + Math.random() * 1.0;
                let blur = 0; 
                if (scale > 1.2) blur = (scale - 1.2) * 1.5;
                if (l < 45 && t > 20 && t < 75) blur += 1.5;
                pos.push({ left: l, top: t, duration: 6 + (Math.random() * 8), delay: -Math.random() * 10, scale, blur, opacity: scale > 1.2 ? 0.35 : 0.5, formula: shuffledFormulas[i % shuffledFormulas.length] });
                usedRects.push({l, t, w: 22, h: 14});
                placed = true;
            }
            attempts++;
        }
    }
    return pos;
  }, []);

  return (
    <>
      <style>{`@keyframes comet-move { 0% { opacity: 0; transform: translate(-100px, -100px) scale(var(--scale)); } 15% { opacity: var(--max-opacity); } 85% { opacity: var(--max-opacity); } 100% { opacity: 0; transform: translate(350px, 350px) scale(var(--scale)); } }`}</style>
      {formulaData.map((item, i) => <FloatingFormula key={i} item={item} pool={PHYSICS_FORMULAS} />)}
    </>
  );
};

export default FloatingFormulasOverlay;