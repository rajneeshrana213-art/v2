const COLORS = {
  primary: "#1A73B5",
  primaryDark: "#145A8E",
  primaryLight: "#E3F0FA",
  secondary: "#22C55E",
  secondaryLight: "#DCFCE7",
  accent: "#3BA5D9",
  background: "#F4F8FB",
  surface: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  error: "#EF4444",
  warning: "#F59E0B",
  success: "#22C55E",
  cardShadow: "rgba(26, 115, 181, 0.08)",
  overlay: "rgba(0, 0, 0, 0.5)",
  gradients: {
    primary: ["#1A73B5", "#3BA5D9"],
    secondary: ["#22C55E", "#84CC16"],
    premium: ["#1A73B5", "#22C55E"], // Blue to Green brand gradient
    glass: ["rgba(255, 255, 255, 0.7)", "rgba(255, 255, 255, 0.3)"],
  },
};

export default {
  light: {
    ...COLORS,
    tint: COLORS.primary,
    tabIconDefault: COLORS.textMuted,
    tabIconSelected: COLORS.primary,
  },
};

export { COLORS };
