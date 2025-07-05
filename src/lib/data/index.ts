import {
  Zap,
  Flame,
  Timer,
  User,
  ArrowRight,
  Smartphone,
  Target,
  LucideIcon,
} from "lucide-react";
import focusModesData from "./focusModes.json";
import ritualStepsData from "./ritualSteps.json";

export interface FocusMode {
  id: string;
  name: string;
  duration: number;
  description: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
}

export interface RitualStep {
  title: string;
  subtitle: string;
  instruction: string;
  action: string;
  icon: LucideIcon;
  color: string;
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

interface RitualStepData {
  title: string;
  subtitle: string;
  instruction: string;
  action: string;
  icon: string;
  color: string;
}

interface FocusModesJson {
  focusModes: FocusModeData[];
}

interface RitualStepsJson {
  ritualSteps: RitualStepData[];
}

// Map icon strings to actual Lucide components
const iconMap: Record<string, LucideIcon> = {
  Zap,
  Flame,
  Timer,
  User,
  ArrowRight,
  Smartphone,
  Target,
};

// Transform JSON data to include proper icon components
export const focusModes: FocusMode[] = (
  focusModesData as FocusModesJson
).focusModes.map((mode: FocusModeData) => ({
  ...mode,
  icon: iconMap[mode.icon] || Timer, // Fallback to Timer if icon not found
}));

// Transform ritual steps JSON data to include proper icon components
export const ritualSteps: RitualStep[] = (
  ritualStepsData as RitualStepsJson
).ritualSteps.map((step: RitualStepData) => ({
  ...step,
  icon: iconMap[step.icon] || User, // Fallback to User if icon not found
}));

// Helper function to get a focus mode by ID
export const getFocusModeById = (id: string): FocusMode | undefined => {
  return focusModes.find((mode) => mode.id === id);
};

// Helper function to get all focus mode IDs
export const getFocusModeIds = (): string[] => {
  return focusModes.map((mode) => mode.id);
};

// Helper function to get a ritual step by index
export const getRitualStepByIndex = (index: number): RitualStep | undefined => {
  return ritualSteps[index];
};

// Helper function to get total number of ritual steps
export const getRitualStepCount = (): number => {
  return ritualSteps.length;
};
