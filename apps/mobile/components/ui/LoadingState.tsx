import React from "react";
import { StyleSheet, View, ActivityIndicator, ViewStyle } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/DesignTokens";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "large";
  style?: ViewStyle;
  compact?: boolean;
}

export function LoadingState({
  message = "Loading...",
  size = "large",
  style,
  compact = false,
}: LoadingStateProps) {
  const colorScheme = useColorScheme();

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      <ActivityIndicator
        size={size}
        color={Colors[colorScheme ?? "light"].primary}
      />
      <ThemedText type="subheadline" hierarchy="secondary" style={styles.text}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: Spacing.xl,
    justifyContent: "center",
  },
  compact: {
    padding: Spacing.lg,
  },
  text: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
});
