import React from 'react';
import { GRID_HANDS, RANKS } from '../constants';
import { RangeGrid } from '../types';

interface HandGridProps {
  gridState: RangeGrid;
  onToggle?: (index: number) => void;
  highlightIndex?: number | null; // For showing the specific hand in training
  readOnly?: boolean;
}

export const HandGrid: React.FC<HandGridProps> = ({ 
  gridState, 
  onToggle, 
  highlightIndex = null,
  readOnly = false 
}) => {
  
  return (
    <div className="flex flex-col select-none">
      {/* Top Labels */}
      <div className="flex ml-6 sm:ml-8 mb-1">
        {RANKS.map((r, i) => (
          <div key={i} className="flex-1 text-center text-[10px] sm:text-xs text-slate-500 font-medium">
            {r}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Left Labels */}
        <div className="flex flex-col w-6 sm:w-8 mr-1">
          {RANKS.map((r, i) => (
            <div key={i} className="flex-1 flex items-center justify-end pr-2 text-[10px] sm:text-xs text-slate-500 font-medium h-[calc(100vw/15)] sm:h-auto aspect-square">
              {r}
            </div>
          ))}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-[1px] bg-slate-300 border border-slate-300 flex-1">
          {GRID_HANDS.map((hand, index) => {
            const isSelected = gridState[index];
            const isHighlighted = highlightIndex === index;

            // Determine Background Color
            let bgClass = 'bg-white'; // Fold (Default)
            let textClass = 'text-slate-400';

            if (isSelected) {
              bgClass = 'bg-emerald-500'; // Push
              textClass = 'text-white';
            }
            
            if (isHighlighted) {
              bgClass = isSelected ? 'bg-emerald-600 ring-2 ring-yellow-400 z-10' : 'bg-slate-200 ring-2 ring-yellow-400 z-10';
              textClass = isSelected ? 'text-white font-bold' : 'text-slate-800 font-bold';
            } else if (!isSelected && !readOnly) {
               // Hover/Touch hint logic could go here, but keeping it simple for touch
            }

            // Diagonal styling slightly different?
            if (hand.type === 'pair' && !isSelected) {
              bgClass = 'bg-slate-50';
            }

            return (
              <div
                key={hand.label}
                onMouseDown={() => !readOnly && onToggle && onToggle(index)}
                className={`
                  relative aspect-square flex items-center justify-center 
                  cursor-pointer transition-colors duration-75
                  ${bgClass}
                `}
                title={hand.label}
              >
                <span className={`text-[8px] sm:text-[10px] md:text-xs leading-none ${textClass}`}>
                  {hand.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs text-slate-600">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
          <span>Push</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-slate-200 rounded-sm"></div>
          <span>Fold</span>
        </div>
      </div>
    </div>
  );
};