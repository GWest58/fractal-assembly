import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ThemedText,
  Title2,
  Headline,
  Body,
  Callout,
  Caption1,
  Caption2,
} from "@/components/ThemedText";
import {
  PrimaryButton,
  SecondaryButton,
  IconButton,
} from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  ComponentSizes,
} from "@/constants/DesignTokens";
import {
  FrequencyType,
  TaskFrequency,
  DayOfWeek,
  FrequencyData,
} from "@/types/Task";

interface FrequencySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (frequency: TaskFrequency | undefined) => void;
  initialFrequency?: TaskFrequency;
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
  { key: "sunday", label: "Sunday", short: "Sun" },
];

const FREQUENCY_OPTIONS: {
  key: FrequencyType | "once";
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    key: "once",
    label: "One-time",
    description: "Complete once and done",
    icon: "📝",
  },
  { key: "daily", label: "Daily", description: "Every day", icon: "🌅" },
  {
    key: "specific_days",
    label: "Specific Days",
    description: "Choose which days",
    icon: "📅",
  },
  {
    key: "times_per_week",
    label: "Times per Week",
    description: "X times each week",
    icon: "📊",
  },
  {
    key: "times_per_month",
    label: "Times per Month",
    description: "X times each month",
    icon: "🗓️",
  },
];

