import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  FrequencyType,
  TaskFrequency,
  DayOfWeek,
  FrequencyData,
} from "@/types/Task";

interface FrequencySelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (frequency: TaskFrequency) => void;
  initialFrequency?: TaskFrequency;
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const FREQUENCY_OPTIONS: {
  key: FrequencyType | "once";
  label: string;
  description: string;
}[] = [
  { key: "once", label: "One-time", description: "Complete once and done" },
  { key: "daily", label: "Daily", description: "Every day" },
  {
    key: "specific_days",
    label: "Specific Days",
    description: "Choose which days",
  },
  {
    key: "times_per_week",
    label: "Times per Week",
    description: "X times each week",
  },
  {
    key: "times_per_month",
    label: "Times per Month",
    description: "X times each month",
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

  // Theme colors
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1e1e1e" },
    "background",
  );

  const borderColor = useThemeColor({ light: "#e1e1e1", dark: "#333" }, "text");
  const primaryColor = "#007AFF";
  const secondaryColor = "#FF6B35";
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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
      onSelect(undefined); // No frequency for one-time tasks
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
        const dayLabels = selectedDays.map(
          (day) => DAYS_OF_WEEK.find((d) => d.key === day)?.label,
        );
        const timeStr = hasTime ? ` at ${selectedTime}` : "";
        return `${dayLabels.join(", ")}${timeStr}`;
      case "times_per_week":
        const weekTimeStr = hasTime ? ` at ${selectedTime}` : "";
        return `${timesCount} times per week${weekTimeStr}`;
      case "times_per_month":
        const monthTimeStr = hasTime ? ` at ${selectedTime}` : "";
        return `${timesCount} times per month${monthTimeStr}`;
      default:
        return "";
    }
  };

  const isValidSelection = () => {
    if (selectedType === "once") {
      return true;
    }
    if (selectedType === "specific_days") {
      return selectedDays.length > 0;
    }
    return true;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText
            type="title"
            style={[styles.title, { color: primaryColor }]}
          >
            Frequency Settings
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Frequency Type Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>How often?</ThemedText>
            {FREQUENCY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  { borderColor },
                  selectedType === option.key && {
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  },
                ]}
                onPress={() => setSelectedType(option.key)}
              >
                <View style={styles.optionContent}>
                  <ThemedText
                    style={[
                      styles.optionLabel,
                      selectedType === option.key && { color: "#ffffff" },
                    ]}
                  >
                    {option.label}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.optionDescription,
                      { opacity: isDark ? 0.9 : 0.7 },
                      selectedType === option.key && {
                        color: "#ffffff",
                        opacity: 0.95,
                      },
                    ]}
                  >
                    {option.description}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Specific Days Selection */}
          {selectedType === "specific_days" && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Select Days</ThemedText>
              <View style={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day.key}
                    style={[
                      styles.dayButton,
                      { borderColor },
                      selectedDays.includes(day.key) && {
                        backgroundColor: secondaryColor,
                        borderColor: secondaryColor,
                      },
                    ]}
                    onPress={() => toggleDay(day.key)}
                  >
                    <ThemedText
                      style={[
                        styles.dayButtonText,
                        selectedDays.includes(day.key) && { color: "#ffffff" },
                      ]}
                    >
                      {day.label.slice(0, 3)}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Times Count Selection */}
          {(selectedType === "times_per_week" ||
            selectedType === "times_per_month") && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                How many times?
              </ThemedText>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor }]}
                  onPress={() => handleTimeCountChange(false)}
                >
                  <ThemedText style={styles.counterButtonText}>-</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.counterValue}>
                  {timesCount}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor }]}
                  onPress={() => handleTimeCountChange(true)}
                >
                  <ThemedText style={styles.counterButtonText}>+</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Time Selection */}
          {selectedType !== "once" && (
            <View style={styles.section}>
              <View style={styles.switchContainer}>
                <ThemedText style={styles.sectionTitle}>
                  Set specific time?
                </ThemedText>
                <Switch
                  value={hasTime}
                  onValueChange={setHasTime}
                  trackColor={{ false: "#767577", true: primaryColor }}
                  thumbColor={hasTime ? "#fff" : "#f4f3f4"}
                />
              </View>

              {hasTime && (
                <View style={styles.timeContainer}>
                  <ThemedText style={styles.timeLabel}>Time:</ThemedText>
                  <View style={styles.timeControls}>
                    <View style={styles.timeSection}>
                      <TouchableOpacity
                        style={[styles.timeButton, { borderColor }]}
                        onPress={() => handleTimeChange(true, "hour")}
                      >
                        <ThemedText style={styles.timeButtonText}>+</ThemedText>
                      </TouchableOpacity>
                      <ThemedText style={styles.timeValue}>
                        {selectedTime.split(":")[0]}
                      </ThemedText>
                      <TouchableOpacity
                        style={[styles.timeButton, { borderColor }]}
                        onPress={() => handleTimeChange(false, "hour")}
                      >
                        <ThemedText style={styles.timeButtonText}>-</ThemedText>
                      </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.timeSeparator}>:</ThemedText>
                    <View style={styles.timeSection}>
                      <TouchableOpacity
                        style={[styles.timeButton, { borderColor }]}
                        onPress={() => handleTimeChange(true, "minute")}
                      >
                        <ThemedText style={styles.timeButtonText}>+</ThemedText>
                      </TouchableOpacity>
                      <ThemedText style={styles.timeValue}>
                        {selectedTime.split(":")[1]}
                      </ThemedText>
                      <TouchableOpacity
                        style={[styles.timeButton, { borderColor }]}
                        onPress={() => handleTimeChange(false, "minute")}
                      >
                        <ThemedText style={styles.timeButtonText}>-</ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Preview */}
          <View style={[styles.previewContainer, { borderColor }]}>
            <ThemedText style={styles.previewLabel}>Preview:</ThemedText>
            <ThemedText style={styles.previewText}>
              {getFrequencyDescription()}
            </ThemedText>
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={[styles.footer, { borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isValidSelection() && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!isValidSelection()}
          >
            <ThemedText style={styles.saveButtonText}>
              {selectedType === "once"
                ? "Set as One-time Task"
                : "Save Frequency"}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    backgroundColor: "transparent",
  },
  optionContent: {
    flexDirection: "column",
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  counterButton: {
    borderWidth: 1,
    borderRadius: 8,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  counterValue: {
    fontSize: 24,
    fontWeight: "600",
    minWidth: 40,
    textAlign: "center",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  timeContainer: {
    alignItems: "center",
  },
  timeLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  timeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeSection: {
    alignItems: "center",
    gap: 8,
  },
  timeButton: {
    borderWidth: 1,
    borderRadius: 6,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: "600",
  },
  previewContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    backgroundColor: "rgba(0, 122, 255, 0.05)",
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.9,
  },
  previewText: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "600",
  },
});
