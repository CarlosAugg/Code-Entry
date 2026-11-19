export type ThemeMode = "dark" | "light";

export type ThemePaletteId =
  | "dark-violet"
  | "dark-crimson"
  | "dark-cyber"
  | "dark-amber"
  | "light-arctic"
  | "light-ocean"
  | "light-mint"
  | "light-coral";

export interface ThemePaletteDefinition {
  id: ThemePaletteId;
  mode: ThemeMode;
  name: string;
  tagline: string;
  metaThemeColor: string;
  swatches: {
    bg: string;
    sidebar: string;
    surface: string;
    primary: string;
    secondary: string;
    tertiary: string;
    text: string;
  };
  canvasRgb: [string, string, string];
  auroraPrimary: string;
  auroraSecondary: string;
  auroraFocalRgba: string;
  auroraSecondaryRgba: string;
  auroraSparkRgb: string;
  sparkColors: [string, string, string];
}

export const DEFAULT_DARK_PALETTE: ThemePaletteId = "dark-violet";
export const DEFAULT_LIGHT_PALETTE: ThemePaletteId = "light-arctic";

export const THEME_PALETTES: ThemePaletteDefinition[] = [
  // MODO ESCURO (4 paletas distintas)
  {
    id: "dark-violet",
    mode: "dark",
    name: "Nebula Violet",
    tagline: "Violeta cósmico com azul elétrico",
    metaThemeColor: "#070a14",
    swatches: {
      bg: "#070a14",
      sidebar: "#0a0e1c",
      surface: "#0f1528",
      primary: "#7545f5",
      secondary: "#9b65ff",
      tertiary: "#4ea5ff",
      text: "#f1f5fb",
    },
    canvasRgb: ["139, 92, 246", "78, 165, 255", "56, 189, 248"],
    auroraPrimary: "#8b5cf6",
    auroraSecondary: "#38bdf8",
    auroraFocalRgba: "rgba(139, 92, 246, 0.28)",
    auroraSecondaryRgba: "rgba(56, 189, 248, 0.16)",
    auroraSparkRgb: "226, 232, 240",
    sparkColors: ["#a78bfa", "#38bdf8", "#c084fc"],
  },
  {
    id: "dark-crimson",
    mode: "dark",
    name: "GX Crimson",
    tagline: "Carmesim neon em grafite escuro",
    metaThemeColor: "#0c070a",
    swatches: {
      bg: "#0c070a",
      sidebar: "#120a0e",
      surface: "#190e14",
      primary: "#fa1e4e",
      secondary: "#ff5c7c",
      tertiary: "#ff9466",
      text: "#faf2f4",
    },
    canvasRgb: ["250, 30, 78", "255, 148, 102", "255, 92, 124"],
    auroraPrimary: "#fa1e4e",
    auroraSecondary: "#ff9466",
    auroraFocalRgba: "rgba(250, 30, 78, 0.28)",
    auroraSecondaryRgba: "rgba(255, 148, 102, 0.16)",
    auroraSparkRgb: "255, 228, 235",
    sparkColors: ["#ff5c7c", "#ff9466", "#fa1e4e"],
  },
  {
    id: "dark-cyber",
    mode: "dark",
    name: "Cyber Matrix",
    tagline: "Verde esmeralda e ciano terminal",
    metaThemeColor: "#060d0e",
    swatches: {
      bg: "#060d0e",
      sidebar: "#091315",
      surface: "#0d1b1e",
      primary: "#10b981",
      secondary: "#34d399",
      tertiary: "#22d3ee",
      text: "#eefaf8",
    },
    canvasRgb: ["16, 185, 129", "34, 211, 238", "52, 211, 153"],
    auroraPrimary: "#10b981",
    auroraSecondary: "#22d3ee",
    auroraFocalRgba: "rgba(16, 185, 129, 0.26)",
    auroraSecondaryRgba: "rgba(34, 211, 238, 0.16)",
    auroraSparkRgb: "209, 250, 245",
    sparkColors: ["#34d399", "#22d3ee", "#10b981"],
  },
  {
    id: "dark-amber",
    mode: "dark",
    name: "Solar Forge",
    tagline: "Âmbar quente sobre carvão fosco",
    metaThemeColor: "#0d0a07",
    swatches: {
      bg: "#0d0a07",
      sidebar: "#14100b",
      surface: "#1c160f",
      primary: "#d97706",
      secondary: "#fbbf24",
      tertiary: "#fb7185",
      text: "#faf6ef",
    },
    canvasRgb: ["245, 158, 11", "251, 113, 133", "251, 191, 36"],
    auroraPrimary: "#f59e0b",
    auroraSecondary: "#fb7185",
    auroraFocalRgba: "rgba(245, 158, 11, 0.26)",
    auroraSecondaryRgba: "rgba(251, 113, 133, 0.15)",
    auroraSparkRgb: "254, 243, 199",
    sparkColors: ["#fbbf24", "#fb7185", "#f59e0b"],
  },

  // MODO CLARO (4 paletas distintas)
  {
    id: "light-arctic",
    mode: "light",
    name: "Arctic Violet",
    tagline: "Branco gelo com violeta vibrante",
    metaThemeColor: "#f3f6fc",
    swatches: {
      bg: "#f3f6fc",
      sidebar: "#ffffff",
      surface: "#ffffff",
      primary: "#6838eb",
      secondary: "#7e52f8",
      tertiary: "#257be6",
      text: "#0f172a",
    },
    canvasRgb: ["104, 56, 235", "37, 123, 230", "16, 185, 129"],
    auroraPrimary: "#7e52f8",
    auroraSecondary: "#257be6",
    auroraFocalRgba: "rgba(104, 56, 235, 0.16)",
    auroraSecondaryRgba: "rgba(37, 123, 230, 0.11)",
    auroraSparkRgb: "104, 56, 235",
    sparkColors: ["#6838eb", "#257be6", "#7e52f8"],
  },
  {
    id: "light-ocean",
    mode: "light",
    name: "Nordic Ocean",
    tagline: "Azul glaciar e safira límpida",
    metaThemeColor: "#f0f7fb",
    swatches: {
      bg: "#f0f7fb",
      sidebar: "#ffffff",
      surface: "#ffffff",
      primary: "#0284c7",
      secondary: "#0369a1",
      tertiary: "#0891b2",
      text: "#0c1b2a",
    },
    canvasRgb: ["2, 132, 199", "8, 145, 178", "56, 189, 248"],
    auroraPrimary: "#0284c7",
    auroraSecondary: "#0891b2",
    auroraFocalRgba: "rgba(2, 132, 199, 0.16)",
    auroraSecondaryRgba: "rgba(8, 145, 178, 0.12)",
    auroraSparkRgb: "2, 132, 199",
    sparkColors: ["#0284c7", "#0891b2", "#0369a1"],
  },
  {
    id: "light-mint",
    mode: "light",
    name: "Matcha Studio",
    tagline: "Sálvia suave e verde esmeralda",
    metaThemeColor: "#f1f8f5",
    swatches: {
      bg: "#f1f8f5",
      sidebar: "#fbfefd",
      surface: "#ffffff",
      primary: "#059669",
      secondary: "#047857",
      tertiary: "#0d9488",
      text: "#0c2019",
    },
    canvasRgb: ["5, 150, 105", "13, 148, 136", "16, 185, 129"],
    auroraPrimary: "#059669",
    auroraSecondary: "#0d9488",
    auroraFocalRgba: "rgba(5, 150, 105, 0.15)",
    auroraSecondaryRgba: "rgba(13, 148, 136, 0.11)",
    auroraSparkRgb: "5, 150, 105",
    sparkColors: ["#059669", "#0d9488", "#10b981"],
  },
  {
    id: "light-coral",
    mode: "light",
    name: "Paper Sunset",
    tagline: "Porcelana quente com coral vivo",
    metaThemeColor: "#fbf5f2",
    swatches: {
      bg: "#fbf5f2",
      sidebar: "#fffcfa",
      surface: "#ffffff",
      primary: "#e11d48",
      secondary: "#be123c",
      tertiary: "#ea580c",
      text: "#1f1216",
    },
    canvasRgb: ["225, 29, 72", "234, 88, 12", "244, 63, 94"],
    auroraPrimary: "#e11d48",
    auroraSecondary: "#ea580c",
    auroraFocalRgba: "rgba(225, 29, 72, 0.15)",
    auroraSecondaryRgba: "rgba(234, 88, 12, 0.11)",
    auroraSparkRgb: "225, 29, 72",
    sparkColors: ["#e11d48", "#ea580c", "#be123c"],
  },
];

export const VALID_THEME_PALETTE_IDS = new Set<ThemePaletteId>(THEME_PALETTES.map(p => p.id));

const PALETTE_MAP = new Map<ThemePaletteId, ThemePaletteDefinition>(
  THEME_PALETTES.map(p => [p.id, p])
);

export function getPalettesByMode(mode: ThemeMode): ThemePaletteDefinition[] {
  return THEME_PALETTES.filter(p => p.mode === mode);
}

export function getPaletteById(id?: string | null): ThemePaletteDefinition {
  if (id && PALETTE_MAP.has(id as ThemePaletteId)) {
    return PALETTE_MAP.get(id as ThemePaletteId)!;
  }
  return PALETTE_MAP.get(DEFAULT_DARK_PALETTE)!;
}

export function resolvePalette(mode: ThemeMode, paletteId?: string | null): ThemePaletteDefinition {
  if (paletteId && PALETTE_MAP.has(paletteId as ThemePaletteId)) {
    const found = PALETTE_MAP.get(paletteId as ThemePaletteId)!;
    if (found.mode === mode) return found;
  }
  return PALETTE_MAP.get(mode === "light" ? DEFAULT_LIGHT_PALETTE : DEFAULT_DARK_PALETTE)!;
}
