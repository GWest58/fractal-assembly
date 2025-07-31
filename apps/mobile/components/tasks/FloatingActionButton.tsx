import React from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "@/hooks/useThemeColor";

interface FloatingActionButtonProps {
  onPress: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
}) => {
  const insets = useSafeAreaInsets();

  // Theme colors
  const fabBackgroundColor = useThemeColor(
    { light: "#007AFF", dark: "#007AFF" },
    "tint",
  );
  const shadowColor = useThemeColor({ light: "#000", dark: "#000" }, "text");

  // Calculate bottom position based on platform and safe area
  const bottomPosition = Platform.select({
    ios: insets.bottom + 90, // Tab bar height + padding
    android: 90,
    default: 90,
  });

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          bottom: bottomPosition,
          backgroundColor: fabBackgroundColor,
          shadowColor: shadowColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ThemedText style={styles.fabText}>+</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 1000,
  },
  fabText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
