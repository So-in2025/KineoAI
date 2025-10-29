
import React from 'react';
import { AspectRatio } from '../types';

interface AspectRatioSelectorProps {
  selected: AspectRatio;
  onSelect: (aspectRatio: AspectRatio) => void;
}

const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onSelect }) => {
  // FIX: Use React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  const options: { value: AspectRatio; label: string; icon: React.ReactElement }[] = [
    { 
      value: '16:9', 
      label: 'Landscape', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect></svg>
      )
    },
    { 
      value: '9:16', 
      label: 'Portrait', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect></svg>
      )
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-slate-400 mb-2">Aspect Ratio</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors duration-200 ${
              selected === option.value
                ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300'
                : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-white'
            }`}
          >
            {option.icon}
            <span className="mt-2 text-sm font-semibold">{option.label} ({option.value})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AspectRatioSelector;