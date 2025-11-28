
import { RANKS } from '../constants';
import { RangeGrid } from '../types';

const RANK_MAP: Record<string, number> = {};
RANKS.forEach((r, i) => RANK_MAP[r] = i);

export function parseRangeString(input: string): RangeGrid {
  const grid = new Array(169).fill(false);
  
  // Split by comma, clean whitespace
  const tokens = input.split(',').map(t => t.trim()).filter(t => t);

  tokens.forEach(token => {
    // 1. PAIRS: 22, 22+, TT
    const pairMatch = token.match(/^([AKQJT98765432])\1(\+)?$/i);
    if (pairMatch) {
      const rankChar = pairMatch[1].toUpperCase();
      const isPlus = !!pairMatch[2];
      const idx = RANK_MAP[rankChar];
      
      if (idx !== undefined) {
        if (isPlus) {
          // 22+ means index of '2' down to index of 'A' (0)
          for (let i = 0; i <= idx; i++) {
            grid[i * 13 + i] = true;
          }
        } else {
          grid[idx * 13 + idx] = true;
        }
      }
      return;
    }

    // 2. NON-PAIRS: AK, AKs, AKo, AK+, 98s+
    const handMatch = token.match(/^([AKQJT98765432])([AKQJT98765432])([soSO]?)([+]?)$/i);
    if (handMatch) {
      const r1Char = handMatch[1].toUpperCase();
      const r2Char = handMatch[2].toUpperCase();
      const suit = handMatch[3].toLowerCase(); // 's', 'o', or ''
      const isPlus = !!handMatch[4];

      let idx1 = RANK_MAP[r1Char];
      let idx2 = RANK_MAP[r2Char];

      if (idx1 === undefined || idx2 === undefined) return;

      // Ensure High Card First (Rank Index Lower)
      if (idx1 > idx2) {
        [idx1, idx2] = [idx2, idx1];
      }
      if (idx1 === idx2) return; // Should be handled by pair logic

      // Helper to set grid bits based on suit constraint
      const setHand = (r1: number, r2: number) => {
        if (r1 < 0 || r2 < 0 || r1 >= 13 || r2 >= 13) return;
        
        // Suited: Row < Col.  Grid[r1][r2]
        if (suit === 's' || suit === '') {
          grid[r1 * 13 + r2] = true;
        }
        // Offsuit: Row > Col. Grid[r2][r1]
        if (suit === 'o' || suit === '') {
          grid[r2 * 13 + r1] = true;
        }
      };

      if (!isPlus) {
        // Exact hand: e.g. "AK" or "KJs"
        setHand(idx1, idx2);
      } else {
        // Handle Plus Logic
        // Rule: 
        // If Rank1 is High (A, K, Q -> Index <= 2), use Kicker Logic.
        // Else, use Structure Logic (connectors/gappers moving up).
        
        if (idx1 <= 2) {
          // KICKER LOGIC: Fix Top Card, Improve Kicker
          // e.g. AJ+ (A fixed, J -> Q -> K)
          // Loop from current kicker (idx2) DOWN to (idx1 + 1)
          for (let k = idx2; k > idx1; k--) {
            setHand(idx1, k);
          }
        } else {
          // STRUCTURE LOGIC: Move both cards up
          // e.g. 98s+ -> 98s, T9s, JTs...
          // Loop decrementing both indices until one hits 0
          let c1 = idx1;
          let c2 = idx2;
          while (c1 >= 0 && c2 >= 0) {
            setHand(c1, c2);
            c1--;
            c2--;
          }
        }
      }
    }
  });

  return grid;
}
