import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  View,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Spacing, Shadows, Layout } from "@/constants/DesignTokens";

interface FloatingActionButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [rotateAnim] = React.useState(new Animated.Value(0));

  // Calculate bottom position based on platform and safe area
  const bottomPosition = Platform.select({
    ios: insets.bottom + Layout.tabBar.height + Spacing.md,
    android: Layout.tabBar.height + Spacing.md,
    default: Layout.tabBar.height + Spacing.md,
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 5,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Subtle rotation animation for feedback
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      onPress();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const fabBackgroundColor = disabled ? colors.gray4 : colors.primary;

  const shadowStyle = Platform.select({
    ios: {
      ...Shadows.xl,
      shadowColor: fabBackgroundColor,
    },
    android: {
      elevation: 12,
    },
    default: Shadows.xl,
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomPosition,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: fabBackgroundColor,
          },
          shadowStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel="Add new task"
        accessibilityHint="Creates a new task"
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <View style={[styles.loadingDot, styles.loadingDot1]} />
              <View style={[styles.loadingDot, styles.loadingDot2]} />
              <View style={[styles.loadingDot, styles.loadingDot3]} />
            </View>
          ) : (
            <ThemedText style={styles.plusIcon}>+</ThemedText>
          )}
        </Animated.View>

        {/* Ripple effect overlay for Android */}
        {Platform.OS === "android" && (
          <View style={styles.rippleOverlay} pointerEvents="none" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: Layout.screenPadding,
    zIndex: 1000,
  },
  fab: {
    width: Layout.floatingActionButton.size,
    height: Layout.floatingActionButton.size,
    borderRadius: Layout.floatingActionButton.size / 2,
    justifyContent: "center",
    alignItems: "center",
    // iOS specific styling
    ...Platform.select({
      ios: {
        borderWidth: 0.5,
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
    }),
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: {
    fontSize: 28,
    fontWeight: "300",
    color: "#FFFFFF",
    lineHeight: 32,
    textAlign: "center",
    // Slightly offset for better visual balance
    marginTop: Platform.select({
      ios: -2,
      android: -1,
      default: 0,
    }),
  },
  loadingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 32,
    height: 32,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 1,
    opacity: 0.6,
  },
  loadingDot1: {
    animationDelay: "0ms",
  },
  loadingDot2: {
    animationDelay: "150ms",
  },
  loadingDot3: {
    animationDelay: "300ms",
  },
  rippleOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Layout.floatingActionButton.size / 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    opacity: 0,
  },
});
