
import React, { useState, useEffect } from 'react';
import { HandGrid } from '../components/HandGrid';
import { Position, StackSize, RangeStorage, RangeGrid } from '../types';
import { STACKS, EMPTY_RANGE, PLAYER_COUNTS, PLAYER_COUNT_LABELS, POSITIONS_BY_PLAYER_COUNT } from '../constants';
import { getStorageKey, loadRanges, saveRange, resetRanges } from '../utils/storage';
import { parseRangeString } from '../utils/handParser';
import { Save, RotateCcw, Copy, ArrowDownCircle } from 'lucide-react';

export const RangeEditor: React.FC = () => {
  const [ranges, setRanges] = useState<RangeStorage>({});
  
  // Selection State
  const [players, setPlayers] = useState(6);
  const [position, setPosition] = useState<Position>(Position.BTN);
  const [stack, setStack] = useState<StackSize>(StackSize.BB_10);
  
  // Grid State
  const [currentGrid, setCurrentGrid] = useState<RangeGrid>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Import State
  const [importText, setImportText] = useState('');

  // Get valid positions for current player count
  const validPositions = POSITIONS_BY_PLAYER_COUNT[players] || [];

  useEffect(() => {
    // Initial Load
    const loaded = loadRanges();
    setRanges(loaded);
  }, []);

  // Ensure position is valid when player count changes
  useEffect(() => {
    if (!validPositions.includes(position)) {
        // Default to the last position (usually SB or BTN) if the current one isn't valid
        if (validPositions.length > 0) {
            setPosition(validPositions[validPositions.length - 1]);
        }
    }
  }, [players, position, validPositions]);

  useEffect(() => {
    // When context changes, update the displayed grid
    const key = getStorageKey(players, position, stack);
    const existing = ranges[key];
    setCurrentGrid(existing ? [...existing] : [...EMPTY_RANGE]);
    setIsDirty(false);
  }, [players, position, stack, ranges]);

  const handleToggle = (index: number) => {
    const newGrid = [...currentGrid];
    newGrid[index] = !newGrid[index];
    setCurrentGrid(newGrid);
    setIsDirty(true);
  };

  const handleSave = () => {
    const key = getStorageKey(players, position, stack);
    const updatedRanges = saveRange(key, currentGrid);
    setRanges(updatedRanges);
    setIsDirty(false);
  };

  const handleClear = () => {
    if (confirm('Clear this entire range?')) {
        setCurrentGrid([...EMPTY_RANGE]);
        setIsDirty(true);
    }
  };

  const handleResetAll = () => {
      if(confirm('This will delete ALL your custom ranges and reset to app defaults. Are you sure?')) {
          const defaults = resetRanges();
          setRanges(defaults);
      }
  };

  const handleImport = () => {
      if (!importText.trim()) return;
      const parsedGrid = parseRangeString(importText);
      
      // Check if grid is empty (parsing failed or empty input)
      const hasTrue = parsedGrid.some(x => x);
      if (!hasTrue && importText.length > 0) {
          // Simple validation feedback
          alert("Could not parse range text. Use format: 22+, AJ+, 98s+");
          return;
      }
      
      setCurrentGrid(parsedGrid);
      setIsDirty(true);
      setImportText(''); // Clear on success
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">Range Editor</h2>
             <button 
                onClick={handleResetAll}
                className="text-xs text-red-500 underline"
             >
                Reset App Data
             </button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Table Size</label>
            <select 
              value={players} 
              onChange={(e) => setPlayers(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {PLAYER_COUNTS.map(p => (
                <option key={p} value={p}>{PLAYER_COUNT_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Position</label>
            <select 
              value={position} 
              onChange={(e) => setPosition(e.target.value as Position)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {validPositions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stack Depth</label>
            <select 
              value={stack} 
              onChange={(e) => setStack(e.target.value as StackSize)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {STACKS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-end">
             <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all
                  ${isDirty 
                    ? 'bg-emerald-600 text-white shadow-md hover:bg-emerald-700' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                `}
             >
               <Save size={18} />
               {isDirty ? 'Save' : 'Saved'}
             </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white p-2 sm:p-6 rounded-xl shadow-sm border border-slate-200">
         <div className="flex justify-between items-center mb-4 px-2">
             <span className="text-sm text-slate-500">
                 Editing: <strong className="text-slate-800">{PLAYER_COUNT_LABELS[players]} / {position} / {stack}</strong>
             </span>
             <div className="flex gap-2">
                 <button onClick={handleClear} className="p-2 hover:bg-slate-100 rounded-full text-slate-500" title="Clear Grid">
                     <RotateCcw size={16} />
                 </button>
             </div>
         </div>
         
         {/* Quick Import */}
         <div className="mb-6 px-2">
             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quick Import (Replaces Grid)</label>
             <div className="flex gap-2">
                 <input 
                    type="text"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleImport()}
                    placeholder="e.g. 22+, AJ+, KJs+, KQ, 98s+"
                    className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-300"
                 />
                 <button 
                    onClick={handleImport}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg text-sm hover:bg-indigo-100 border border-indigo-200"
                 >
                     Apply
                 </button>
             </div>
         </div>

         <HandGrid 
            gridState={currentGrid} 
            onToggle={handleToggle} 
         />
      </div>
      
      <div className="text-center text-xs text-slate-400">
          Tip: Tap cells or use the text input to define ranges.
      </div>
    </div>
  );
};
