import React from 'react';
import { SUIT_ICONS } from '../constants';

interface CardProps {
  rank: string;
  suit: 's' | 'h' | 'd' | 'c';
  className?: string;
}

export const Card: React.FC<CardProps> = ({ rank, suit, className = '' }) => {
  const isRed = suit === 'h' || suit === 'd';
  
  return (
    <div className={`
      relative w-20 h-28 sm:w-24 sm:h-36 bg-white rounded-lg shadow-md border-2 border-slate-200 
      flex flex-col items-center justify-center select-none ${className}
    `}>
      <div className={`text-2xl sm:text-4xl font-bold ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
        {rank}
      </div>
      <div className={`text-4xl sm:text-6xl ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
        {SUIT_ICONS[suit]}
      </div>
      
      {/* Mini corner indices */}
      <div className={`absolute top-1 left-1 text-xs font-bold ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
        {rank}
      </div>
      <div className={`absolute bottom-1 right-1 text-xs font-bold ${isRed ? 'text-red-600' : 'text-slate-800'}`}>
        {rank}
      </div>
    </div>
  );
};