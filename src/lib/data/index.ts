import { Zap, Flame, Timer, LucideIcon } from "lucide-react";
import focusModesData from "./focusModes.json";

export interface FocusMode {
  id: string;
  name: string;
  duration: number;
  description: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
}

interface FocusModeData {
  id: string;
  name: string;
  duration: number;
  description: string;
  icon: string;
  color: string;
  textColor: string;
}

interface FocusModesJson {
  focusModes: FocusModeData[];
}

// Map icon strings to actual Lucide components
const iconMap: Record<string, LucideIcon> = {
  Zap,
  Flame,
  Timer,
};

// Transform JSON data to include proper icon components
export const focusModes: FocusMode[] = (
  focusModesData as FocusModesJson
).focusModes.map((mode: FocusModeData) => ({
  ...mode,
  icon: iconMap[mode.icon] || Timer, // Fallback to Timer if icon not found
}));

// Helper function to get a focus mode by ID
export const getFocusModeById = (id: string): FocusMode | undefined => {
  return focusModes.find((mode) => mode.id === id);
};

// Helper function to get all focus mode IDs
export const getFocusModeIds = (): string[] => {
  return focusModes.map((mode) => mode.id);
};
