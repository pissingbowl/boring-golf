import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type VibeName =
  | "southeastern-pine"
  | "desert-air"
  | "pacific-links"
  | "palm-beach"
  | "highland-moor"
  | "irish-coast"
  | "outback-sun"
  | "tokyo-modern"
  | "caribbean-blue"
  | "napa-valley"
  | "cabo-sunset"
  | "alpine-morning";

export interface VibeColors {
  primary: string;
  accent: string;
  secondary: string;
}

export const VIBE_COLORS: Record<VibeName, VibeColors> = {
  "southeastern-pine": { primary: "#1A2F23", accent: "#C9A227", secondary: "#3D5A47" },
  "desert-air": { primary: "#2D3A3A", accent: "#C17F59", secondary: "#7A8B7A" },
  "pacific-links": { primary: "#1C2833", accent: "#5B8A72", secondary: "#4A5568" },
  "palm-beach": { primary: "#1B3A4B", accent: "#E07A5F", secondary: "#3D8B6E" },
  "highland-moor": { primary: "#2C2416", accent: "#8E7DBE", secondary: "#9B8F55" },
  "irish-coast": { primary: "#1E3A34", accent: "#D4A84B", secondary: "#4A7C6F" },
  "outback-sun": { primary: "#3D2314", accent: "#E8733A", secondary: "#8B6F47" },
  "tokyo-modern": { primary: "#1A1A2E", accent: "#E63946", secondary: "#4A4A5C" },
  "caribbean-blue": { primary: "#0D3B45", accent: "#00B4D8", secondary: "#2A7C8C" },
  "napa-valley": { primary: "#2D1F3D", accent: "#722F37", secondary: "#6B5B7A" },
  "cabo-sunset": { primary: "#1F1A38", accent: "#FF6B35", secondary: "#E85D75" },
  "alpine-morning": { primary: "#1C3144", accent: "#38A3A5", secondary: "#57837B" },
};

export interface VibeOption {
  id: VibeName;
  name: string;
  category: "Classic American" | "International" | "Resort Vibes";
  colors: VibeColors;
}

export const VIBE_OPTIONS: VibeOption[] = [
  { id: "southeastern-pine", name: "Southeastern Pine", category: "Classic American", colors: VIBE_COLORS["southeastern-pine"] },
  { id: "desert-air", name: "Desert Air", category: "Classic American", colors: VIBE_COLORS["desert-air"] },
  { id: "pacific-links", name: "Pacific Links", category: "Classic American", colors: VIBE_COLORS["pacific-links"] },
  { id: "palm-beach", name: "Palm Beach", category: "Classic American", colors: VIBE_COLORS["palm-beach"] },
  { id: "highland-moor", name: "Highland Moor", category: "International", colors: VIBE_COLORS["highland-moor"] },
  { id: "irish-coast", name: "Irish Coast", category: "International", colors: VIBE_COLORS["irish-coast"] },
  { id: "outback-sun", name: "Outback Sun", category: "International", colors: VIBE_COLORS["outback-sun"] },
  { id: "tokyo-modern", name: "Tokyo Modern", category: "International", colors: VIBE_COLORS["tokyo-modern"] },
  { id: "caribbean-blue", name: "Caribbean Blue", category: "Resort Vibes", colors: VIBE_COLORS["caribbean-blue"] },
  { id: "napa-valley", name: "Napa Valley", category: "Resort Vibes", colors: VIBE_COLORS["napa-valley"] },
  { id: "cabo-sunset", name: "Cabo Sunset", category: "Resort Vibes", colors: VIBE_COLORS["cabo-sunset"] },
  { id: "alpine-morning", name: "Alpine Morning", category: "Resort Vibes", colors: VIBE_COLORS["alpine-morning"] },
];

const STORAGE_KEY = "boring-golf-vibe";

interface VibeContextValue {
  vibe: VibeName;
  setVibe: (vibe: VibeName) => void;
  vibeColors: VibeColors;
}

const VibeContext = createContext<VibeContextValue | undefined>(undefined);

interface VibeProviderProps {
  children: ReactNode;
}

export function VibeProvider({ children }: VibeProviderProps) {
  const [vibe, setVibeState] = useState<VibeName>("southeastern-pine");

  useEffect(() => {
    const savedVibe = localStorage.getItem(STORAGE_KEY);
    if (savedVibe && savedVibe in VIBE_COLORS) {
      setVibeState(savedVibe as VibeName);
      document.body.setAttribute("data-vibe", savedVibe);
    } else {
      document.body.setAttribute("data-vibe", "southeastern-pine");
    }
  }, []);

  const setVibe = (newVibe: VibeName) => {
    setVibeState(newVibe);
    localStorage.setItem(STORAGE_KEY, newVibe);
    document.body.setAttribute("data-vibe", newVibe);
  };

  const vibeColors = VIBE_COLORS[vibe];

  return (
    <VibeContext.Provider value={{ vibe, setVibe, vibeColors }}>
      {children}
    </VibeContext.Provider>
  );
}

export function useVibe() {
  const context = useContext(VibeContext);
  if (context === undefined) {
    throw new Error("useVibe must be used within a VibeProvider");
  }
  return context;
}
