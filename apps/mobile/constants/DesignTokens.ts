/**
 * Professional Design Tokens for iOS
 * Following Apple's Human Interface Guidelines and 8pt spacing system
 */

// MARK: - Typography Scale (SF Pro Display/Text)
export const Typography = {
  // Large titles
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: "700" as const,
    letterSpacing: 0.37,
  },

  // Standard titles
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
    letterSpacing: 0.36,
  },

  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
    letterSpacing: 0.35,
  },

  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "600" as const,
    letterSpacing: 0.38,
  },

  // Headlines
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.43,
  },

  // Body text
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "400" as const,
    letterSpacing: -0.43,
  },

  bodyEmphasized: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: -0.43,
  },

  // Callouts
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "400" as const,
    letterSpacing: -0.32,
  },

  calloutEmphasized: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "600" as const,
    letterSpacing: -0.32,
  },

  // Subheadlines
  subheadline: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "400" as const,
    letterSpacing: -0.24,
  },

  subheadlineEmphasized: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "600" as const,
    letterSpacing: -0.24,
  },

  // Footnotes
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400" as const,
    letterSpacing: -0.08,
  },

  footnoteEmphasized: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600" as const,
    letterSpacing: -0.08,
  },

  // Captions
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "400" as const,
    letterSpacing: 0,
  },

  caption1Emphasized: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    letterSpacing: 0,
  },

  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "400" as const,
    letterSpacing: 0.07,
  },

  caption2Emphasized: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: "600" as const,
    letterSpacing: 0.07,
  },
} as const;

// MARK: - Spacing System (8pt grid)
export const Spacing = {
  // Base unit (4pt for fine adjustments)
  unit: 4,

  // Standard spacing scale
  xs: 4, // 0.25rem
  sm: 8, // 0.5rem
  md: 16, // 1rem
  lg: 24, // 1.5rem
  xl: 32, // 2rem
  xxl: 40, // 2.5rem
  xxxl: 48, // 3rem

  // Component-specific spacing
  component: {
    padding: 16,
    margin: 16,
    containerPadding: 20,
    sectionSpacing: 32,
    listItemSpacing: 12,
  },

  // Button spacing
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44, // iOS minimum touch target
  },

  // Input spacing
  input: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
  },
} as const;

