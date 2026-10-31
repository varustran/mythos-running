import type { Locale } from "@/lib/i18n/settings";

export type LocalizedText = Record<string, string>;

export type PlayerMovement = "idle" | "jog" | "run" | "sprint" | "jump";

export interface DialogueChoice {
  text: LocalizedText;
  nextNodeId?: string;
  effect?: "preserve" | "explore" | "endure" | "pioneer";
}

export interface DialogueNode {
  id: string;
  speaker: string;
  speakerRole: LocalizedText;
  avatarUrl?: string;
  text: LocalizedText;
  choices?: DialogueChoice[];
}

export interface MemoryShard {
  id: string;
  x: number;
  y: number;
  collected: boolean;
  title: LocalizedText;
  lore: LocalizedText;
}

export interface GameChapter {
  id: number;
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  location: LocalizedText;
  image: string;
  targetMeters: number;
  initialDialogue: DialogueNode[];
  completionDialogue: DialogueNode[];
  secretClue: LocalizedText;
}

export interface GameSaveState {
  version: number;
  chapter: number;
  completedChapters: number[];
  shardsCount: number;
  collectedShardIds: string[];
  totalDistanceMeters: number;
  bestPaceSeconds: number;
  storyAlignment: {
    preserver: number;
    pioneer: number;
    wanderer: number;
  };
  achievements: string[];
  lastSavedAt: string;
}
