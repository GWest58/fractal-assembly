/**
 * Professional Color System for iOS
 * Following Apple's Human Interface Guidelines with semantic color tokens
 */

import { Colors as DesignTokenColors } from "./DesignTokens";

// MARK: - Semantic Color Mappings
export const Colors = {
  light: {
    // Primary brand colors
    primary: DesignTokenColors.primary[500],
    primaryLight: DesignTokenColors.primary[100],
    primaryDark: DesignTokenColors.primary[700],

    // Background hierarchy
    background: DesignTokenColors.light.systemBackground,
    backgroundSecondary: DesignTokenColors.light.secondarySystemBackground,
    backgroundTertiary: DesignTokenColors.light.tertiarySystemBackground,
    backgroundGrouped: DesignTokenColors.light.systemGroupedBackground,
    backgroundGroupedSecondary:
      DesignTokenColors.light.secondarySystemGroupedBackground,

    // Text hierarchy
    text: DesignTokenColors.light.label,
    textSecondary: DesignTokenColors.light.secondaryLabel,
    textTertiary: DesignTokenColors.light.tertiaryLabel,
    textPlaceholder: DesignTokenColors.light.placeholderText,

    // Interactive elements
    tint: DesignTokenColors.light.systemBlue,
    link: DesignTokenColors.light.link,

    // Tab bar specific
    tabIconDefault: DesignTokenColors.light.systemGray,
    tabIconSelected: DesignTokenColors.light.systemBlue,

    // Semantic colors
    success: DesignTokenColors.semantic.success,
    warning: DesignTokenColors.semantic.warning,
    error: DesignTokenColors.semantic.error,
    info: DesignTokenColors.semantic.info,

    // UI elements
    separator: DesignTokenColors.light.separator,
    border: DesignTokenColors.light.systemGray4,
    fill: DesignTokenColors.light.systemFill,
    fillSecondary: DesignTokenColors.light.secondarySystemFill,

    // System grays
    gray1: DesignTokenColors.light.systemGray,
    gray2: DesignTokenColors.light.systemGray2,
    gray3: DesignTokenColors.light.systemGray3,
    gray4: DesignTokenColors.light.systemGray4,
    gray5: DesignTokenColors.light.systemGray5,
    gray6: DesignTokenColors.light.systemGray6,

    // Legacy support (for gradual migration)
    icon: DesignTokenColors.light.systemGray,
  },

  dark: {
    // Primary brand colors (adjusted for premium dark mode)
    primary: "#60A5FA", // Softer, more readable blue
    primaryLight: "#93C5FD", // Light accent
    primaryDark: "#3B82F6", // Rich primary

    // Rich background hierarchy with sophisticated depth
    background: DesignTokenColors.dark.systemBackground, // #0D0E11
    backgroundSecondary: DesignTokenColors.dark.secondarySystemBackground, // #161820
    backgroundTertiary: DesignTokenColors.dark.tertiarySystemBackground, // #1E202A
    backgroundGrouped: DesignTokenColors.dark.systemGroupedBackground, // #0F1014
    backgroundGroupedSecondary:
      DesignTokenColors.dark.secondarySystemGroupedBackground, // #1A1C26

    // Sophisticated text hierarchy with warm undertones
    text: DesignTokenColors.dark.label, // #F8F9FA
    textSecondary: DesignTokenColors.dark.secondaryLabel, // #C8CDD8
    textTertiary: DesignTokenColors.dark.tertiaryLabel, // #9CA3B2
    textPlaceholder: DesignTokenColors.dark.placeholderText, // #64748B

    // Premium interactive elements
    tint: "#60A5FA", // Softer blue for better dark mode experience
    link: "#60A5FA", // Consistent with tint

    // Tab bar specific (refined for premium feel)
    tabIconDefault: "#94A3B8", // Sophisticated gray
    tabIconSelected: "#60A5FA", // Premium blue

    // Semantic colors (optimized for dark backgrounds)
    success: "#10B981", // Emerald green - more sophisticated
    warning: "#F59E0B", // Warm amber
    error: "#EF4444", // Vibrant but not harsh red
    info: "#60A5FA", // Consistent blue

    // Premium UI elements
    separator: DesignTokenColors.dark.separator, // #2D3748
    border: "#374151", // Warm gray border
    fill: DesignTokenColors.dark.systemFill, // #374151
    fillSecondary: DesignTokenColors.dark.secondarySystemFill, // #4B5563

    // Sophisticated gray scale
    gray1: DesignTokenColors.dark.systemGray, // #94A3B8
    gray2: DesignTokenColors.dark.systemGray2, // #64748B
    gray3: DesignTokenColors.dark.systemGray3, // #475569
    gray4: DesignTokenColors.dark.systemGray4, // #334155
    gray5: DesignTokenColors.dark.systemGray5, // #1E293B
    gray6: DesignTokenColors.dark.systemGray6, // #0F172A

    // Legacy support (for gradual migration)
    icon: "#94A3B8", // Sophisticated icon color
  },
} as const;

// MARK: - Color Utilities
export const getSemanticColor = (
  colorScheme: "light" | "dark",
  semantic: "success" | "warning" | "error" | "info",
) => {
  return Colors[colorScheme][semantic];
};

export const getTextColor = (
  colorScheme: "light" | "dark",
  hierarchy: "primary" | "secondary" | "tertiary" = "primary",
) => {
  switch (hierarchy) {
    case "secondary":
      return Colors[colorScheme].textSecondary;
    case "tertiary":
      return Colors[colorScheme].textTertiary;
    default:
      return Colors[colorScheme].text;
  }
};

export const getBackgroundColor = (
  colorScheme: "light" | "dark",
  level: "primary" | "secondary" | "tertiary" = "primary",
) => {
  switch (level) {
    case "secondary":
      return Colors[colorScheme].backgroundSecondary;
    case "tertiary":
      return Colors[colorScheme].backgroundTertiary;
    default:
      return Colors[colorScheme].background;
  }
};

// MARK: - Task-specific Colors
export const TaskColors = {
  light: {
    taskCompleted: Colors.light.success,
    taskPending: Colors.light.gray3,
    taskOverdue: Colors.light.error,
    frequencyBadge: Colors.light.primary,
    checkboxBorder: Colors.light.primary,
    checkboxChecked: Colors.light.primary,
  },
  dark: {
    taskCompleted: "#10B981", // Premium emerald for completed tasks
    taskPending: "#475569", // Sophisticated gray for pending
    taskOverdue: "#EF4444", // Clear but not harsh red
    frequencyBadge: "#60A5FA", // Premium blue badge
    checkboxBorder: "#60A5FA", // Consistent blue border
    checkboxChecked: "#60A5FA", // Consistent blue when checked
  },
} as const;
