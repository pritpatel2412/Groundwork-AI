import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Zap,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  Menu,
  X,
  Play,
  Clock,
  ShieldCheck,
  ChevronRight,
  Terminal,
  Database,
  BarChart3,
  Bot
} from 'lucide-react';
import { ThreeMeshCanvas } from './ThreeMeshCanvas';
import { WCharText } from './WCharText';
import { InteractiveProofSection } from './InteractiveProofSection';
import { InteractiveCapabilitiesSection } from './InteractiveCapabilitiesSection';

interface SprintForgeLandingProps {
  onOpenCopilot: () => void;
}

export const SprintForgeLanding: React.FC<SprintForgeLandingProps> = ({ onOpenCopilot }) => {
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bloomOffset, setBloomOffset] = useState({ x: 0, y: 0 });
  const [driftOffset, setDriftOffset] = useState([0, 0, 0]);
  const [emailInput, setEmailInput] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState(false);

  // Scroll listener for Nav shadow (scrollY > 24)
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloom Parallax on pointer move
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 35;
      const y = (e.clientY / window.innerHeight - 0.5) * 35;
      setBloomOffset({ x, y });
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, []);

  // Hero Drift animation: three-tile stack with translateY oscillation using Math.sin(t + i * 2) * 6
  useEffect(() => {
    let animId: number;
    let t = 0;
    const loop = () => {
      t += 0.035;
      setDriftOffset([
        Math.sin(t + 0 * 2) * 6,
        Math.sin(t + 1 * 2) * 6,
        Math.sin(t + 2 * 2) * 6,
      ]);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // IntersectionObserver for [data-rise] and [data-reveal]
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('[data-rise], [data-reveal]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setSubmittedEmail(true);
    setTimeout(() => {
      onOpenCopilot();
    }, 600);
  };

  return (
    <div className="bg-[#ECEDEE] text-[#232427] font-sans antialiased min-h-screen py-3 sm:py-5 px-3 sm:px-6">
      {/* 1440px Wrapper */}
      <div className="max-w-[1440px] mx-auto">

        {/* SECTION 1 - HERO SHELL */}
        <section className="relative bg-[#F4F5F5] rounded-[28px] sm:rounded-[40px] min-h-[920px] sm:min-h-[96svh] pb-24 sm:pb-28 flex flex-col justify-between overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] mb-6 sm:mb-8">
          
          {/* Layer 0 (Background): #meshGL canvas, absolute inset-0 */}
          <ThreeMeshCanvas />

          {/* Layer 1 (Bloom): Radiant soft warm coral glow */}
          <div
            id="bloom"
            style={{
              transform: `translate3d(${bloomOffset.x}px, ${bloomOffset.y}px, 0)`,
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="absolute -right-24 top-4 w-[640px] h-[640px] rounded-full pointer-events-none blur-3xl z-0"
          >
            <div className="w-full h-full rounded-full bg-[radial-gradient(circle,_rgba(240,90,60,0.22)_0%,_rgba(227,74,50,0.1)_45%,_transparent_70%)]" />
          </div>

          {/* Layer 2 (Atmosphere): Left and bottom radial-gradient blur circles */}
          <div className="absolute -left-32 top-1/4 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,_rgba(240,90,60,0.14)_0%,_transparent_65%)] pointer-events-none blur-3xl z-0" />
          <div className="absolute -bottom-32 left-1/3 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,_rgba(227,74,50,0.12)_0%,_transparent_65%)] pointer-events-none blur-3xl z-0" />

          {/* Layer 3 (Nav): sticky top-3 sm:top-5, z-50 */}
          <nav
            className={`sticky top-3 sm:top-5 z-50 mx-4 sm:mx-8 px-5 py-3 rounded-full transition-all duration-300 flex items-center justify-between ${
              navScrolled
                ? 'bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(35,36,39,0.12),0_1px_0_rgba(255,255,255,0.9)_inset] border border-white/60'
                : 'bg-transparent'
            }`}
          >
            {/* Brand Logo: Overlapping minimalist circles + Groundwork AI */}
            <div className="flex items-center gap-3">
              <div className="relative flex items-center h-6 w-7">
                <span className="w-4 h-4 rounded-full bg-[#232427] block shadow-xs" />
                <span className="w-4 h-4 rounded-full bg-[#E34A32] block -ml-2 shadow-xs" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base sm:text-lg text-[#232427]">
                  Groundwork
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#E34A32]/10 text-[#E34A32] border border-[#E34A32]/25">
                  AI
                </span>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-7 text-xs font-medium text-[#55575c]">
              <a href="#services" className="hover:text-[#232427] transition">Services</a>
              <a href="#capabilities" className="hover:text-[#232427] transition">Capabilities</a>
              <a href="#work" className="hover:text-[#232427] transition">Case Studies</a>
              <a href="#packages" className="hover:text-[#232427] transition">Packages</a>
              <a href="#studio" className="hover:text-[#232427] transition">Studio</a>
            </div>

            {/* Nav CTA Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenCopilot}
                className="px-4 py-2 rounded-full bg-[#232427] hover:bg-[#171719] text-white text-xs font-semibold tracking-tight transition flex items-center gap-1.5 shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E34A32]" strokeWidth={1.5} />
                <span>Open Copilot</span>
              </button>

              <button
                id="menuBtn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full bg-white/70 border border-black/5 text-[#232427] cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Menu className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>
          </nav>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div
              id="mobileMenu"
              className="md:hidden absolute top-20 left-4 right-4 z-40 p-5 rounded-2xl bg-white/95 backdrop-blur-2xl shadow-xl border border-black/5 flex flex-col gap-3 text-sm font-medium"
            >
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#55575c] hover:text-[#232427]">Services</a>
              <a href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#55575c] hover:text-[#232427]">Capabilities</a>
              <a href="#work" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#55575c] hover:text-[#232427]">Case Studies</a>
              <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#55575c] hover:text-[#232427]">Packages</a>
              <a href="#studio" onClick={() => setMobileMenuOpen(false)} className="py-1 text-[#55575c] hover:text-[#232427]">Studio</a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCopilot();
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-[#E34A32] text-white font-semibold text-xs flex items-center justify-center gap-2"
              >
                <span>Launch Groundwork Copilot</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* Layer 4 (Hero Content): relative z-10, flex-1 justify-center */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-8 py-12 sm:py-20 max-w-5xl mx-auto">
            
            {/* Top Pill Badge */}
            <div
              data-rise
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 border border-white/80 text-xs font-semibold text-[#2E3034] mb-8 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_12px_rgba(0,0,0,0.04)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#E34A32] animate-pulse" />
              <span>Evidence-Grounded AI Studio</span>
              <span className="text-black/30 font-mono text-[10px]">•</span>
              <span className="text-[#E34A32] font-semibold">Weeks, Not Quarters</span>
            </div>

            {/* Headline: "Ship AI products in weeks" */}
            <h1
              data-rise
              className="text-5xl sm:text-7xl lg:text-8xl font-medium tracking-tight text-[#232427] leading-[1.02] mb-6 relative"
            >
              <WCharText text="Ship AI" /> <br className="hidden sm:block" />
              <span className="relative inline-block">
                <WCharText text="products in weeks" serifAccentWords={['weeks']} />
                
                {/* Unique Element: A gradient pill (bg-gradient-to-br from-[#F05A3C] to-[#C93A24]) hidden on mobile, visible on lg absolute to the right of "in weeks" */}
                <span
                  className="hidden lg:inline-flex absolute -right-32 top-3 px-4 py-1.5 rounded-full bg-gradient-to-br from-[#F05A3C] to-[#C93A24] text-white text-xs font-mono font-bold tracking-normal shadow-lg shadow-[#E34A32]/25 items-center gap-1.5 rotate-[-4deg]"
                >
                  <Zap className="w-3 h-3 text-white fill-current" strokeWidth={1.5} />
                  <span>SPEED=10X</span>
                </span>
              </span>
            </h1>

            {/* Subtitle */}
            <p
              data-rise
              className="text-base sm:text-lg text-[#55575c] max-w-xl mx-auto leading-relaxed mb-10 font-normal font-sans"
            >
              Convert messy business blueprints, voice notes, and documents into production-grade systems—every claim cited, verified, and audited.
            </p>

            {/* Hero CTA group */}
            <div data-rise className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <button
                onClick={onOpenCopilot}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white text-sm font-semibold tracking-tight transition flex items-center justify-center gap-2.5 shadow-[0_12px_24px_-8px_rgba(35,36,39,0.3)] cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Copilot Blueprint</span>
                <ArrowRight className="w-4 h-4 text-[#E34A32] group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
              </button>

              <a
                href="#packages"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/80 hover:bg-white text-[#232427] text-sm font-medium tracking-tight border border-black/5 transition shadow-sm flex items-center justify-center gap-2"
              >
                <span>Explore Sprints</span>
                <ArrowUpRight className="w-4 h-4 text-[#55575c]" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Layer 5 (Floating UI): Absolute positioned tiles (data-drift) and preview chip */}
          <div className="hidden xl:block">
            {/* Tile 01 (Left Upper) */}
            <div
              style={{ transform: `translateY(${driftOffset[0]}px)` }}
              className="absolute left-10 top-1/3 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_32px_-12px_rgba(35,36,39,0.12)] max-w-[220px] pointer-events-none z-10"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-[#55575c]">SYS::VERIFIED</span>
              </div>
              <p className="text-xs font-semibold text-[#2E3034]">14-Day Delivery Promise</p>
              <p className="text-[11px] text-[#55575c] mt-0.5">Dual-model architecture</p>
            </div>

            {/* Tile 02 (Left Lower) */}
            <div
              style={{ transform: `translateY(${driftOffset[1]}px)` }}
              className="absolute left-10 bottom-20 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_32px_-12px_rgba(35,36,39,0.12)] max-w-[240px] pointer-events-none z-10"
            >
              <div className="text-[11px] font-mono text-[#E34A32] font-semibold mb-1">
                98.4% GROUNDED
              </div>
              <p className="text-xs text-[#2E3034] font-medium">NVIDIA NIM independent auditor</p>
            </div>

            {/* Tile 03 (Right Preview Chip: bottom-20 right-10) */}
            <div
              style={{ transform: `translateY(${driftOffset[2]}px)` }}
              className="absolute right-10 bottom-20 p-4 rounded-2xl bg-[#171719] text-white shadow-2xl max-w-[260px] pointer-events-auto cursor-pointer border border-white/10 hover:border-[#E34A32]/40 transition z-10 hover:scale-[1.02]"
              onClick={onOpenCopilot}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#E34A32] uppercase">Live Copilot</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h4 className="text-xs font-bold text-white mb-1">Ready to inspect blueprint?</h4>
              <p className="text-[11px] text-white/60 flex items-center gap-1">
                Click to open interactive copilot
                <ArrowRight className="w-3 h-3 text-[#E34A32]" strokeWidth={1.5} />
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2 - SERVICES */}
        <section id="services" className="mb-14 sm:mb-20 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-black/5">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E34A32] block mb-1">
                01 • WHAT WE SHIP
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#232427]">
                <WCharText text="Precision AI systems." serifAccentWords={['systems']} />
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#55575c] max-w-sm mt-2 sm:mt-0 leading-relaxed font-sans">
              Fixed-scope engineering sprints designed to take you from ambiguous spec to demonstrable proof.
            </p>
          </div>

          {/* 3-column grid (lg:grid-cols-3) of white cards with inset shadow */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'AI Workflow Prototype',
                desc: 'End-to-end multi-agent pipeline converting manual business documents into functional execution graphs.',
                shipTime: '2 weeks',
                tag: 'AGENTS'
              },
              {
                title: 'Internal Copilot',
                desc: 'Context-aware enterprise copilots grounded in your private documents, ERP records, and API endpoints.',
                shipTime: '3 weeks',
                tag: 'RAG'
              },
              {
                title: 'Autonomous Verifier',
                desc: 'Independent adversarial evaluator checking every AI claim against raw source chunks with zero hallucinations.',
                shipTime: '2 weeks',
                tag: 'AUDIT'
              },
              {
                title: 'Multimodal Extraction',
                desc: 'Digitize scanned PDFs, handwritten forms, and complex receipts with zero-shot OCR and structured JSON output.',
                shipTime: '2-3 weeks',
                tag: 'VISION'
              },
              {
                title: 'Voice & Speech Intelligence',
                desc: 'High-speed audio-to-text pipeline with multilingual translation across 22 regional dialects via Sarvam AI.',
                shipTime: '2 weeks',
                tag: 'AUDIO'
              },
              {
                title: 'Deterministic Blueprint Engine',
                desc: 'Synthesizes Mermaid solution architectures, ER diagrams, and cost roadmaps guaranteed ready for deployment.',
                shipTime: '3-4 weeks',
                tag: 'ARCHITECTURE'
              },
            ].map((service, idx) => (
              <div
                key={idx}
                data-rise
                className="p-7 rounded-[28px] bg-white text-[#232427] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 cursor-pointer group shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_14px_30px_-18px_rgba(35,36,39,0.25)] border border-black/[0.04]"
                onClick={onOpenCopilot}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#ECEDEE] text-[#55575c]">
                      {service.tag}
                    </span>
                    <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-[#F4F5F5] text-[#2E3034] border border-black/5">
                      {service.shipTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#232427] group-hover:text-[#E34A32] transition mb-2 tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#55575c] leading-relaxed font-sans">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-[#2E3034]">
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-4 h-4 text-[#E34A32] group-hover:translate-x-1.5 transition-transform" strokeWidth={1.5} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 - PROOF (Interactive 3D Tilt Pills with Decelerating Count-up & Overlapping Springs) */}
        <InteractiveProofSection />

        {/* SECTION 4 - CAPABILITIES (Interactive Dark Bento: 3D Fanning Deck, Live Velocity Waves, & Adversarial Simulation) */}
        <InteractiveCapabilitiesSection />

        {/* SECTION 5 - WORK (Case Studies) */}
        <section id="work" className="mb-14 sm:mb-20 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-black/5">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E34A32] block mb-1">
                04 • PRODUCTION WORK
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#232427]">
                <WCharText text="Case studies shipped." serifAccentWords={['shipped']} />
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#55575c] max-w-sm mt-2 sm:mt-0 font-sans">
              Real business transformations evaluated on realistic, difficult, and OCR edge cases.
            </p>
          </div>

          {/* Grid (lg:grid-cols-5): Left 3 columns text, Right 2 columns gradient card abstract representation */}
          <div
            data-rise
            className="rounded-[28px] sm:rounded-[40px] bg-white p-8 sm:p-12 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_40px_-20px_rgba(35,36,39,0.2)] border border-black/[0.04] grid grid-cols-1 lg:grid-cols-5 gap-8 items-center"
          >
            {/* Left 3 columns */}
            <div className="lg:col-span-3 space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#E34A32]/10 text-[#E34A32] font-bold">
                  CASE 01 • PROCUREMENT
                </span>
                <span className="text-xs text-[#55575c] font-mono">14-Day Delivery</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#232427]">
                Global Supply Chain & Vendor Approval System
              </h3>

              <p className="text-sm text-[#55575c] leading-relaxed font-sans">
                Transformed 68 pages of unstructured vendor agreements, voice recordings, and contradictory threshold memos into a validated microservice architecture with complete OpenAPI specs and interactive wireframes.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="text-2xl font-bold text-[#2E3034] font-mono">100%</div>
                  <p className="text-[11px] text-[#55575c]">Rules Grounded</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#E34A32] font-mono">2</div>
                  <p className="text-[11px] text-[#55575c]">Contradictions Caught</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#2E3034] font-mono">14</div>
                  <p className="text-[11px] text-[#55575c]">Days to Staging</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenCopilot}
                  className="px-5 py-2.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white text-xs font-semibold tracking-tight transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Interactive Blueprint</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E34A32]" strokeWidth={1.5} />
                </button>
              </div>
            </div>

            {/* Right 2 columns: Gradient card abstract representation with inset-6 white cards rotated (rotate-1) */}
            <div className="lg:col-span-2 relative h-80 rounded-[28px] bg-gradient-to-br from-[#F05A3C] via-[#E34A32] to-[#B8301B] p-6 overflow-hidden shadow-inner flex items-center justify-center">
              
              {/* Case Study Visual: Absolute inset-6 white card with shadow-lg, containing mocked UI elements slightly rotated (rotate-1) */}
              <div className="absolute inset-6 rounded-2xl bg-white p-5 shadow-2xl rotate-1 flex flex-col justify-between border border-black/5">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-[9px] font-mono text-[#55575c]">PROCUREMENT_APP</span>
                  </div>

                  {/* Mocked UI pills, lines, blocks */}
                  <div className="space-y-2.5">
                    <div className="h-3 w-3/4 rounded-full bg-[#ECEDEE]" />
                    <div className="h-2 w-1/2 rounded-full bg-[#ECEDEE]" />
                    
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 w-20 rounded-full bg-[#E34A32]/15 text-[#E34A32] text-[9px] font-mono font-bold flex items-center justify-center">
                        APPROVED
                      </div>
                      <div className="h-6 w-16 rounded-full bg-[#ECEDEE]" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[10px] text-[#55575c] font-mono">
                  <span>CITATIONS: 18</span>
                  <span className="text-[#E34A32] font-semibold">CITE-OR-ABSTAIN</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 - PACKAGES */}
        <section id="packages" className="mb-14 sm:mb-20 px-2 sm:px-4">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-[#E34A32] block mb-1 font-semibold">
              05 • SPRINT PACKAGES
            </span>
            <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#232427]">
              <WCharText text="Predictable speed. Zero surprises." serifAccentWords={['surprises']} />
            </h2>
          </div>

          {/* 3-card layout: Outer cards white rotated ±1deg; Middle featured Launch Sprint card scale-104 relative z-10 bg-[#171719] */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center max-w-6xl mx-auto">
            
            {/* Outer Left Card: Prototype Sprint (rotate-[-1deg]) */}
            <div
              data-rise
              className="p-8 rounded-[28px] bg-white text-[#232427] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_36px_-16px_rgba(35,36,39,0.15)] border border-black/5 rotate-[-1deg] transition-transform hover:rotate-0"
            >
              <span className="text-[10px] font-mono text-[#55575c] font-bold uppercase block mb-1">
                PACKAGE 01
              </span>
              <h3 className="text-xl font-bold text-[#232427] mb-1">Prototype Sprint</h3>
              <p className="text-xs text-[#55575c] mb-6">Validated proof-of-concept with live data</p>

              <div className="text-3xl font-black text-[#2E3034] font-mono mb-6">
                10 Days <span className="text-xs font-normal text-[#55575c]">turnaround</span>
              </div>

              <ul className="space-y-3 text-xs text-[#55575c] mb-8 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>Unstructured document ingestion</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>Interactive wireframes & UX specs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>Mermaid system architecture</span>
                </li>
              </ul>

              <button
                onClick={onOpenCopilot}
                className="w-full py-3 rounded-full bg-[#ECEDEE] hover:bg-[#E0E2E5] text-[#232427] text-xs font-bold transition cursor-pointer"
              >
                Select Prototype
              </button>
            </div>

            {/* Featured Card (Launch Sprint): Scale-104 relative z-10, bg-[#171719], text-white, shadow-24px-60px-rgba(23,23,25,0.7) */}
            <div
              data-rise
              className="scale-100 lg:scale-104 relative z-10 p-9 rounded-[32px] bg-[#171719] text-white shadow-[0_24px_60px_rgba(23,23,25,0.7)] border border-white/15"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-[#E34A32] font-bold uppercase">
                  RECOMMENDED
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E34A32]/20 text-[#E34A32] text-[10px] font-mono font-bold">
                  HOTTEST
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-1">Launch Sprint</h3>
              <p className="text-xs text-white/60 mb-6">Complete dual-model verified transformation</p>

              <div className="text-4xl font-black text-white font-mono mb-6">
                14 Days <span className="text-xs font-normal text-white/60">commitment</span>
              </div>

              <ul className="space-y-3 text-xs text-white/80 mb-8 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>All Prototype deliverables included</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>NVIDIA NIM independent verifier audit</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>Sarvam AI voice & translation pipeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>ER diagrams & verified REST contracts</span>
                </li>
              </ul>

              <button
                onClick={onOpenCopilot}
                className="w-full py-3.5 rounded-full bg-[#E34A32] hover:bg-[#F05A3C] text-white text-xs font-bold tracking-tight transition shadow-lg shadow-[#E34A32]/30 cursor-pointer"
              >
                Launch This Sprint Now
              </button>
            </div>

            {/* Outer Right Card: Enterprise OS (rotate-[1deg]) */}
            <div
              data-rise
              className="p-8 rounded-[28px] bg-white text-[#232427] shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_16px_36px_-16px_rgba(35,36,39,0.15)] border border-black/5 rotate-[1deg] transition-transform hover:rotate-0"
            >
              <span className="text-[10px] font-mono text-[#55575c] font-bold uppercase block mb-1">
                PACKAGE 03
              </span>
              <h3 className="text-xl font-bold text-[#232427] mb-1">Enterprise OS</h3>
              <p className="text-xs text-[#55575c] mb-6">Autonomous systems embedded into production</p>

              <div className="text-3xl font-black text-[#2E3034] font-mono mb-6">
                28 Days <span className="text-xs font-normal text-[#55575c]">deployment</span>
              </div>

              <ul className="space-y-3 text-xs text-[#55575c] mb-8 font-sans">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>Custom fine-tuned vector indexing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>Self-hosted / VPC deployment support</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#E34A32]" strokeWidth={1.5} />
                  <span>Continuous truth auditing harness</span>
                </li>
              </ul>

              <button
                onClick={onOpenCopilot}
                className="w-full py-3 rounded-full bg-[#ECEDEE] hover:bg-[#E0E2E5] text-[#232427] text-xs font-bold transition cursor-pointer"
              >
                Schedule Enterprise OS
              </button>
            </div>

          </div>
        </section>

        {/* SECTION 7 - STUDIO */}
        <section id="studio" className="mb-14 sm:mb-20 px-2 sm:px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-black/5">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E34A32] block mb-1">
                06 • THE STUDIO
              </span>
              <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#232427]">
                <WCharText text="Obsession with craft." serifAccentWords={['craft']} />
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#55575c] max-w-sm mt-2 sm:mt-0 font-sans">
              Built by engineers who believe AI software should feel tangible, verifiable, and fast.
            </p>
          </div>

          {/* 3-column layout of tall (min-h-[440px]) cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Image overlay with gradient-to-t black/70 using Abstract Light Study */}
            <div
              data-rise
              className="relative min-h-[440px] rounded-[28px] overflow-hidden shadow-xl border border-black/5 group"
            >
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/ab506a13-7aa3-443c-b74e-73cf2b8dd54d_800w.png"
                alt="Abstract Light Study"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-[10px] font-mono text-[#E34A32] uppercase mb-1 font-bold">RESEARCH LABS</span>
                <h4 className="text-xl font-bold mb-1">Optical Synthesis</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  Prototyping next-generation reasoning heuristics across multi-agent topological networks.
                </p>
              </div>
            </div>

            {/* Card 2: Gray portrait image with grayscale filter */}
            <div
              data-rise
              className="relative min-h-[440px] rounded-[28px] overflow-hidden shadow-xl border border-black/5 group"
            >
              <img
                src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/37997a14-d83a-4487-9a99-9b9c4fe21b14_800w.png"
                alt="Engineering Direction"
                className="w-full h-full object-cover filter grayscale contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
                <span className="text-[10px] font-mono text-[#E34A32] uppercase mb-1 font-bold">ENGINEERING LEAD</span>
                <h4 className="text-xl font-bold mb-1">Human-in-the-Loop</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  No automated commit reaches production without explicit human validation checkpoints.
                </p>
              </div>
            </div>

            {/* Card 3: Solid #171719 card with concept copy and contact info */}
            <div
              data-rise
              className="min-h-[440px] rounded-[28px] bg-[#171719] text-white p-8 sm:p-10 flex flex-col justify-between shadow-2xl border border-white/5"
            >
              <div>
                <span className="text-[10px] font-mono text-[#E34A32] uppercase mb-3 block font-bold">
                  THE MANIFESTO
                </span>
                <h4 className="text-2xl font-bold text-white mb-3 tracking-tight font-sans">
                  "If an AI claim cannot cite its source, it does not exist."
                </h4>
                <p className="text-xs text-white/60 leading-relaxed font-sans mb-6">
                  Groundwork AI combines radical engineering velocity with uncompromising truth verification. No made-up metrics, no silent resolutions.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-2">
                <div className="text-[11px] font-mono text-white/50">DIRECT CONTACT</div>
                <div className="text-sm font-semibold text-white font-mono">contact@groundwork.ai</div>
                <div className="text-xs text-white/40 font-mono">Evidence-Grounded Transformation Engine</div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 8 - FOOTER CTA */}
        <footer className="rounded-[28px] sm:rounded-[40px] bg-white p-8 sm:p-14 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_20px_40px_-20px_rgba(35,36,39,0.15)] border border-black/5">
          <div className="max-w-3xl mx-auto text-center">
            
            <span className="text-xs font-mono uppercase tracking-wider text-[#E34A32] block mb-2 font-semibold">
              START YOUR SPRINT
            </span>

            {/* Headline: "Show us what's slowing you down. We'll turn it into a sprint." */}
            <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#232427] leading-tight mb-4">
              Show us what's slowing you down. <br />
              <span className="font-serif-accent italic font-normal text-[#E34A32]">
                We'll turn it into a sprint.
              </span>
            </h2>

            <p className="text-sm text-[#55575c] mb-8 font-sans">
              Enter your work email to initialize a dedicated Groundwork AI copilot workspace.
            </p>

            {/* Form: Inline email input + black button */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto mb-10">
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-full bg-[#ECEDEE] border border-black/5 text-sm text-[#232427] placeholder-[#55575c] focus:outline-none focus:ring-2 focus:ring-[#E34A32]/40 transition"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-full bg-[#232427] hover:bg-[#171719] text-white text-sm font-semibold tracking-tight transition shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                {submittedEmail ? 'Launching...' : 'Start Sprint'}
              </button>
            </form>

            {/* Signature & Secondary Nav */}
            <div className="pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#55575c] gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center h-4 w-6">
                  <span className="w-3 h-3 rounded-full bg-[#232427] block" />
                  <span className="w-3 h-3 rounded-full bg-[#E34A32] block -ml-1.5" />
                </div>
                <span className="font-semibold text-[#232427]">Groundwork AI</span>
                <span>© {new Date().getFullYear()}</span>
              </div>

              <div className="flex items-center gap-5">
                <a href="#services" className="hover:text-[#232427] transition">Services</a>
                <a href="#work" className="hover:text-[#232427] transition">Case Studies</a>
                <a href="#packages" className="hover:text-[#232427] transition">Packages</a>
                <button onClick={onOpenCopilot} className="text-[#E34A32] font-semibold hover:underline cursor-pointer">
                  Open Copilot Workspace
                </button>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
};
