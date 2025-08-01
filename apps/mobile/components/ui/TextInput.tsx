import React from "react";
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  TextInputProps,
} from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Spacing, BorderRadius } from "@/constants/DesignTokens";

interface ThemedTextInputProps extends TextInputProps {
  variant?: "default" | "outline";
  size?: "small" | "medium" | "large";
  multiline?: boolean;
}

export function TextInput({
  variant = "default",
  size = "medium",
  multiline = false,
  style,
  ...props
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme();

  const getInputHeight = () => {
    if (multiline) return 100;
    switch (size) {
      case "small":
        return 36;
      case "large":
        return 52;
      default:
        return 44;
    }
  };

  const inputStyles = [
    styles.input,
    {
      backgroundColor: Colors[colorScheme ?? "light"].gray6,
      borderColor: Colors[colorScheme ?? "light"].separator,
      color: Colors[colorScheme ?? "light"].text,
      height: getInputHeight(),
    },
    variant === "outline" && styles.outline,
    multiline && styles.multiline,
    style,
  ];

  return (
    <View style={styles.container}>
      <RNTextInput
        style={inputStyles}
        placeholderTextColor={Colors[colorScheme ?? "light"].textSecondary}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    lineHeight: 20,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  multiline: {
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },
});
