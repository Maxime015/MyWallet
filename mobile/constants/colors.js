// 🎨 ===============================
// FICHIER : colors.js
// Description : Gestion centralisée des thèmes et couleurs
// =================================

// 🪵 FOREST THEME
const forestTheme = {
  primary: "#2E7D32",
  background: "#E8F5E9",
  text: "#1B5E20",
  textPrimary: "#1B5E20",
  textLight: "#66BB6A",
  border: "#C8E6C9",
  card: "#FFFFFF",
  shadow: "#000000",
  white: "#FFFFFF",
  expense: "#C62828",
  income: "#388E3C",
};

// ☕ COFFEE THEME
const coffeeTheme = {
  primary: "#8B593E",
  background: "#FFF8F3",
  text: "#4A3428",
  textPrimary: "#4A3428",
  textLight: "#9A8478",
  border: "#E5D3B7",
  card: "#FFFFFF",
  shadow: "#000000",
  white: "#FFFFFF",
  expense: "#E74C3C",
  income: "#2ECC71",
};

// 💜 PURPLE THEME
const purpleTheme = {
  primary: "#6A1B9A",
  background: "#F3E5F5",
  text: "#4A148C",
  textPrimary: "#4A148C",
  textLight: "#BA68C8",
  border: "#D1C4E9",
  card: "#FFFFFF",
  shadow: "#000000",
  white: "#FFFFFF",
  expense: "#D32F2F",
  income: "#388E3C",
};

// 🌊 OCEAN THEME
const oceanTheme = {
  primary: "#0277BD",
  background: "#E1F5FE",
  text: "#01579B",
  textPrimary: "#01579B",
  textLight: "#4FC3F7",
  border: "#B3E5FC",
  card: "#FFFFFF",
  shadow: "#000000",
  white: "#FFFFFF",
  expense: "#EF5350",
  income: "#26A69A",
};

// ===============================
// 🎨 EXPORTS
// ===============================

export const THEMES = {
  coffee: coffeeTheme,
  forest: forestTheme,
  purple: purpleTheme,
  ocean: oceanTheme,
};

// 👇 Export nommé pour COLORS (manquant)
export const COLORS = THEMES.forest;

// Export par défaut pour éviter les problèmes d'import
export default THEMES.forest;