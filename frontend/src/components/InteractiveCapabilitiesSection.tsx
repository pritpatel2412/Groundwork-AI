import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Layers,
  FileCheck,
  Layout,
  Database,
  Cpu,
  Bot,
  Activity,
  Radio,
  Clock,
  Play
} from 'lucide-react';
import { WCharText } from './WCharText';

export const InteractiveCapabilitiesSection: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState(4); // default top layer (Layer 05)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);

  // Simulated live pulse for benchmark bars
  const [pulseTime, setPulseTime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTime((prev) => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateAudit = () => {
    setIsAuditing(true);
    setAuditSuccess(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccess(true);
      setTimeout(() => setAuditSuccess(false), 3000);
    }, 1000);
  };

  const layers = [
    { id: 1, name: 'LAYER 01', title: 'Neural Document & Audio Ingestion', icon: Radio, tag: 'SOP + Sarvam STT' },
    { id: 2, name: 'LAYER 02', title: 'Cite-or-Abstain Chunk Extraction', icon: FileCheck, tag: 'Zero Hallucination' },
    { id: 3, name: 'LAYER 03', title: 'Dual-Model Truth Audit Matrix', icon: ShieldCheck, tag: 'NVIDIA NIM' },
    { id: 4, name: 'LAYER 04', title: 'Synthesized Wireframe Canvas', icon: Layout, tag: 'Journey Mapped' },
    { id: 5, name: 'LAYER 05', title: 'Full Blueprint Export Bundle', icon: Layers, tag: 'Mermaid + OpenAPI' },
  ];

  const bars = [
    { label: 'Discovery', baseH: 28, manual: '4 days', automated: '12 mins', color: 'from-white/20 to-white/40' },
    { label: 'Audit', baseH: 42, manual: '1.5 weeks', automated: '35 secs', color: 'from-white/30 to-white/60' },
    { label: 'Arch', baseH: 60, manual: '2 weeks', automated: '1.8 mins', color: 'from-[#F05A3C] to-[#E34A32]' },
    { label: 'Verify', baseH: 78, manual: '5 days', automated: '45 secs', color: 'from-[#E34A32] to-[#FF4520]' },
    { label: 'Commit', baseH: 92, manual: '3 weeks', automated: 'Instant Verified', color: 'from-white via-[#E34A32] to-white' },
  ];

  return (
    <section id="capabilities" className="mb-16 sm:mb-24">
      <div className="rounded-[28px] sm:rounded-[40px] bg-[#171719] text-white p-8 sm:p-14 shadow-2xl border border-white/5 relative overflow-hidden">
        
        {/* Subtle Ambient Radial Light Bloom */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,_rgba(227,74,50,0.12)_0%,_transparent_70%)] pointer-events-none blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(240,90,60,0.08)_0%,_transparent_70%)] pointer-events-none blur-3xl" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E34A32]/20 text-[#E34A32] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E34A32] animate-pulse" />
              <span>03 • DUAL-MODEL CAPABILITIES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-white leading-tight">
              <WCharText text="Architecture built for " />
              <span className="font-serif-accent italic font-normal text-[#E34A32]">rigor.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60 max-w-sm mt-3 sm:mt-0 font-sans leading-relaxed">
            Generators formulate hypotheses; independent verifiers audit every citation against source chunks.
          </p>
        </div>

        {/* 3-Column Bento Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Interactive Multi-Layer Stack */}
          <div className="p-8 rounded-[24px] bg-[#202024] border border-white/5 flex flex-col justify-between min-h-[440px] relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E34A32]/20 text-[#E34A32] text-[10px] font-mono font-bold">
                  DEMO DAY READY
                </span>
                <span className="text-[10px] font-mono text-white/50">5 SYNTHESIZED LAYERS</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Multi-Layer Stack
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Hover or click layers to inspect interconnected artifacts synthesized in parallel:
              </p>
            </div>

            {/* Interactive Fanning Card Stack */}
            <div className="relative h-60 mt-4 flex items-center justify-center">
              {layers.map((layer, idx) => {
                const isSelected = activeLayer === idx;
                const Icon = layer.icon;

                // Subtle fanning angle offsets
                const rotations = [-8, -4, 0, 4, 8];
                const yOffsets = [16, 8, 0, -8, -16];
                const baseRotate = rotations[idx];
                const baseY = yOffsets[idx];

                return (
                  <div
                    key={layer.id}
                    onClick={() => setActiveLayer(idx)}
                    onMouseEnter={() => setActiveLayer(idx)}
                    style={{
                      transform: isSelected
                        ? `translateY(-26px) scale(1.04) rotate(0deg)`
                        : `translateY(${baseY}px) rotate(${baseRotate}deg)`,
                      zIndex: isSelected ? 30 : idx + 1,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    className={`absolute w-[270px] sm:w-[300px] p-3.5 rounded-2xl border cursor-pointer select-none shadow-xl ${
                      isSelected
                        ? 'bg-[#2A2B30] border-[#E34A32] shadow-[0_16px_36px_-10px_rgba(227,74,50,0.3)] ring-1 ring-[#E34A32]/50'
                        : 'bg-[#1C1D21] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E34A32]' : 'text-white/60'}`} strokeWidth={1.5} />
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>
                          {layer.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 text-white/70">
                        {layer.tag}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {layer.title}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50">
              <span className="font-mono">Active: {layers[activeLayer].name}</span>
              <span className="text-[#E34A32] font-semibold flex items-center gap-1">
                Verified Invariant <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
              </span>
            </div>
          </div>

          {/* Card 2: Interactive 10x Velocity Wave & Benchmark */}
          <div className="p-8 rounded-[24px] bg-[#202024] border border-white/5 flex flex-col justify-between min-h-[440px] relative overflow-hidden group hover:border-white/10 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white/80 text-[10px] font-mono font-bold">
                  SPEED BENCHMARKS
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">● 10X ADVANTAGE</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                10x Velocity Advantage
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                Automated extraction vs traditional manual consulting cycles. Hover bars to inspect time comparison:
              </p>
            </div>

            {/* Dynamic Animated Bars with Interactive Tooltips */}
            <div className="pt-6 pb-2">
              {/* Floating Tooltip displaying exact savings */}
              <div className="h-9 flex items-center justify-center mb-3">
                {hoveredBar !== null ? (
                  <div className="px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white flex items-center gap-2 animate-in fade-in duration-150 shadow-lg">
                    <span className="text-[#E34A32] font-bold">{bars[hoveredBar].label}:</span>
                    <span>{bars[hoveredBar].automated}</span>
                    <span className="text-white/40">vs {bars[hoveredBar].manual} manual</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-mono text-white/40 italic">
                    Hover any sprint stage below
                  </span>
                )}
              </div>

              {/* Vertical Bars Container */}
              <div className="flex items-end justify-between gap-3 h-44 px-3 bg-white/[0.02] rounded-2xl p-4 border border-white/5">
                {bars.map((bar, i) => {
                  const isHovered = hoveredBar === i;
                  // Dynamic subtle breathing animation
                  const waveMod = Math.sin(pulseTime + i * 1.2) * 3;
                  const currentHeight = Math.min(Math.max(bar.baseH + waveMod, 20), 100);

                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredBar(i)}
                      onMouseLeave={() => setHoveredBar(null)}
                      className="flex-1 flex flex-col items-center gap-2.5 cursor-pointer group/bar h-full justify-end"
                    >
                      <div className="w-full relative flex items-end justify-center h-36">
                        <div
                          style={{ height: `${currentHeight}%` }}
                          className={`w-full rounded-full transition-all duration-200 bg-gradient-to-t ${bar.color} ${
                            isHovered
                              ? 'scale-x-110 ring-2 ring-white shadow-[0_0_20px_rgba(227,74,50,0.5)]'
                              : 'opacity-85 hover:opacity-100'
                          }`}
                        />
                      </div>
                      <span className={`text-[10px] font-mono tracking-tight transition-colors ${
                        isHovered ? 'text-white font-bold' : 'text-white/50'
                      }`}>
                        {bar.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/50 font-mono">
              <span>Delivery Time: 14 Days</span>
              <span className="text-white font-bold">vs 12-16 Weeks Manual</span>
            </div>
          </div>

          {/* Card 3: Zero Self-Grading & Adversarial Audit Pipeline */}
          <div className="p-8 rounded-[24px] bg-[#202024] border border-white/5 flex flex-col justify-between min-h-[440px] relative overflow-hidden group hover:border-white/10 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                  SEPARATE CONTEXT
                </span>
                <span className="text-[10px] font-mono text-[#E34A32] font-bold">ADVERSARIAL AUDIT</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                Zero Self-Grading
              </h3>
              <p className="text-xs text-white/60 leading-relaxed font-sans">
                The Verifier never sees the generator's internal reasoning—only the raw claims and retrieved evidence chunks.
              </p>
            </div>

            {/* Interactive Model Architecture Cards */}
            <div className="space-y-3 my-4">
              {/* Model 1: Generator */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between hover:border-white/15 transition-all">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                    <Cpu className="w-4 h-4 text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-white/50 block">HYPOTHESIS GENERATOR</span>
                    <span className="text-xs font-bold text-white font-mono">Groq Llama-70B</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  18ms • 70 tok/s
                </span>
              </div>

              {/* Zero-Knowledge Barrier Pill */}
              <div className="relative py-1 flex items-center justify-center">
                <div className="w-full h-px bg-white/10" />
                <span className="absolute px-3 py-0.5 rounded-full bg-[#171719] border border-white/10 text-[9px] font-mono text-[#E34A32] uppercase">
                  Zero-Knowledge Isolation Wall
                </span>
              </div>

              {/* Model 2: Auditor */}
              <div className="p-3.5 rounded-xl bg-[#E34A32]/10 border border-[#E34A32]/25 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#E34A32]/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#E34A32] block font-bold">INDEPENDENT VERIFIER</span>
                    <span className="text-xs font-bold text-white font-mono">NVIDIA NIM Nemotron</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#E34A32] bg-[#E34A32]/20 px-2 py-0.5 rounded-full border border-[#E34A32]/30 font-bold">
                  Strict Fact-Audit
                </span>
              </div>
            </div>

            {/* Interactive Audit Simulation Button */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={handleSimulateAudit}
                disabled={isAuditing}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer border border-white/10 hover:border-white/20 active:scale-98"
              >
                {isAuditing ? (
                  <>
                    <Activity className="w-3.5 h-3.5 text-[#E34A32] animate-spin" strokeWidth={1.5} />
                    <span>Verifying Adversarial Claims...</span>
                  </>
                ) : auditSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
                    <span className="text-emerald-300">0x Contradictions • 100% Grounded</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-[#E34A32] fill-current" strokeWidth={1.5} />
                    <span>Test Adversarial Verification Gate</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
