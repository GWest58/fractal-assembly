import React from "react";
import { Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Typography } from "@/constants/DesignTokens";
import { getTextColor } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "largeTitle"
    | "title1"
    | "title2"
    | "title3"
    | "headline"
    | "body"
    | "bodyEmphasized"
    | "callout"
    | "calloutEmphasized"
    | "subheadline"
    | "subheadlineEmphasized"
    | "footnote"
    | "footnoteEmphasized"
    | "caption1"
    | "caption1Emphasized"
    | "caption2"
    | "caption2Emphasized"
    // Legacy support
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link";
  hierarchy?: "primary" | "secondary" | "tertiary";
  semantic?: "success" | "warning" | "error" | "info";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "body",
  hierarchy = "primary",
  semantic,
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();

  // Determine text color
  let textColor: string;

  if (semantic) {
    // Use semantic colors for success, error, etc.
    const semanticColors = {
      light: {
        success: "#34C759",
        warning: "#FF9500",
        error: "#FF3B30",
        info: "#007AFF",
      },
      dark: {
        success: "#30D158",
        warning: "#FF9F0A",
        error: "#FF453A",
        info: "#0984FF",
      },
    };
    textColor = semanticColors[colorScheme ?? "light"][semantic];
  } else if (lightColor || darkColor) {
    // Use custom colors if provided
    textColor = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  } else {
    // Use hierarchy-based colors
    textColor = getTextColor(colorScheme ?? "light", hierarchy);
  }

  // Get typography styles
  const getTypographyStyle = () => {
    switch (type) {
      case "largeTitle":
        return Typography.largeTitle;
      case "title1":
        return Typography.title1;
      case "title2":
        return Typography.title2;
      case "title3":
        return Typography.title3;
      case "headline":
        return Typography.headline;
      case "body":
        return Typography.body;
      case "bodyEmphasized":
        return Typography.bodyEmphasized;
      case "callout":
        return Typography.callout;
      case "calloutEmphasized":
        return Typography.calloutEmphasized;
      case "subheadline":
        return Typography.subheadline;
      case "subheadlineEmphasized":
        return Typography.subheadlineEmphasized;
      case "footnote":
        return Typography.footnote;
      case "footnoteEmphasized":
        return Typography.footnoteEmphasized;
      case "caption1":
        return Typography.caption1;
      case "caption1Emphasized":
        return Typography.caption1Emphasized;
      case "caption2":
        return Typography.caption2;
      case "caption2Emphasized":
        return Typography.caption2Emphasized;

      // Legacy support - map to new system
      case "title":
        return Typography.title1;
      case "subtitle":
        return Typography.title3;
      case "defaultSemiBold":
        return Typography.bodyEmphasized;
      case "link":
        return { ...Typography.body, color: "#007AFF" };
      case "default":
      default:
        return Typography.body;
    }
  };

  const typographyStyle = getTypographyStyle();

  return (
    <Text
      style={[
        {
          color: textColor,
          ...typographyStyle,
        },
        style,
      ]}
      {...rest}
    />
  );
}

// Export convenience components for common text types
export const LargeTitle = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="largeTitle" {...props} />
);

export const Title1 = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="title1" {...props} />
);

export const Title2 = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="title2" {...props} />
);

export const Title3 = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="title3" {...props} />
);

export const Headline = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="headline" {...props} />
);

export const Body = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="body" {...props} />
);

export const BodyEmphasized = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="bodyEmphasized" {...props} />
);

export const Callout = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="callout" {...props} />
);

export const CalloutEmphasized = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="calloutEmphasized" {...props} />
);

export const Subheadline = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="subheadline" {...props} />
);

export const SubheadlineEmphasized = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="subheadlineEmphasized" {...props} />
);

export const Footnote = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="footnote" {...props} />
);

export const FootnoteEmphasized = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="footnoteEmphasized" {...props} />
);

export const Caption1 = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="caption1" {...props} />
);

export const Caption1Emphasized = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="caption1Emphasized" {...props} />
);

export const Caption2 = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="caption2" {...props} />
);

export const Caption2Emphasized = (props: Omit<ThemedTextProps, "type">) => (
  <ThemedText type="caption2Emphasized" {...props} />
);