export const FrequencySelector: React.FC<FrequencySelectorProps> = ({
  visible,
  onClose,
  onSelect,
  initialFrequency,
}) => {
  const [selectedType, setSelectedType] = useState<FrequencyType | "once">(
    initialFrequency?.type || "once",
  );
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(
    initialFrequency?.data.days || [],
  );
  const [timesCount, setTimesCount] = useState<number>(
    initialFrequency?.data.count || 3,
  );
  const [hasTime, setHasTime] = useState<boolean>(!!initialFrequency?.time);
  const [selectedTime, setSelectedTime] = useState<string>(
    initialFrequency?.time || "09:00",
  );

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

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleTimeCountChange = (increment: boolean) => {
    setTimesCount((prev) => {
      const newCount = increment ? prev + 1 : prev - 1;
      return Math.max(1, Math.min(31, newCount));
    });
  };

  const handleTimeChange = (increment: boolean, type: "hour" | "minute") => {
    const [hours, minutes] = selectedTime.split(":").map(Number);
    let newHours = hours;
    let newMinutes = minutes;

    if (type === "hour") {
      newHours = increment ? (hours + 1) % 24 : (hours - 1 + 24) % 24;
    } else {
      newMinutes = increment ? (minutes + 15) % 60 : (minutes - 15 + 60) % 60;
    }

    setSelectedTime(
      `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`,
    );
  };

  const handleSave = () => {
    if (selectedType === "once") {
      onSelect(undefined);
      onClose();
      return;
    }

    let data: FrequencyData = {};

    switch (selectedType) {
      case "specific_days":
        data = { days: selectedDays };
        break;
      case "times_per_week":
      case "times_per_month":
        data = { count: timesCount };
        break;
      default:
        data = {};
    }

    const frequency: TaskFrequency = {
      type: selectedType,
      data,
      time: hasTime ? selectedTime : undefined,
    };

    onSelect(frequency);
    onClose();
  };

  const getFrequencyDescription = () => {
    switch (selectedType) {
      case "once":
        return "Complete once and done";
      case "daily":
        return hasTime ? `Every day at ${selectedTime}` : "Every day";
      case "specific_days":
        if (selectedDays.length === 0) return "Select days";
        const dayLabels = selectedDays
          .map((day) => DAYS_OF_WEEK.find((d) => d.key === day)?.short)
          .filter(Boolean);
        const timeStr = hasTime ? ` at ${selectedTime}` : "";
        return `${dayLabels.join(", ")}${timeStr}`;
      case "times_per_week":
        const weekTimeStr = hasTime ? ` at ${selectedTime}` : "";
        return `${timesCount}× per week${weekTimeStr}`;
      case "times_per_month":
        const monthTimeStr = hasTime ? ` at ${selectedTime}` : "";
        return `${timesCount}× per month${monthTimeStr}`;
      default:
        return "";
    }
  };

  const isValidSelection = () => {
    if (selectedType === "once" || selectedType === "daily") {
      return true;
    }
    if (selectedType === "specific_days") {
      return selectedDays.length > 0;
    }
    return true;
  };

  const slideTransform = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const renderFrequencyOptions = () => (
    <View style={styles.section}>
      <Headline style={styles.sectionTitle}>Frequency Type</Headline>
      <View style={styles.optionsGrid}>
        {FREQUENCY_OPTIONS.map((option) => {
          const isSelected = selectedType === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.frequencyOption,
                {
                  backgroundColor: isSelected
                    ? colors.primary + "15"
                    : colors.backgroundSecondary,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedType(option.key)}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.optionIcon}>{option.icon}</ThemedText>
              <Callout
                style={[
                  styles.optionLabel,
                  { color: isSelected ? colors.primary : colors.text },
                ]}
              >
                {option.label}
              </Callout>
              <Caption1 hierarchy="secondary" style={styles.optionDescription}>
                {option.description}
              </Caption1>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSpecificDaysSelector = () => {
    if (selectedType !== "specific_days") return null;

    return (
      <View style={styles.section}>
        <Headline style={styles.sectionTitle}>Select Days</Headline>
        <View style={styles.daysGrid}>
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDays.includes(day.key);
            return (
              <TouchableOpacity
                key={day.key}
                style={[
                  styles.dayButton,
                  {
                    backgroundColor: isSelected
                      ? colors.primary
                      : colors.backgroundSecondary,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleDay(day.key)}
                activeOpacity={0.7}
              >
                <Caption2
                  style={[
                    styles.dayShort,
                    { color: isSelected ? "#FFFFFF" : colors.text },
                  ]}
                >
                  {day.short}
                </Caption2>
                <Caption1
                  style={[
                    styles.dayLabel,
                    { color: isSelected ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {day.label}
                </Caption1>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderCountSelector = () => {
    if (selectedType !== "times_per_week" && selectedType !== "times_per_month")
      return null;

    const unitLabel =
      selectedType === "times_per_week" ? "per week" : "per month";

    return (
      <View style={styles.section}>
        <Headline style={styles.sectionTitle}>How Many Times</Headline>
        <View
          style={[
            styles.countSelector,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
            },
          ]}
        >
          <IconButton
            onPress={() => handleTimeCountChange(false)}
            icon={
              <ThemedText style={[styles.countButton, { color: colors.text }]}>
                −
              </ThemedText>
            }
            variant="ghost"
            size="small"
            disabled={timesCount <= 1}
          />
          <View style={styles.countDisplay}>
            <ThemedText type="title3" style={styles.countNumber}>
              {timesCount}
            </ThemedText>
            <Caption1 hierarchy="secondary" style={styles.countUnit}>
              {unitLabel}
            </Caption1>
          </View>
          <IconButton
            onPress={() => handleTimeCountChange(true)}
            icon={
              <ThemedText style={[styles.countButton, { color: colors.text }]}>
                +
              </ThemedText>
            }
            variant="ghost"
            size="small"
            disabled={timesCount >= 31}
          />
        </View>
      </View>
    );
  };

  const renderTimeSelector = () => {
    if (selectedType === "once") return null;

    return (
      <View style={styles.section}>
        <View style={styles.timeSectionHeader}>
          <Headline style={styles.sectionTitle}>Specific Time</Headline>
          <Switch
            value={hasTime}
            onValueChange={setHasTime}
            trackColor={{
              false: colors.gray5,
              true: colors.primary + "40",
            }}
            thumbColor={hasTime ? colors.primary : colors.gray3}
          />
        </View>

        {hasTime && (
          <View
            style={[
              styles.timeSelector,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Hour Selector */}
            <View style={styles.timeUnit}>
              <IconButton
                onPress={() => handleTimeChange(true, "hour")}
                icon={
                  <ThemedText
                    style={[styles.timeButton, { color: colors.text }]}
                  >
                    ▲
                  </ThemedText>
                }
                variant="ghost"
                size="small"
              />
              <ThemedText type="title2" style={styles.timeValue}>
                {selectedTime.split(":")[0]}
              </ThemedText>
              <IconButton
                onPress={() => handleTimeChange(false, "hour")}
                icon={
                  <ThemedText
                    style={[styles.timeButton, { color: colors.text }]}
                  >
                    ▼
                  </ThemedText>
                }
                variant="ghost"
                size="small"
              />
              <Caption1 hierarchy="secondary" style={styles.timeLabel}>
                Hour
              </Caption1>
            </View>

            <ThemedText type="title2" style={styles.timeSeparator}>
              :
            </ThemedText>

            {/* Minute Selector */}
            <View style={styles.timeUnit}>
              <IconButton
                onPress={() => handleTimeChange(true, "minute")}
                icon={
                  <ThemedText
                    style={[styles.timeButton, { color: colors.text }]}
                  >
                    ▲
                  </ThemedText>
                }
                variant="ghost"
                size="small"
              />
              <ThemedText type="title2" style={styles.timeValue}>
                {selectedTime.split(":")[1]}
              </ThemedText>
              <IconButton
                onPress={() => handleTimeChange(false, "minute")}
                icon={
                  <ThemedText
                    style={[styles.timeButton, { color: colors.text }]}
                  >
                    ▼
                  </ThemedText>
                }
                variant="ghost"
                size="small"
              />
              <Caption1 hierarchy="secondary" style={styles.timeLabel}>
                Min
              </Caption1>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPreview = () => (
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
        <View style={styles.previewContent}>
          <ThemedText style={styles.previewIcon}>
            {FREQUENCY_OPTIONS.find((o) => o.key === selectedType)?.icon ||
              "📝"}
          </ThemedText>
          <View style={styles.previewText}>
            <Body style={styles.previewDescription}>
              {getFrequencyDescription()}
            </Body>
            <Caption1 hierarchy="secondary" style={styles.previewType}>
              {FREQUENCY_OPTIONS.find((o) => o.key === selectedType)?.label ||
                "One-time"}
            </Caption1>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="overFullScreen"
      transparent
      onRequestClose={onClose}
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
            onPress={onClose}
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
              <Title2 style={styles.title}>Frequency Settings</Title2>
              <Caption1 hierarchy="secondary" style={styles.subtitle}>
                How often should this task repeat?
              </Caption1>
            </View>
            <IconButton
              onPress={onClose}
              icon={
                <ThemedText
                  style={[styles.closeIcon, { color: colors.textSecondary }]}
                >
                  ✕
                </ThemedText>
              }
              variant="ghost"
              size="medium"
            />
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {renderFrequencyOptions()}
            {renderSpecificDaysSelector()}
            {renderCountSelector()}
            {renderTimeSelector()}
            {renderPreview()}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <PrimaryButton
              title="Save Frequency"
              onPress={handleSave}
              disabled={!isValidSelection()}
              fullWidth
              style={styles.saveButton}
            />
            <SecondaryButton
              title="Cancel"
              onPress={onClose}
              fullWidth
              style={styles.cancelButton}
            />
          </View>
        </Animated.View>
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
    minHeight: "70%",
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
  optionsGrid: {
    gap: Spacing.md,
  },
  frequencyOption: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    alignItems: "center",
    ...Shadows.small,
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  optionLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
    textAlign: "center",
  },
  optionDescription: {
    textAlign: "center",
    lineHeight: 16,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  dayButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 80,
    ...Shadows.small,
  },
  dayShort: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  dayLabel: {
    fontSize: 10,
    textAlign: "center",
  },
  countSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  countDisplay: {
    alignItems: "center",
    flex: 1,
  },
  countNumber: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  countUnit: {
    textAlign: "center",
  },
  countButton: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
  timeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.lg,
    ...Shadows.small,
  },
  timeUnit: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  timeButton: {
    fontSize: 14,
    fontWeight: "600",
  },
  timeValue: {
    fontWeight: "700",
    minWidth: 50,
    textAlign: "center",
  },
  timeLabel: {
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeSeparator: {
    fontWeight: "700",
    opacity: 0.5,
  },
  previewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  previewContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  previewIcon: {
    fontSize: 24,
  },
  previewText: {
    flex: 1,
  },
  previewDescription: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  previewType: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  actionSection: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  saveButton: {
    minHeight: ComponentSizes.button.large,
  },
  cancelButton: {
    minHeight: ComponentSizes.button.medium,
  },
});
