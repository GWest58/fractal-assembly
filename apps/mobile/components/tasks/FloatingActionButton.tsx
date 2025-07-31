import React, { useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  View,
  Easing,
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
  modalVisible?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  disabled = false,
  loading = false,
  modalVisible = false,
}) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [rotateAnim] = React.useState(new Animated.Value(0));
  const [pulseAnim] = React.useState(new Animated.Value(1));
  const [glowAnim] = React.useState(new Animated.Value(0));

  // Calculate bottom position based on platform and safe area
  const bottomPosition = Platform.select({
    ios: insets.bottom + Layout.tabBar.height + Spacing.md,
    android: Layout.tabBar.height + Spacing.md,
    default: Layout.tabBar.height + Spacing.md,
  });

  // Pulse animation when modal is visible
  useEffect(() => {
    if (modalVisible) {
      // Start subtle glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [modalVisible]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 200,
      friction: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 6,
    }).start();
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Enhanced press animation with bounce
      Animated.parallel([
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.spring(pulseAnim, {
            toValue: 1.1,
            tension: 300,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(pulseAnim, {
            toValue: 1,
            tension: 300,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      onPress();
    }
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  const fabBackgroundColor = disabled ? colors.gray4 : colors.primary;

  const shadowStyle =
    Platform.select({
      ios: {
        ...Shadows.xl,
        shadowColor: fabBackgroundColor,
      },
      android: {
        elevation: 12,
      },
    }) || Shadows.xl;

  return (
    <View style={[styles.container, { bottom: bottomPosition }]}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
            backgroundColor: fabBackgroundColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: scaleAnim }, { scale: pulseAnim }],
          },
          shadowStyle,
        ]}
      >
        <TouchableOpacity
          style={[
            styles.fab,
            {
              backgroundColor: fabBackgroundColor,
            },
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: Layout.screenPadding,
    zIndex: 1000,
  },
  glowContainer: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    top: -5,
    left: -5,
    opacity: 0.3,
  },
  fabContainer: {
    position: "relative",
  },
  fab: {
    width: Layout.floatingActionButton.size,
    height: Layout.floatingActionButton.size,
    borderRadius: Layout.floatingActionButton.size / 2,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  plusIcon: {
    fontSize: 24,
    fontWeight: "300",
    color: "#FFFFFF",
    lineHeight: 24,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  loadingDot1: {
    opacity: 0.4,
  },
  loadingDot2: {
    opacity: 0.7,
  },
  loadingDot3: {
    opacity: 1,
  },
  rippleOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: Layout.floatingActionButton.size / 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
