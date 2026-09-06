import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

interface PillData {
  value: number;
  suffix: string;
  prefix?: string;
  unit: string;
  label: string;
  subtext: string;
  badge: string;
  tilt: string;
  hoverTilt: string;
}

export const InteractiveProofSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);

  // IntersectionObserver to trigger counting animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animated counters
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setCount1(Math.round(ease * 14));
      setCount2(Math.round(ease * 100));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [isVisible]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setMousePos({ x: x * 0.08, y: y * 0.08 });
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section ref={sectionRef} className="mb-16 sm:mb-24 px-2 sm:px-4">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E34A32]/10 text-[#E34A32] text-xs font-mono font-semibold uppercase tracking-wider mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E34A32] animate-pulse" />
          <span>02 • MEASURED IMPACT</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#232427]">
          Engineered for velocity and verification.
        </h2>
      </div>

      {/* 3 oversized rounded-full pills in a row with continuous overlapping -space-x-6 on desktop */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-5 lg:gap-0 lg:-space-x-6 max-w-5xl mx-auto">
        
        {/* Pill 1: 14 Days */}
        <div
          onMouseMove={(e) => handleMouseMove(e, 0)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform:
              hoveredIdx === 0
                ? `translate3d(${mousePos.x}px, ${mousePos.y - 8}px, 0) rotate(0deg) scale(1.03)`
                : `rotate(-1.2deg)`,
            transition: hoveredIdx === 0 ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          }}
          className={`w-full lg:w-[360px] px-8 sm:px-10 py-7 rounded-full bg-white border transition-all duration-300 relative group cursor-pointer ${
            hoveredIdx === 0
              ? 'z-30 border-[#E34A32]/50 shadow-[0_24px_50px_-15px_rgba(227,74,50,0.22),0_1px_0_rgba(255,255,255,1)_inset]'
              : 'z-10 border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_36px_-16px_rgba(35,36,39,0.12)]'
          }`}
        >
          {/* Subtle Ambient Radial Highlight on Hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#E34A32]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="text-4xl sm:text-5xl font-black font-sans text-[#2E3034] tracking-tight">
              {isVisible ? count1 : 14}
            </div>

            <div className="text-left flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#E34A32] leading-none font-sans">
                  days
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  ⚡ 10X
                </span>
              </div>
              <span className="text-xs text-[#55575c] font-medium font-sans block mt-1">
                average sprint to tested MVP
              </span>
            </div>
          </div>
        </div>

        {/* Pill 2: 100+ Demos (Elevated Center) */}
        <div
          onMouseMove={(e) => handleMouseMove(e, 1)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform:
              hoveredIdx === 1
                ? `translate3d(${mousePos.x}px, ${mousePos.y - 10}px, 0) scale(1.05)`
                : `translateY(-2px) rotate(0deg)`,
            transition: hoveredIdx === 1 ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          }}
          className={`w-full lg:w-[380px] px-8 sm:px-10 py-7 rounded-full bg-white border transition-all duration-300 relative group cursor-pointer ${
            hoveredIdx === 1
              ? 'z-40 border-[#E34A32] shadow-[0_28px_60px_-15px_rgba(227,74,50,0.25),0_1px_0_rgba(255,255,255,1)_inset]'
              : 'z-20 border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_42px_-16px_rgba(35,36,39,0.16)]'
          }`}
        >
          {/* Subtle Ambient Radial Highlight on Hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#E34A32]/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="text-4xl sm:text-5xl font-black font-sans text-[#2E3034] tracking-tight flex items-center">
              <span>{isVisible ? count2 : 100}</span>
              <span className="text-[#E34A32] text-3xl font-bold -ml-0.5">+</span>
            </div>

            <div className="text-left flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#E34A32] leading-none font-sans">
                  demos
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] font-semibold border border-[#E34A32]/20">
                  SHIPPED
                </span>
              </div>
              <span className="text-xs text-[#55575c] font-medium font-sans block mt-1">
                deployed across enterprise ops
              </span>
            </div>
          </div>
        </div>

        {/* Pill 3: 0x Hallucination */}
        <div
          onMouseMove={(e) => handleMouseMove(e, 2)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform:
              hoveredIdx === 2
                ? `translate3d(${mousePos.x}px, ${mousePos.y - 8}px, 0) rotate(0deg) scale(1.03)`
                : `rotate(1.2deg)`,
            transition: hoveredIdx === 2 ? 'transform 0.1s ease-out' : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
          }}
          className={`w-full lg:w-[370px] px-8 sm:px-10 py-7 rounded-full bg-white border transition-all duration-300 relative group cursor-pointer ${
            hoveredIdx === 2
              ? 'z-30 border-[#E34A32]/50 shadow-[0_24px_50px_-15px_rgba(227,74,50,0.22),0_1px_0_rgba(255,255,255,1)_inset]'
              : 'z-10 border-black/10 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_36px_-16px_rgba(35,36,39,0.12)]'
          }`}
        >
          {/* Subtle Ambient Radial Highlight on Hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-[#E34A32]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="text-4xl sm:text-5xl font-black font-sans text-[#2E3034] tracking-tight">
              0x
            </div>

            <div className="text-left flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-[#E34A32] leading-none font-sans">
                  hallucination
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 font-semibold border border-cyan-200">
                  AUDITED
                </span>
              </div>
              <span className="text-xs text-[#55575c] font-medium font-sans block mt-1">
                strict cite-or-abstain ledger
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
