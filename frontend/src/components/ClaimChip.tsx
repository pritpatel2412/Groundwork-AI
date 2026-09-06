import React from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';
import { Claim } from '../lib/api';
import { useAppStore } from '../lib/store';

interface ClaimChipProps {
  claim: Claim;
  showText?: boolean;
}

export const ClaimChip: React.FC<ClaimChipProps> = ({ claim, showText = false }) => {
  const setSelectedClaim = useAppStore((state) => state.setSelectedClaim);

  const getBadgeStyle = () => {
    switch (claim.status) {
      case 'verified':
        return {
          bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />,
          label: 'VERIFIED',
          dot: 'bg-emerald-500',
        };
      case 'inferred':
        return {
          bg: 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" strokeWidth={1.5} />,
          label: 'INFERRED',
          dot: 'bg-amber-500',
        };
      case 'contested':
        return {
          bg: 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300 border-dashed shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          icon: <HelpCircle className="w-3.5 h-3.5 text-purple-600" strokeWidth={1.5} />,
          label: 'CONTESTED',
          dot: 'bg-purple-600',
        };
      case 'unsupported':
      default:
        return {
          bg: 'bg-red-50 hover:bg-red-100 text-[#E34A32] border-red-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
          icon: <HelpCircle className="w-3.5 h-3.5 text-[#E34A32]" strokeWidth={1.5} />,
          label: 'UNGROUNDED',
          dot: 'bg-[#E34A32]',
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <button
      onClick={() => setSelectedClaim(claim)}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 cursor-pointer ${style.bg}`}
      title="Click to inspect truth citation and Verifier evidence"
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.icon}
      <span className="font-semibold tracking-tight">{style.label}</span>
      {claim.confidence > 0 && (
        <span className="text-[11px] opacity-75 font-mono">
          {Math.round(claim.confidence * 100)}%
        </span>
      )}
      {showText && <span className="ml-1 text-[#232427] max-w-xs truncate font-normal">{claim.text}</span>}
    </button>
  );
};
