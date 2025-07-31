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
  const [showFrequencySelector, setShowFrequencySelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!taskText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await addTask({
        text: taskText.trim(),
        frequency: frequency,
      });

      // Reset form
      setTaskText("");
      setFrequency(undefined);

      // Close modal with slight delay for better UX
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 100);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Failed to add task:", error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    // Reset form on close
    setTaskText("");
    setFrequency(undefined);
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
    outputRange: [300, 0],
  });

  const isFormValid = taskText.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors.background,
              borderColor: colors.separator,
              paddingBottom: Math.max(insets.bottom, Spacing.lg),
              transform: [{ translateY: slideTransform }],
            },
          ]}
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
                  style={[styles.closeIcon, { color: colors.textSecondary }]}
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
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Task Input Section */}
            <View style={styles.section}>
              <Headline style={styles.sectionTitle}>Task Description</Headline>
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
                  onChangeText={setTaskText}
                  placeholder="What would you like to accomplish?"
                  placeholderTextColor={colors.textPlaceholder}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  autoFocus
                  maxLength={500}
                />
              </View>
              {taskText.length > 0 && (
                <Caption1 hierarchy="secondary" style={styles.characterCount}>
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
                onPress={() => setShowFrequencySelector(true)}
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
        </Animated.View>

        {/* Frequency Selector Modal */}
        <FrequencySelector
          visible={showFrequencySelector}
          onClose={() => setShowFrequencySelector(false)}
          onSelect={(freq) => setFrequency(freq)}
          initialFrequency={frequency}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    maxHeight: "90%",
    minHeight: "60%",
    ...Shadows.large,
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
