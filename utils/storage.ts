import { RangeStorage, RangeGrid, Position, StackSize } from '../types';
import { EMPTY_RANGE, DEFAULT_PRESET_BTN_10BB } from '../constants';

const STORAGE_KEY = 'pushfold_ranges_v1';
const RESULTS_KEY = 'pushfold_results_v1';

export const getStorageKey = (players: number, pos: Position, stack: StackSize) => {
  return `${players}-${pos}-${stack}`;
};

export const loadRanges = (): RangeStorage => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load ranges", e);
  }
  
  // Return default with one preset populated for demo purposes
  const defaultKey = getStorageKey(6, Position.BTN, StackSize.BB_10);
  return {
    [defaultKey]: [...DEFAULT_PRESET_BTN_10BB]
  };
};

export const saveRange = (key: string, grid: RangeGrid) => {
  const current = loadRanges();
  current[key] = grid;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  return current;
};

export const resetRanges = () => {
  localStorage.removeItem(STORAGE_KEY);
  return loadRanges();
};

export const saveResult = (result: any) => {
  try {
    const prev = JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
    prev.push(result);
    // Keep last 500
    if (prev.length > 500) prev.shift();
    localStorage.setItem(RESULTS_KEY, JSON.stringify(prev));
  } catch (e) {
    console.error(e);
  }
};

export const getResults = () => {
  try {
    return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]');
  } catch {
    return [];
  }
};