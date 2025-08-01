import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  Title2,
  Headline,
  Body,
  Callout,
  Caption1,
} from "@/components/ThemedText";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "@/components/ui/Button";
import { useTask } from "@/contexts/TaskContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  Typography,
  ComponentSizes,
} from "@/constants/DesignTokens";
import { FrequencySelector } from "./FrequencySelector";
import { TaskFrequency } from "@/types/Task";

import { DurationInput } from "../DurationInput";

interface AddTaskFormProps {
  visible: boolean;
  onClose: () => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({
  visible,
  onClose,
}) => {
  const { addTask } = useTask();
  const [taskText, setTaskText] = useState("");
  const [frequency, setFrequency] = useState<TaskFrequency | undefined>(
    undefined,
  );
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [showFrequencySelector, setShowFrequencySelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Simple slide animation
  const slideAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  // Simple slide animation
  useEffect(() => {
    if (visible) {
      // Reset to starting position
      slideAnim.setValue(1);
      fadeAnim.setValue(0);

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Faster animate out to reduce flicker
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Reset form when modal closes with delay to prevent flicker
  useEffect(() => {
    if (!visible) {
      // Longer delay to ensure close animation completes
      setTimeout(() => {
        setTaskText("");
        setFrequency(undefined);
        setDurationSeconds(0);
        setHasUserInteracted(false);
        setIsSubmitting(false);
      }, 350);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!taskText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Add task first
      await addTask({
        text: taskText.trim(),
        frequency: frequency,
        durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
      });

      // Close modal after successful creation with minimal delay
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error("Failed to add task:", error);
      setIsSubmitting(false);
      // Close modal anyway to prevent stuck state
      setTimeout(() => {
        onClose();
      }, 100);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    // Dismiss keyboard first
    Keyboard.dismiss();

    // Close immediately
    onClose();
  };

  const getFrequencyDisplayText = () => {
    if (!frequency) return "One-time task";

    switch (frequency.type) {
      case "daily":
        return frequency.time ? `Daily at ${frequency.time}` : "Daily";
      case "specific_days":
        const days = frequency.data.days?.join(", ") || "";
        const timeStr = frequency.time ? ` at ${frequency.time}` : "";
        return days ? `${days}${timeStr}` : "Select days";
      case "times_per_week":
        const weekTimeStr = frequency.time ? ` at ${frequency.time}` : "";
        return `${frequency.data.count || 3}× per week${weekTimeStr}`;
      case "times_per_month":
        const monthTimeStr = frequency.time ? ` at ${frequency.time}` : "";
        return `${frequency.data.count || 3}× per month${monthTimeStr}`;
      default:
        return "One-time task";
    }
  };

  const getFrequencyIcon = () => {
    if (!frequency) return "📝";
    switch (frequency.type) {
      case "daily":
        return "🌅";
      case "specific_days":
        return "📅";
      case "times_per_week":
        return "📊";
      case "times_per_month":
        return "🗓️";
      default:
        return "📝";
    }
  };

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: Platform.OS === "web" ? [0, 0] : [0, 600],
  });

  const animatedModalStyle =
    Platform.OS === "web"
      ? {
          opacity: fadeAnim,
          transform: [
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        }
      : {
          transform: [{ translateY: slideTransform }],
        };

  const staticModalStyle = {
    backgroundColor: colors.background,
    borderColor: colors.separator,
    paddingBottom: Math.max(insets.bottom, Spacing.lg),
    paddingTop: Platform.OS === "web" ? Spacing.lg : 0,
    height: Platform.OS === "web" ? 700 : "85%",
    maxHeight: Platform.OS === "web" ? 700 : "85%",
    minHeight: Platform.OS === "web" ? 700 : undefined,
  };

  const isFormValid = taskText.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backdropTouch}
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View style={animatedModalStyle}>
          {Platform.OS === "web" ? (
            <View style={[styles.modalContainer, staticModalStyle as any]}>
              {/* Handle Bar */}
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handle,
                    {
                      backgroundColor: colors.separator,
                    },
                  ]}
                />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Title2 style={styles.title}>Add New Task</Title2>
                  <Caption1 hierarchy="secondary" style={styles.subtitle}>
                    Create a task to build better habits
                  </Caption1>
                </View>
                <IconButton
                  onPress={handleClose}
                  icon={
                    <ThemedText
                      style={
                        [
                          styles.closeIcon,
                          { color: colors.textSecondary },
                        ] as any
                      }
                    >
                      ✕
                    </ThemedText>
                  }
                  variant="ghost"
                  size="medium"
                  disabled={isSubmitting}
                />
              </View>

              <ScrollView
                ref={scrollViewRef}
                style={[styles.content, { flex: 1 }]}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.contentContainer}
                scrollEventThrottle={16}
                nestedScrollEnabled={true}
              >
                {/* Task Input Section */}
                <View style={styles.section}>
                  <Headline style={styles.sectionTitle}>
                    Task Description
                  </Headline>

                  <View
                    style={
                      [
                        styles.inputContainer,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: colors.border,
                        },
                      ] as any
                    }
                  >
                    <TextInput
                      style={
                        [
                          styles.textInput,
                          {
                            color: colors.text,
                            ...Typography.body,
                          },
                        ] as any
                      }
                      value={taskText}
                      onChangeText={(text) => {
                        setTaskText(text);
                        if (!hasUserInteracted) {
                          setHasUserInteracted(true);
                        }
                      }}
                      onFocus={() => {
                        if (!hasUserInteracted) {
                          setHasUserInteracted(true);
                        }
                      }}
                      autoFocus={false}
                      placeholder="What would you like to accomplish?"
                      placeholderTextColor={colors.textPlaceholder}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                  </View>
                  {taskText.length > 0 && (
                    <Caption1
                      hierarchy="secondary"
                      style={styles.characterCount}
                    >
                      {taskText.length}/500 characters
                    </Caption1>
                  )}
                </View>

                {/* Frequency Section */}
                <View style={styles.section}>
                  <Headline style={styles.sectionTitle}>Frequency</Headline>
                  <TouchableOpacity
                    style={[
                      styles.frequencySelector,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimeout(() => setShowFrequencySelector(true), 100);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.frequencyContent}>
                      <View style={styles.frequencyMain}>
                        <ThemedText style={styles.frequencyIcon}>
                          {getFrequencyIcon()}
                        </ThemedText>
                        <View style={styles.frequencyTextContainer}>
                          <Callout style={styles.frequencyText}>
                            {getFrequencyDisplayText()}
                          </Callout>
                          <Caption1
                            hierarchy="secondary"
                            style={styles.frequencyHint}
                          >
                            {frequency
                              ? "Tap to change"
                              : "Choose when to repeat this task"}
                          </Caption1>
                        </View>
                      </View>
                      <ThemedText
                        style={[
                          styles.frequencyArrow,
                          { color: colors.textTertiary },
                        ]}
                      >
                        ›
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Duration Section */}
                <View style={styles.section}>
                  <Headline style={styles.sectionTitle}>
                    Duration (Optional)
                  </Headline>
                  <DurationInput
                    initialDuration={durationSeconds}
                    onDurationChange={setDurationSeconds}
                    placeholder="e.g., 5 minutes, 25 min, 1:30"
                    showPresets={true}
                  />
                </View>

                {/* Task Preview */}
                {isFormValid && (
                  <View style={styles.section}>
                    <Headline style={styles.sectionTitle}>Preview</Headline>
                    <View
                      style={
                        [
                          styles.previewCard,
                          {
                            backgroundColor: colors.backgroundTertiary,
                            borderColor: colors.separator,
                          },
                        ] as any
                      }
                    >
                      <View style={styles.previewHeader}>
                        <View
                          style={[
                            styles.previewCheckbox,
                            {
                              borderColor: colors.primary,
                            },
                          ]}
                        />
                        <View style={styles.previewContent}>
                          <Body style={styles.previewText}>{taskText}</Body>
                          {frequency && (
                            <Caption1
                              hierarchy="secondary"
                              style={styles.previewFrequency}
                            >
                              {getFrequencyDisplayText()}
                            </Caption1>
                          )}
                          {durationSeconds > 0 && (
                            <Caption1
                              hierarchy="secondary"
                              style={styles.previewFrequency}
                            >
                              Duration: {Math.floor(durationSeconds / 60)}:
                              {(durationSeconds % 60)
                                .toString()
                                .padStart(2, "0")}
                            </Caption1>
                          )}
                        </View>
                        {frequency && (
                          <View
                            style={[
                              styles.previewBadge,
                              {
                                backgroundColor: colors.primary,
                              },
                            ]}
                          >
                            <Caption1
                              style={
                                [
                                  styles.previewBadgeText,
                                  { color: "#FFFFFF" },
                                ] as any
                              }
                            >
                              {frequency.type === "daily" ? "DAILY" : "HABIT"}
                            </Caption1>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <PrimaryButton
                  title={isSubmitting ? "Creating..." : "Create Task"}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  loading={isSubmitting}
                  fullWidth
                  style={styles.createButton}
                />
                <SecondaryButton
                  title="Cancel"
                  onPress={handleClose}
                  disabled={isSubmitting}
                  fullWidth
                  style={styles.cancelButton}
                />
              </View>
            </View>
          ) : (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={[styles.modalContainer, staticModalStyle as any]}
            >
              {/* Handle Bar */}
              <View style={styles.handleContainer}>
                <View
                  style={[
                    styles.handle,
                    {
                      backgroundColor: colors.separator,
                    },
                  ]}
                />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Title2 style={styles.title}>Add New Task</Title2>
                  <Caption1 hierarchy="secondary" style={styles.subtitle}>
                    Create a task to build better habits
                  </Caption1>
                </View>
                <IconButton
                  onPress={handleClose}
                  icon={
                    <ThemedText
                      style={
                        [
                          styles.closeIcon,
                          { color: colors.textSecondary },
                        ] as any
                      }
                    >
                      ✕
                    </ThemedText>
                  }
                  variant="ghost"
                  size="medium"
                  disabled={isSubmitting}
                />
              </View>

              <ScrollView
                ref={scrollViewRef}
                style={[styles.content, { flex: 1 }]}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.contentContainer}
                scrollEventThrottle={16}
              >
                {/* Task Input Section */}
                <View style={styles.section}>
                  <Headline style={styles.sectionTitle}>
                    Task Description
                  </Headline>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          color: colors.text,
                          ...Typography.body,
                        },
                      ]}
                      value={taskText}
                      onChangeText={(text) => {
                        setTaskText(text);
                        if (!hasUserInteracted) {
                          setHasUserInteracted(true);
                        }
                      }}
                      onFocus={() => {
                        if (!hasUserInteracted) {
                          setHasUserInteracted(true);
                        }
                      }}
                      autoFocus={false}
                      placeholder="What would you like to accomplish?"
                      placeholderTextColor={colors.textPlaceholder}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      maxLength={500}
                    />
                  </View>
                  {taskText.length > 0 && (
                    <Caption1
                      hierarchy="secondary"
                      style={styles.characterCount}
                    >
                      {taskText.length}/500 characters
                    </Caption1>
                  )}
                </View>

                {/* Frequency Section */}
                <View style={styles.section}>
                  <Headline style={styles.sectionTitle}>Frequency</Headline>
                  <TouchableOpacity
                    style={[
                      styles.frequencySelector,
                      {
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setTimeout(() => setShowFrequencySelector(true), 100);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.frequencyContent}>
                      <View style={styles.frequencyMain}>
                        <ThemedText style={styles.frequencyIcon}>
                          {getFrequencyIcon()}
                        </ThemedText>
                        <View style={styles.frequencyTextContainer}>
                          <Callout style={styles.frequencyText}>
                            {getFrequencyDisplayText()}
                          </Callout>
                          <Caption1
                            hierarchy="secondary"
                            style={styles.frequencyHint}
                          >
                            {frequency
                              ? "Tap to change"
                              : "Choose when to repeat this task"}
                          </Caption1>
                        </View>
                      </View>
                      <ThemedText
                        style={[
                          styles.frequencyArrow,
                          { color: colors.textTertiary },
                        ]}
                      >
                        ›
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Duration Section */}
                <View style={styles.section}>
                  <Headline style={styles.sectionTitle}>
                    Duration (Optional)
                  </Headline>
                  <DurationInput
                    initialDuration={durationSeconds}
                    onDurationChange={setDurationSeconds}
                    placeholder="e.g., 5 minutes, 25 min, 1:30"
                    showPresets={true}
                  />
                </View>

                {/* Task Preview */}
                {isFormValid && (
                  <View style={styles.section}>
                    <Headline style={styles.sectionTitle}>Preview</Headline>
                    <View
                      style={[
                        styles.previewCard,
                        {
                          backgroundColor: colors.backgroundTertiary,
                          borderColor: colors.separator,
                        },
                      ]}
                    >
                      <View style={styles.previewHeader}>
                        <View
                          style={[
                            styles.previewCheckbox,
                            {
                              borderColor: colors.primary,
                            },
                          ]}
                        />
                        <View style={styles.previewContent}>
                          <Body style={styles.previewText}>{taskText}</Body>
                          {frequency && (
                            <Caption1
                              hierarchy="secondary"
                              style={styles.previewFrequency}
                            >
                              {getFrequencyDisplayText()}
                            </Caption1>
                          )}
                          {durationSeconds > 0 && (
                            <Caption1
                              hierarchy="secondary"
                              style={styles.previewFrequency}
                            >
                              Duration: {Math.floor(durationSeconds / 60)}:
                              {(durationSeconds % 60)
                                .toString()
                                .padStart(2, "0")}
                            </Caption1>
                          )}
                        </View>
                        {frequency && (
                          <View
                            style={[
                              styles.previewBadge,
                              {
                                backgroundColor: colors.primary,
                              },
                            ]}
                          >
                            <Caption1
                              style={[
                                styles.previewBadgeText,
                                { color: "#FFFFFF" },
                              ]}
                            >
                              {frequency.type === "daily" ? "DAILY" : "HABIT"}
                            </Caption1>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <PrimaryButton
                  title={isSubmitting ? "Creating..." : "Create Task"}
                  onPress={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  loading={isSubmitting}
                  fullWidth
                  style={styles.createButton}
                />
                <SecondaryButton
                  title="Cancel"
                  onPress={handleClose}
                  disabled={isSubmitting}
                  fullWidth
                  style={styles.cancelButton}
                />
              </View>
            </KeyboardAvoidingView>
          )}
        </Animated.View>
      </View>

      {/* Frequency Selector Modal */}
      <FrequencySelector
        visible={showFrequencySelector}
        onClose={() => setShowFrequencySelector(false)}
        onSelect={(freq) => setFrequency(freq)}
        initialFrequency={frequency}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: Platform.OS === "web" ? "center" : "stretch",
    paddingHorizontal: Platform.OS === "web" ? 20 : 0,
    paddingVertical: Platform.OS === "web" ? 20 : 0,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderBottomLeftRadius: Platform.OS === "web" ? BorderRadius.xl : 0,
    borderBottomRightRadius: Platform.OS === "web" ? BorderRadius.xl : 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: Platform.OS === "web" ? StyleSheet.hairlineWidth : 0,
    ...Shadows.large,
    ...(Platform.OS === "web" && {
      width: 1400,
      maxWidth: "95vw" as any,
      minWidth: 1200,
    }),
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.lg,
    paddingTop: Platform.OS === "web" ? Spacing.md : 0,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
    fontWeight: "700",
  },
  subtitle: {
    lineHeight: 18,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },

  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  inputContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    ...Shadows.small,
  },
  textInput: {
    minHeight: 100,
    textAlignVertical: "top",
    padding: 0,
    margin: 0,
  },
  characterCount: {
    marginTop: Spacing.sm,
    textAlign: "right",
  },
  frequencySelector: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  frequencyContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  frequencyMain: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  frequencyIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  frequencyTextContainer: {
    flex: 1,
  },
  frequencyText: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  frequencyHint: {
    fontStyle: "italic",
  },
  frequencyArrow: {
    fontSize: 20,
    fontWeight: "600",
  },
  previewCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadows.small,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  previewCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    marginTop: Spacing.xs,
  },
  previewContent: {
    flex: 1,
  },
  previewText: {
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  previewFrequency: {
    fontStyle: "italic",
  },
  previewBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: "flex-start",
  },
  previewBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  actionSection: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  createButton: {
    minHeight: ComponentSizes.button.large,
  },
  cancelButton: {
    minHeight: ComponentSizes.button.medium,
  },
});
