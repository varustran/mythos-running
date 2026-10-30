import type { GameSaveState } from "./types";

const SAVE_KEY = "mythos_last_route_save_v1";

const defaultState: GameSaveState = {
  version: 1,
  chapter: 1,
  completedChapters: [],
  shardsCount: 0,
  collectedShardIds: [],
  totalDistanceMeters: 0,
  bestPaceSeconds: 300, // 5:00/km default best
  storyAlignment: {
    preserver: 0,
    pioneer: 0,
    wanderer: 0,
  },
  achievements: [],
  lastSavedAt: new Date().toISOString(),
};

export function loadGameSave(): GameSaveState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultState;
    return JSON.parse(raw) as GameSaveState;
  } catch (err) {
    console.warn("Failed to load local game save", err);
    return defaultState;
  }
}

export function saveGameProgress(state: Partial<GameSaveState>): GameSaveState {
  if (typeof window === "undefined") return defaultState;
  try {
    const current = loadGameSave();
    const updated: GameSaveState = {
      ...current,
      ...state,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save game progress", err);
    return defaultState;
  }
}

export function resetGameSave(): GameSaveState {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SAVE_KEY);
  }
  return defaultState;
}
