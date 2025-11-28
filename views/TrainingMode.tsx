
import React, { useState, useEffect, useMemo } from 'react';
import { Position, StackSize, RangeStorage, QuizResult, HandCell } from '../types';
import { ALL_POSITIONS, STACKS, GRID_HANDS, RANKS, PLAYER_COUNTS, PLAYER_COUNT_LABELS, POSITIONS_BY_PLAYER_COUNT } from '../constants';
import { loadRanges, getStorageKey, saveResult, getResults } from '../utils/storage';
import { Card } from '../components/Card';
import { HandGrid } from '../components/HandGrid';
import { CheckCircle, XCircle, BarChart3, Settings2 } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';

type Phase = 'setup' | 'quiz' | 'feedback';

export const TrainingMode: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('setup');
  const [ranges, setRanges] = useState<RangeStorage>({});
  
  // Settings
  const [selectedPlayerCounts, setSelectedPlayerCounts] = useState<Record<number, boolean>>(
    PLAYER_COUNTS.reduce((acc, p) => ({...acc, [p]: p === 6}), {}) // Default to 6-max only
  );
  
  const [selectedPos, setSelectedPos] = useState<Record<string, boolean>>(
    ALL_POSITIONS.reduce((acc, p) => ({...acc, [p]: true}), {})
  );
  
  const [selectedStacks, setSelectedStacks] = useState<Record<string, boolean>>(
    STACKS.reduce((acc, s) => ({...acc, [s]: true}), {})
  );

  // Quiz State
  const [currentScenario, setCurrentScenario] = useState<{
    players: number;
    pos: Position;
    stack: StackSize;
    hand: HandCell;
    handIndex: number;
    shouldPush: boolean;
    handCards: { rank: string, suit: 's'|'h'|'d'|'c' }[];
  } | null>(null);
  
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [stats, setStats] = useState(getResults());

  useEffect(() => {
    setRanges(loadRanges());
  }, []);

  // --- Logic ---

  const getCardFromInt = (val: number) => {
    const rankIdx = Math.floor(val / 4);
    const suitIdx = val % 4;
    const suits: ('s' | 'h' | 'd' | 'c')[] = ['s', 'h', 'd', 'c'];
    return {
        rank: RANKS[rankIdx],
        suit: suits[suitIdx],
        rankIdx: rankIdx,
        suitIdx: suitIdx
    };
  };

  const drawRandomHand = () => {
     let c1 = Math.floor(Math.random() * 52);
     let c2 = Math.floor(Math.random() * 52);
     
     // Ensure unique cards
     while (c1 === c2) {
         c2 = Math.floor(Math.random() * 52);
     }
     
     const card1 = getCardFromInt(c1);
     const card2 = getCardFromInt(c2);
     
     // Determine Grid Coordinates based on generated cards
     let row, col;
     
     if (card1.rankIdx === card2.rankIdx) {
         // Pair: Main Diagonal (Row == Col)
         row = card1.rankIdx;
         col = card1.rankIdx;
     } else if (card1.suitIdx === card2.suitIdx) {
         // Suited: Upper Triangle (Row < Col)
         // We need min index as row, max index as col
         row = Math.min(card1.rankIdx, card2.rankIdx);
         col = Math.max(card1.rankIdx, card2.rankIdx);
     } else {
         // Offsuit: Lower Triangle (Row > Col)
         // We need max index as row, min index as col
         row = Math.max(card1.rankIdx, card2.rankIdx);
         col = Math.min(card1.rankIdx, card2.rankIdx);
     }
     
     const index = row * 13 + col;
     
     return {
         handCards: [card1, card2],
         handIndex: index
     };
  };

  const startNextHand = () => {
    // 1. Filter viable options
    const activePlayerCounts = PLAYER_COUNTS.filter(p => selectedPlayerCounts[p]);
    const activePositions = ALL_POSITIONS.filter(p => selectedPos[p]);
    const activeStacks = STACKS.filter(s => selectedStacks[s]);
    
    if (activePlayerCounts.length === 0 || activePositions.length === 0 || activeStacks.length === 0) {
        alert("Please select at least one option for each category.");
        return;
    }

    // 2. Random selection with validity check
    let attempts = 0;
    while (attempts < 50) {
        const rPlayers = activePlayerCounts[Math.floor(Math.random() * activePlayerCounts.length)];
        const validPositionsForCount = POSITIONS_BY_PLAYER_COUNT[rPlayers];
        
        // Intersect user selected positions with valid positions for this player count
        const validAndSelected = activePositions.filter(p => validPositionsForCount.includes(p));
        
        if (validAndSelected.length > 0) {
             const rPos = validAndSelected[Math.floor(Math.random() * validAndSelected.length)];
             const rStack = activeStacks[Math.floor(Math.random() * activeStacks.length)];
             
             // 3. Get Range
             const key = getStorageKey(rPlayers, rPos, rStack);
             const range = ranges[key];
             const validRange = range || new Array(169).fill(false);

             // 4. Random Hand (Draw 2 Cards Simulation)
             const { handCards, handIndex } = drawRandomHand();
             const handObj = GRID_HANDS[handIndex];
             const isPush = validRange[handIndex];

             setCurrentScenario({
                 players: rPlayers,
                 pos: rPos,
                 stack: rStack,
                 hand: handObj,
                 handIndex: handIndex,
                 shouldPush: isPush,
                 handCards: handCards
             });
             
             setPhase('quiz');
             return;
        }
        attempts++;
    }
    
    alert("Could not find a valid scenario with current filters. (Example: You selected '6-max' but only 'UTG' position).");
  };

  const handleAnswer = (action: 'Push' | 'Fold') => {
    if (!currentScenario) return;

    const isCorrect = (action === 'Push' && currentScenario.shouldPush) || 
                      (action === 'Fold' && !currentScenario.shouldPush);

    const result: QuizResult = {
        correct: isCorrect,
        userAction: action,
        correctAction: currentScenario.shouldPush ? 'Push' : 'Fold',
        handLabel: currentScenario.hand.label,
        scenarioKey: getStorageKey(currentScenario.players, currentScenario.pos, currentScenario.stack),
        timestamp: Date.now()
    };

    saveResult(result);
    setStats(prev => [...prev, result]); // Update local stats state
    setLastResult(result);
    setPhase('feedback');
  };
  
  // --- Render Helpers ---

  const RecentStatsGraph = () => {
      const data = stats.slice(-20).map((s, i) => ({ i, correct: s.correct ? 1 : 0 }));
      return (
          <div className="h-24 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                      <Line type="step" dataKey="correct" stroke="#10b981" strokeWidth={2} dot={false} />
                  </LineChart>
              </ResponsiveContainer>
              <div className="text-center text-[10px] text-slate-400">Last 20 Hands</div>
          </div>
      )
  };

  // --- Views ---

  if (phase === 'setup') {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800">Training Setup</h2>
                <p className="text-slate-500">Configure your session</p>
            </div>

            {/* Player Counts */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Table Size</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {PLAYER_COUNTS.map(p => (
                        <button
                            key={p}
                            onClick={() => setSelectedPlayerCounts(prev => ({...prev, [p]: !prev[p]}))}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                                ${selectedPlayerCounts[p] ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}
                            `}
                        >
                            {PLAYER_COUNT_LABELS[p]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Positions */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Positions</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {ALL_POSITIONS.map(p => (
                        <button
                            key={p}
                            onClick={() => setSelectedPos(prev => ({...prev, [p]: !prev[p]}))}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                                ${selectedPos[p] ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}
                            `}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stacks */}
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Stack Depth</label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {STACKS.map(s => (
                        <button
                            key={s}
                            onClick={() => setSelectedStacks(prev => ({...prev, [s]: !prev[s]}))}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors
                                ${selectedStacks[s] ? 'bg-indigo-100 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400'}
                            `}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <button 
                onClick={startNextHand}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md transition-transform active:scale-[0.98]"
            >
                Start Training
            </button>
            
            {stats.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>Lifetime Accuracy</span>
                        <span className="font-bold">
                            {Math.round((stats.filter(s => s.correct).length / stats.length) * 100)}% 
                            <span className="text-xs font-normal text-slate-400 ml-1">({stats.length} hands)</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }

  if (phase === 'quiz' && currentScenario) {
      return (
          <div className="max-w-md mx-auto p-4 flex flex-col h-[85vh]">
              {/* Info Bar */}
              <div className="flex justify-between items-center bg-slate-200 rounded-lg p-3 mb-8">
                  <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-bold uppercase">{PLAYER_COUNT_LABELS[currentScenario.players]} / {currentScenario.pos}</span>
                      <span className="text-lg font-bold text-slate-800">First In</span>
                  </div>
                  <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-500 font-bold uppercase">Stack</span>
                      <span className="text-lg font-bold text-slate-800">{currentScenario.stack}</span>
                  </div>
              </div>

              {/* Cards */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <div className="flex gap-4">
                      {currentScenario.handCards.map((c, i) => (
                          <Card key={i} rank={c.rank} suit={c.suit} className="transform hover:-translate-y-2 transition-transform" />
                      ))}
                  </div>
                  <div className="text-slate-400 font-medium text-lg">
                      {currentScenario.hand.label}
                  </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-4 mt-auto">
                  <button 
                    onClick={() => handleAnswer('Fold')}
                    className="py-6 rounded-xl bg-slate-200 text-slate-700 font-bold text-xl hover:bg-slate-300 active:bg-slate-400 transition-colors"
                  >
                      Fold
                  </button>
                  <button 
                    onClick={() => handleAnswer('Push')}
                    className="py-6 rounded-xl bg-emerald-500 text-white font-bold text-xl hover:bg-emerald-600 active:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors"
                  >
                      Push
                  </button>
              </div>
          </div>
      );
  }

  if (phase === 'feedback' && currentScenario && lastResult) {
      // Find the relevant range to display for context
      const rangeKey = lastResult.scenarioKey;
      const rangeGrid = ranges[rangeKey] || new Array(169).fill(false);

      return (
          <div className="max-w-md mx-auto p-4 min-h-screen flex flex-col">
              <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
                  {/* Result Header */}
                  <div className={`p-6 text-center ${lastResult.correct ? 'bg-emerald-50' : 'bg-red-50'}`}>
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-white shadow-sm mb-3">
                        {lastResult.correct ? <CheckCircle size={32} className="text-emerald-500" /> : <XCircle size={32} className="text-red-500" />}
                      </div>
                      <h2 className={`text-2xl font-bold ${lastResult.correct ? 'text-emerald-700' : 'text-red-700'}`}>
                          {lastResult.correct ? 'Correct!' : 'Incorrect'}
                      </h2>
                      <p className="text-slate-600 mt-1">
                          Correct action: <strong>{lastResult.correctAction}</strong>
                      </p>
                  </div>

                  {/* Context */}
                  <div className="p-4 space-y-4">
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                          <span className="text-slate-500">Scenario</span>
                          <span className="font-bold text-slate-700">{PLAYER_COUNT_LABELS[currentScenario.players]} • {currentScenario.pos} • {currentScenario.stack}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                          <span className="text-slate-500">Your Hand</span>
                          <span className="font-bold text-slate-700">{currentScenario.hand.label}</span>
                      </div>
                      
                      {/* Mini Heatmap Context */}
                      <div className="mt-4">
                          <p className="text-xs text-slate-400 uppercase font-bold mb-2">Range Visualization</p>
                          <div className="border rounded-lg overflow-hidden p-1 bg-slate-50">
                             <HandGrid 
                                gridState={rangeGrid} 
                                readOnly={true} 
                                highlightIndex={currentScenario.handIndex} 
                             />
                          </div>
                      </div>
                  </div>
                  
                  {/* Next Button */}
                  <div className="mt-auto p-4 bg-slate-50 border-t">
                      <button 
                        onClick={startNextHand}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-md"
                      >
                          Next Hand
                      </button>
                      <button 
                        onClick={() => setPhase('setup')}
                        className="w-full mt-2 py-3 text-slate-500 font-medium hover:text-slate-700"
                      >
                          Exit to Setup
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return null;
};
