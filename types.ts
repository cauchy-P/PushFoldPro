
export enum Position {
  UTG = 'UTG',
  UTG1 = 'UTG+1',
  UTG2 = 'UTG+2',
  LJ = 'LJ',
  HJ = 'HJ',
  CO = 'CO',
  BTN = 'BTN',
  SB = 'SB',
  BB = 'BB' // Included for completeness, though rarely used for First-In
}

export enum StackSize {
  BB_5 = '5bb',
  BB_10 = '10bb',
  BB_15 = '15bb',
  BB_20 = '20bb'
}

export type HandType = 'pair' | 'suited' | 'offsuit';

// Represents a single cell in the 13x13 matrix
export interface HandCell {
  row: number;
  col: number;
  label: string; // e.g., "AKs", "TT", "72o"
  type: HandType;
}

// A flat array of 169 booleans representing the 13x13 grid.
// true = Push, false = Fold
export type RangeGrid = boolean[];

// Key structure: `${players}-${position}-${stack}`
// e.g., "6-BTN-10bb"
export type RangeStorage = Record<string, RangeGrid>;

export interface QuizResult {
  correct: boolean;
  userAction: 'Push' | 'Fold';
  correctAction: 'Push' | 'Fold';
  handLabel: string;
  scenarioKey: string;
  timestamp: number;
}

export interface TrainingSettings {
  selectedPositions: Position[];
  selectedStacks: StackSize[];
  isRandomPosition: boolean;
  isRandomStack: boolean;
}
