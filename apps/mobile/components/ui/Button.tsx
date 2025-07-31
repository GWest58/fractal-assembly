import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

import { useColorScheme } from "@/hooks/useColorScheme";
import {
  Spacing,
  BorderRadius,
  Shadows,
  ComponentSizes,
} from "@/constants/DesignTokens";
import { Colors } from "@/constants/Colors";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "destructive"
  | "ghost"
  | "link";

export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  fullWidth = false,
  style,
  textStyle,
  testID,
}) => {
  const colorScheme = useColorScheme();

  // Get button styles based on variant and state
  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: BorderRadius.button,
      ...getSizeStyles(),
    };

    if (fullWidth) {
      baseStyle.width = "100%";
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].primary,
          ...Shadows.small,
        };

      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].backgroundSecondary,
          borderWidth: 1,
          borderColor: Colors[colorScheme ?? "light"].border,
        };

      case "tertiary":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].gray6,
          borderWidth: 1,
          borderColor: Colors[colorScheme ?? "light"].separator,
        };

      case "destructive":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].error,
          ...Shadows.small,
        };

      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };

      case "link":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          paddingHorizontal: 0,
          paddingVertical: 0,
          minHeight: "auto" as ViewStyle["minHeight"],
        };

      default:
        return baseStyle;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: ComponentSizes.button.small,
        };
      case "medium":
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: ComponentSizes.button.medium,
        };
      case "large":
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: ComponentSizes.button.large,
        };
      default:
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: ComponentSizes.button.medium,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled || loading) {
      return Colors[colorScheme ?? "light"].textTertiary;
    }

    switch (variant) {
      case "primary":
        return "#FFFFFF";
      case "destructive":
        return "#FFFFFF";
      case "secondary":
        return Colors[colorScheme ?? "light"].text;
      case "tertiary":
        return Colors[colorScheme ?? "light"].text;
      case "ghost":
        return Colors[colorScheme ?? "light"].primary;
      case "link":
        return Colors[colorScheme ?? "light"].link;
      default:
        return Colors[colorScheme ?? "light"].text;
    }
  };

  const getTextType = () => {
    switch (size) {
      case "small":
        return "footnoteEmphasized" as const;
      case "medium":
        return "calloutEmphasized" as const;
      case "large":
        return "bodyEmphasized" as const;
      default:
        return "calloutEmphasized" as const;
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator
            size="small"
            color={getTextColor()}
            style={{ marginRight: Spacing.sm }}
          />
          <ThemedText
            type={getTextType()}
            style={[{ color: getTextColor() }, textStyle]}
          >
            {title}
          </ThemedText>
        </>
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === "left" && (
            <div style={{ marginRight: Spacing.sm }}>{icon}</div>
          )}
          <ThemedText
            type={getTextType()}
            style={[{ color: getTextColor() }, textStyle]}
          >
            {title}
          </ThemedText>
          {iconPosition === "right" && (
            <div style={{ marginLeft: Spacing.sm }}>{icon}</div>
          )}
        </>
      );
    }

    return (
      <ThemedText
        type={getTextType()}
        style={[{ color: getTextColor() }, textStyle]}
      >
        {title}
      </ThemedText>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

// Convenience components for common button types
export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props,
) => <Button variant="primary" {...props} />;

export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props,
) => <Button variant="secondary" {...props} />;

export const TertiaryButton: React.FC<Omit<ButtonProps, "variant">> = (
  props,
) => <Button variant="tertiary" {...props} />;

export const DestructiveButton: React.FC<Omit<ButtonProps, "variant">> = (
  props,
) => <Button variant="destructive" {...props} />;

export const GhostButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="ghost" {...props} />
);

export const LinkButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="link" {...props} />
);

// Icon button component for square/circular buttons
export interface IconButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  circular?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  icon,
  variant = "secondary",
  size = "medium",
  disabled = false,
  loading = false,
  circular = false,
  style,
  testID,
}) => {
  const colorScheme = useColorScheme();

  const getIconButtonSize = () => {
    switch (size) {
      case "small":
        return ComponentSizes.button.small;
      case "medium":
        return ComponentSizes.button.medium;
      case "large":
        return ComponentSizes.button.large;
      default:
        return ComponentSizes.button.medium;
    }
  };

  const buttonSize = getIconButtonSize();

  const getIconButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: buttonSize,
      height: buttonSize,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: circular ? buttonSize / 2 : BorderRadius.button,
    };

    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    switch (variant) {
      case "primary":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].primary,
          ...Shadows.small,
        };

      case "secondary":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].backgroundSecondary,
          borderWidth: 1,
          borderColor: Colors[colorScheme ?? "light"].border,
        };

      case "tertiary":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].gray6,
          borderWidth: 1,
          borderColor: Colors[colorScheme ?? "light"].separator,
        };

      case "destructive":
        return {
          ...baseStyle,
          backgroundColor: Colors[colorScheme ?? "light"].error,
          ...Shadows.small,
        };

      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };

      default:
        return baseStyle;
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[getIconButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "destructive"
              ? "#FFFFFF"
              : Colors[colorScheme ?? "light"].text
          }
        />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
};
