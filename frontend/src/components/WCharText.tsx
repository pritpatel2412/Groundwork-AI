import React, { useEffect, useRef } from 'react';

interface WCharTextProps {
  text: string;
  className?: string;
  serifAccentIndices?: number[]; // indices of words or custom serif span
  serifAccentWords?: string[];   // words that should have .font-serif-accent
}

export const WCharText: React.FC<WCharTextProps> = ({
  text,
  className = '',
  serifAccentWords = [],
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll<HTMLElement>('.wchar');
    if (chars.length === 0) return;

    let rafId: number | null = null;

    const handlePointerMove = (e: PointerEvent | MouseEvent) => {
      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        rafId = null;
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        chars.forEach((charEl) => {
          const rect = charEl.getBoundingClientRect();
          const charCenterX = rect.left + rect.width / 2;
          const charCenterY = rect.top + rect.height / 2;
          const dist = Math.hypot(mouseX - charCenterX, mouseY - charCenterY);

          // Weight formula from design doc: d < 200 ? 600 + (1 - d/200) * 300 : 600
          if (dist < 200) {
            const weight = Math.round(600 + (1 - dist / 200) * 300);
            charEl.style.fontVariationSettings = `'wght' ${weight}`;
          } else {
            charEl.style.fontVariationSettings = `'wght' 600`;
          }
        });
      });
    };

    const handlePointerLeave = () => {
      chars.forEach((charEl) => {
        charEl.style.fontVariationSettings = `'wght' 600`;
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [text]);

  const words = text.split(' ');

  return (
    <span ref={containerRef} className={className}>
      {words.map((word, wIdx) => {
        const isSerif = serifAccentWords.some(
          (sw) => sw.toLowerCase() === word.replace(/[^a-zA-Z]/g, '').toLowerCase()
        );

        return (
          <span
            key={wIdx}
            className={`inline-block whitespace-nowrap ${isSerif ? 'font-serif-accent font-normal italic' : ''}`}
          >
            {word.split('').map((char, cIdx) => (
              <span key={cIdx} className="wchar">
                {char}
              </span>
            ))}
            {wIdx < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        );
      })}
    </span>
  );
};
