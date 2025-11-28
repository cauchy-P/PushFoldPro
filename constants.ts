
import { Position, StackSize } from './types';

export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

// All possible positions for iterating in filters
export const ALL_POSITIONS = [
  Position.UTG,
  Position.UTG1,
  Position.UTG2,
  Position.LJ,
  Position.HJ,
  Position.CO,
  Position.BTN,
  Position.SB
];

export const STACKS = [
  StackSize.BB_5,
  StackSize.BB_10,
  StackSize.BB_15,
  StackSize.BB_20
];

export const PLAYER_COUNTS = [2, 4, 6, 9];

export const PLAYER_COUNT_LABELS: Record<number, string> = {
  2: "Heads-up",
  4: "4-max",
  6: "6-max",
  9: "9-max"
};

// Define valid First-In positions for each table size
// Note: BB is excluded for First-In ranges
export const POSITIONS_BY_PLAYER_COUNT: Record<number, Position[]> = {
  2: [Position.SB], 
  4: [Position.CO, Position.BTN, Position.SB],
  6: [Position.LJ, Position.HJ, Position.CO, Position.BTN, Position.SB],
  9: [Position.UTG, Position.UTG1, Position.UTG2, Position.LJ, Position.HJ, Position.CO, Position.BTN, Position.SB]
};

// Legacy support or default list if needed (maps to 6-max typically)
export const POSITIONS = ALL_POSITIONS; 

export const SUIT_ICONS = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣'
};

// Generate the 169 hand labels in a 13x13 grid order (Row major)
// Row 0: AA, AKs, AQs...
// Row 1: AKo, KK, KQs...
export const GRID_HANDS = (() => {
  const grid = [];
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      const rank1 = RANKS[row];
      const rank2 = RANKS[col];
      let label = '';
      let type: 'pair' | 'suited' | 'offsuit';

      if (row === col) {
        label = `${rank1}${rank2}`;
        type = 'pair';
      } else if (row < col) {
        label = `${rank1}${rank2}s`;
        type = 'suited';
      } else {
        label = `${rank2}${rank1}o`;
        type = 'offsuit';
      }
      grid.push({ row, col, label, type });
    }
  }
  return grid;
})();

// Default empty range (all false/fold)
export const EMPTY_RANGE = new Array(169).fill(false);

// A simple preset to populate the app on first load so it's not empty
export const DEFAULT_PRESET_BTN_10BB: boolean[] = GRID_HANDS.map(h => {
  const r1Idx = RANKS.indexOf(h.label[0]);
  const r2Idx = RANKS.indexOf(h.label[1]);
  
  // Simple heuristic for demo: Any Pair, Any Ace, Suited Connectors, Broadways
  if (h.type === 'pair') return true;
  if (h.label.includes('A')) return true;
  if (h.label.includes('K') && h.type === 'suited') return true;
  if (r1Idx < 5 && r2Idx < 5) return true; // High cards
  return false;
});
