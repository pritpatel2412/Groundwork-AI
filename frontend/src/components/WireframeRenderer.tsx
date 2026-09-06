import React from 'react';
import { Claim } from '../lib/api';
import { ClaimChip } from './ClaimChip';
import { 
  Type, 
  Square, 
  Table as TableIcon, 
  CreditCard, 
  ListOrdered, 
  Image as ImageIcon, 
  Menu,
  CheckCircle2
} from 'lucide-react';

export type WireframeComponentType = 
  | 'header' 
  | 'text' 
  | 'input' 
  | 'button' 
  | 'table' 
  | 'card' 
  | 'list' 
  | 'image_placeholder' 
  | 'nav_bar';

export interface WireframeComponent {
  id: string;
  type: WireframeComponentType;
  label: string;
  placeholder?: string;
  style?: string;
  content?: string;
  columns?: string[];
  items?: string[];
  claim_id?: string;
  status?: 'verified' | 'inferred' | 'contested' | 'unsupported';
}

export interface WireframeSpec {
  screen_name: string;
  layout?: 'single_column' | 'two_column' | 'sidebar_content';
  components: WireframeComponent[];
}

interface WireframeRendererProps {
  spec: WireframeSpec;
  claims?: Claim[];
}

export const WireframeRenderer: React.FC<WireframeRendererProps> = ({ spec, claims = [] }) => {
  const claimMap = new Map<string, Claim>();
  claims.forEach((c) => {
    claimMap.set(c.id, c);
  });

  return (
    <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Mockup Window Title Bar */}
      <div className="bg-[#F8F9FA] px-4 py-3 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
          </div>
          <span className="ml-3 text-[11px] font-mono text-[#55575c] bg-white px-3 py-1 rounded-md border border-black/5">
            https://app.groundwork.internal/{spec.screen_name.toLowerCase().replace(/\s+/g, '-')}
          </span>
        </div>
        <span className="text-xs font-semibold text-[#232427] font-sans">
          {spec.screen_name}
        </span>
      </div>

      {/* Wireframe Canvas Body */}
      <div className="p-6 sm:p-8 bg-[#FAFBFB]">
        <div className={`space-y-4 ${
          spec.layout === 'two_column' ? 'grid grid-cols-1 md:grid-cols-2 gap-4 space-y-0' : ''
        }`}>
          {spec.components && spec.components.length > 0 ? (
            spec.components.map((comp) => {
              const matchedClaim = comp.claim_id ? claimMap.get(comp.claim_id) : undefined;
              const fallbackClaim: Claim = {
                id: comp.claim_id || comp.id,
                text: `${spec.screen_name}: ${comp.type} '${comp.label}'`,
                status: comp.status || 'inferred',
                citations: [],
                confidence: 0.85
              };

              return (
                <ClaimAwareComponent
                  key={comp.id}
                  component={comp}
                  claim={matchedClaim || fallbackClaim}
                />
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#55575c] font-mono">
              No wireframe components specified for this screen.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ClaimAwareComponentProps {
  component: WireframeComponent;
  claim: Claim;
}

const ClaimAwareComponent: React.FC<ClaimAwareComponentProps> = ({ component, claim }) => {
  return (
    <div className="group relative rounded-xl border border-black/10 bg-white p-4 shadow-xs transition-all hover:border-[#232427]/30">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-[#55575c] uppercase">
          {getComponentIcon(component.type)}
          <span>{component.type}</span>
          <span className="text-black/20">•</span>
          <span className="text-black/40">{component.id}</span>
        </div>
        <div className="shrink-0">
          <ClaimChip claim={claim} />
        </div>
      </div>

      <div className="mt-1">
        {renderComponentBody(component)}
      </div>
    </div>
  );
};

function getComponentIcon(type: WireframeComponentType) {
  switch (type) {
    case 'header':
      return <Type className="w-3.5 h-3.5 text-[#E34A32]" />;
    case 'input':
      return <Square className="w-3.5 h-3.5 text-blue-500" />;
    case 'button':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    case 'table':
      return <TableIcon className="w-3.5 h-3.5 text-purple-500" />;
    case 'card':
      return <CreditCard className="w-3.5 h-3.5 text-amber-500" />;
    case 'list':
      return <ListOrdered className="w-3.5 h-3.5 text-teal-500" />;
    case 'image_placeholder':
      return <ImageIcon className="w-3.5 h-3.5 text-pink-500" />;
    case 'nav_bar':
      return <Menu className="w-3.5 h-3.5 text-indigo-500" />;
    case 'text':
    default:
      return <Type className="w-3.5 h-3.5 text-[#55575c]" />;
  }
}

function renderComponentBody(comp: WireframeComponent) {
  switch (comp.type) {
    case 'header':
      return (
        <div className="py-1">
          <h2 className="text-lg font-bold text-[#232427] font-sans tracking-tight">
            {comp.label}
          </h2>
          {comp.content && (
            <p className="text-xs text-[#55575c] mt-0.5">{comp.content}</p>
          )}
        </div>
      );

    case 'input':
      return (
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#232427]">
            {comp.label}
          </label>
          <div className="relative">
            <input
              type="text"
              disabled
              placeholder={comp.placeholder || 'Enter value...'}
              className="w-full px-3.5 py-2 text-xs rounded-lg bg-[#F8F9FA] border border-black/10 text-[#55575c] cursor-not-allowed"
            />
          </div>
        </div>
      );

    case 'button':
      return (
        <div className="py-1">
          <button
            type="button"
            disabled
            className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-xs cursor-default flex items-center gap-2 ${
              comp.style === 'primary'
                ? 'bg-[#232427] text-white'
                : 'bg-white border border-black/15 text-[#232427]'
            }`}
          >
            <span>{comp.label}</span>
          </button>
        </div>
      );

    case 'table':
      const cols = comp.columns && comp.columns.length > 0 
        ? comp.columns 
        : ['Column A', 'Column B', 'Column C', 'Status'];
      return (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#232427]">{comp.label}</div>
          <div className="overflow-x-auto border border-black/10 rounded-lg bg-white">
            <table className="min-w-full divide-y divide-black/5 text-[11px]">
              <thead className="bg-[#F8F9FA]">
                <tr>
                  {cols.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-3 py-2 text-left font-mono font-semibold text-[#55575c]"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-[#232427]">
                {[1, 2].map((row) => (
                  <tr key={row} className="hover:bg-[#FAFBFB]">
                    {cols.map((col, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 font-mono text-black/60">
                        {cIdx === 0 ? `Item #${row}` : cIdx === cols.length - 1 ? 'Approved' : '---'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'card':
      return (
        <div className="p-3.5 rounded-xl bg-[#F8F9FA] border border-black/5 space-y-1">
          <div className="text-xs font-bold text-[#232427]">{comp.label}</div>
          <p className="text-xs text-[#55575c] leading-relaxed">
            {comp.content || 'Content and metrics overview card.'}
          </p>
        </div>
      );

    case 'list':
      const items = comp.items && comp.items.length > 0
        ? comp.items
        : ['Workflow step 1: Request initiation', 'Workflow step 2: Manager verification', 'Workflow step 3: Payment settlement'];
      return (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-[#232427]">{comp.label}</div>
          <ul className="space-y-1">
            {items.map((it, idx) => (
              <li
                key={idx}
                className="text-xs text-[#55575c] flex items-center gap-2 p-1.5 rounded-md bg-[#F8F9FA]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E34A32]" />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case 'image_placeholder':
      return (
        <div className="h-28 rounded-lg border border-dashed border-black/20 bg-[#F8F9FA] flex flex-col items-center justify-center text-[#55575c]">
          <ImageIcon className="w-6 h-6 text-black/30 mb-1" />
          <span className="text-[11px] font-medium">{comp.label}</span>
        </div>
      );

    case 'nav_bar':
      return (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#232427] text-white">
          <span className="text-xs font-bold font-sans">{comp.label}</span>
          <div className="flex gap-2 text-[10px] font-mono text-white/70">
            <span>Home</span>
            <span>Queue</span>
            <span>Reports</span>
          </div>
        </div>
      );

    case 'text':
    default:
      return (
        <div className="py-1">
          <div className="text-xs font-semibold text-[#232427]">{comp.label}</div>
          {comp.content && (
            <p className="text-xs text-[#55575c] mt-0.5 leading-relaxed">{comp.content}</p>
          )}
        </div>
      );
  }
}