// MARK: - Professional Color Palette
export const Colors = {
  // Primary brand colors
  primary: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6", // Main brand color
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
    950: "#172554",
  },

  // Semantic colors
  semantic: {
    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#007AFF",
  },

  // iOS System Colors (Light Mode)
  light: {
    // Background colors
    systemBackground: "#FFFFFF",
    secondarySystemBackground: "#F2F2F7",
    tertiarySystemBackground: "#FFFFFF",
    systemGroupedBackground: "#F2F2F7",
    secondarySystemGroupedBackground: "#FFFFFF",
    tertiarySystemGroupedBackground: "#F2F2F7",

    // Label colors
    label: "#000000",
    secondaryLabel: "#3C3C43",
    tertiaryLabel: "#3C3C43",
    quaternaryLabel: "#3C3C43",
    placeholderText: "#3C3C43",

    // Separator colors
    separator: "#C6C6C8",
    opaqueSeparator: "#C6C6C8",

    // Fill colors
    systemFill: "#787880",
    secondarySystemFill: "#787880",
    tertiarySystemFill: "#767680",
    quaternarySystemFill: "#747480",

    // Other system colors
    link: "#007AFF",
    systemBlue: "#007AFF",
    systemGreen: "#34C759",
    systemOrange: "#FF9500",
    systemRed: "#FF3B30",
    systemYellow: "#FFCC00",
    systemPink: "#FF2D92",
    systemPurple: "#AF52DE",
    systemTeal: "#5AC8FA",
    systemIndigo: "#5856D6",
    systemGray: "#8E8E93",
    systemGray2: "#AEAEB2",
    systemGray3: "#C7C7CC",
    systemGray4: "#D1D1D6",
    systemGray5: "#E5E5EA",
    systemGray6: "#F2F2F7",
  },

  // Premium Dark Mode Colors (Sophisticated & Professional)
  dark: {
    // Rich background hierarchy with warm undertones
    systemBackground: "#0D0E11", // Deep charcoal with blue undertone
    secondarySystemBackground: "#161820", // Elevated surface
    tertiarySystemBackground: "#1E202A", // Cards and modals
    systemGroupedBackground: "#0F1014", // Grouped content background
    secondarySystemGroupedBackground: "#1A1C26", // Secondary grouped
    tertiarySystemGroupedBackground: "#222530", // Tertiary grouped

    // Sophisticated text hierarchy
    label: "#F8F9FA", // Primary text - warm white
    secondaryLabel: "#C8CDD8", // Secondary text - cool gray
    tertiaryLabel: "#9CA3B2", // Tertiary text - muted
    quaternaryLabel: "#6B7280", // Quaternary text - subtle
    placeholderText: "#64748B", // Placeholder - muted blue-gray

    // Premium separators with subtle warmth
    separator: "#2D3748", // Warm dark separator
    opaqueSeparator: "#374151", // Slightly lighter separator

    // Refined fill colors
    systemFill: "#374151", // Primary fill
    secondarySystemFill: "#4B5563", // Secondary fill
    tertiarySystemFill: "#6B7280", // Tertiary fill
    quaternarySystemFill: "#9CA3AF", // Quaternary fill

    // Premium accent colors optimized for dark mode
    link: "#60A5FA", // Softer blue for better readability
    systemBlue: "#3B82F6", // Rich, saturated blue
    systemGreen: "#10B981", // Emerald green
    systemOrange: "#F59E0B", // Warm amber
    systemRed: "#EF4444", // Vibrant red
    systemYellow: "#EAB308", // Golden yellow
    systemPink: "#EC4899", // Vibrant pink
    systemPurple: "#8B5CF6", // Rich purple
    systemTeal: "#14B8A6", // Premium teal
    systemIndigo: "#6366F1", // Deep indigo

    // Sophisticated gray scale
    systemGray: "#94A3B8", // Light gray
    systemGray2: "#64748B", // Medium-light gray
    systemGray3: "#475569", // Medium gray
    systemGray4: "#334155", // Medium-dark gray
    systemGray5: "#1E293B", // Dark gray
    systemGray6: "#0F172A", // Very dark gray
  },
} as const;

// MARK: - Border Radius
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,

  // Component-specific radius
  button: 8,
  card: 12,
  input: 8,
  modal: 12,
  badge: 16,
} as const;

// MARK: - Shadows (iOS style)
export const Shadows = {
  // Small shadow for floating elements
  small: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },

  // Medium shadow for cards
  medium: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  // Large shadow for modals
  large: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  // Extra large shadow for floating action buttons
  xl: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
} as const;

// MARK: - Animation Durations
export const Animation = {
  // Standard iOS animation durations
  fast: 150,
  normal: 250,
  slow: 350,

  // Spring animations
  spring: {
    damping: 0.8,
    stiffness: 100,
    mass: 1,
  },

  // Easing curves
  easing: {
    easeInOut: "ease-in-out",
    easeOut: "ease-out",
    easeIn: "ease-in",
  },
} as const;

// MARK: - Component Sizes
export const ComponentSizes = {
  // Button heights
  button: {
    small: 36,
    medium: 44,
    large: 52,
  },

  // Input heights
  input: {
    small: 36,
    medium: 44,
    large: 52,
  },

  // Icon sizes
  icon: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },
} as const;

// MARK: - Z-Index Scale
export const ZIndex = {
  base: 0,
  dropdown: 1000,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
} as const;

// MARK: - Opacity Scale
export const Opacity = {
  disabled: 0.3,
  placeholder: 0.6,
  secondary: 0.8,
  hover: 0.9,
  pressed: 0.7,
} as const;

// MARK: - Layout Constants
export const Layout = {
  // Screen padding
  screenPadding: 20,

  // Safe area adjustments
  safeArea: {
    top: 44,
    bottom: 34,
  },

  // Tab bar
  tabBar: {
    height: 83,
    itemHeight: 49,
  },

  // Navigation bar
  navigationBar: {
    height: 44,
    largeHeight: 96,
  },

  // Common component dimensions
  floatingActionButton: {
    size: 56,
    bottomOffset: 90,
  },
} as const;
