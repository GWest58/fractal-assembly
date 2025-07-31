import React, { useState, memo } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
} from "react-native";
import { ThemedText, Body, Caption1, Caption2 } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { useTask } from "@/contexts/TaskContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors, TaskColors } from "@/constants/Colors";
import { Spacing, BorderRadius, Typography } from "@/constants/DesignTokens";
import { InlineTimer } from "../InlineTimer";
import { TimerStatusResponse } from "@/types/Task";
import { TimerService } from "../../services/timerService";

import { Task } from "@/types/Task";

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = memo(({ task }) => {
  const { updateTask, deleteTask, toggleTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [opacityAnim] = useState(new Animated.Value(1));

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const taskColors = TaskColors[colorScheme ?? "light"];

  const isCompleted = task.frequency ? task.completedToday : task.completed;

  const getFrequencyDisplayText = () => {
    if (!task.frequency) return "One-time";

    switch (task.frequency.type) {
      case "daily":
        return "Daily";
      case "specific_days":
        return "Custom";
      case "times_per_week":
        return `${task.frequency.data.count || 3}×/week`;
      case "times_per_month":
        return `${task.frequency.data.count || 3}×/month`;
      default:
        return "One-time";
    }
  };

  const getDetailedFrequencyText = () => {
    if (!task.frequency) return "";

    switch (task.frequency.type) {
      case "daily":
        return task.frequency.time
          ? `Every day at ${task.frequency.time}`
          : "Every day";
      case "specific_days":
        const days = task.frequency.data.days?.join(", ") || "";
        const timeStr = task.frequency.time ? ` at ${task.frequency.time}` : "";
        return `${days}${timeStr}`;
      case "times_per_week":
        const weekTimeStr = task.frequency.time
          ? ` at ${task.frequency.time}`
          : "";
        return `${task.frequency.data.count || 3} times per week${weekTimeStr}`;
      case "times_per_month":
        const monthTimeStr = task.frequency.time
          ? ` at ${task.frequency.time}`
          : "";
        return `${task.frequency.data.count || 3} times per month${monthTimeStr}`;
      default:
        return "";
    }
  };

  const handleToggle = () => {
    // Immediate optimistic feedback - but lighter to prevent white flash
    Animated.parallel([
      // Scale animation for tactile feedback
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.98,
          duration: 60,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 60,
          useNativeDriver: true,
        }),
      ]),
      // Subtle opacity change to prevent white flash
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Call toggle function
    toggleTask(task.id);
  };

  const handleTimerComplete = async () => {
    // Auto-complete the task when timer finishes
    if (!isCompleted) {
      try {
        await toggleTask(task.id);
        // Don't call refreshTasks here as toggleTask already updates the state
      } catch (error) {
        console.error("Failed to complete task after timer finished:", error);
      }
    }
  };

  const handleTimerUpdate = (_status: TimerStatusResponse) => {
    // Handle timer status updates - but don't auto-complete here
    // Let the timer component handle completion to avoid double state updates
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(task.text);
  };

  const handleSave = () => {
    if (editText.trim()) {
      updateTask({ id: task.id, text: editText.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Animate fade out before deleting
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      deleteTask(task.id);
      setShowDeleteConfirm(false);
    });
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const renderCheckbox = () => (
    <TouchableOpacity
      onPress={handleToggle}
      style={styles.checkboxContainer}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isCompleted
                ? taskColors.checkboxChecked
                : taskColors.checkboxBorder,
              backgroundColor: isCompleted
                ? taskColors.checkboxChecked
                : "transparent",
            },
          ]}
        >
          {isCompleted && <ThemedText style={styles.checkmark}>✓</ThemedText>}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );

  const renderFrequencyBadge = () => {
    if (!task.frequency) return null;

    return (
      <View
        style={[
          styles.frequencyBadge,
          {
            backgroundColor: taskColors.frequencyBadge,
          },
        ]}
      >
        <Caption2 style={[styles.frequencyBadgeText, { color: "#FFFFFF" }]}>
          {getFrequencyDisplayText()}
        </Caption2>
      </View>
    );
  };

  const renderTaskContent = () => {
    if (isEditing) {
      return (
        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: colors.border,
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
                ...Typography.body,
              },
            ]}
            value={editText}
            onChangeText={setEditText}
            onSubmitEditing={handleSave}
            autoFocus
            multiline
            placeholder="Enter task description..."
            placeholderTextColor={colors.textPlaceholder}
          />
          <View style={styles.editActions}>
            <Button
              title="Save"
              onPress={handleSave}
              variant="primary"
              size="small"
              style={styles.editButton}
            />
            <Button
              title="Cancel"
              onPress={handleCancel}
              variant="secondary"
              size="small"
              style={styles.editButton}
            />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <TouchableOpacity onPress={handleEdit} activeOpacity={0.7}>
              <Body
                style={[styles.taskText, isCompleted && styles.completedText]}
              >
                {task.text}
              </Body>
            </TouchableOpacity>

            {(task.frequency ||
              (task.durationSeconds && task.durationSeconds > 0)) && (
              <Caption1 hierarchy="secondary" style={styles.frequencyDetail}>
                {task.frequency && getDetailedFrequencyText()}
                {task.frequency &&
                  task.durationSeconds &&
                  task.durationSeconds > 0 &&
                  " • "}
                {task.durationSeconds &&
                  task.durationSeconds > 0 &&
                  `⏱ ${TimerService.formatTime(task.durationSeconds)}`}
              </Caption1>
            )}
          </View>

          {renderFrequencyBadge()}
        </View>

        {/* Inline Timer Section - Show if task has duration and is not completed */}
        {task.durationSeconds && task.durationSeconds > 0 && !isCompleted && (
          <InlineTimer
            taskId={task.id}
            durationSeconds={task.durationSeconds}
            timerStatus={task.timerStatus}
            onTimerComplete={handleTimerComplete}
            onTimerUpdate={handleTimerUpdate}
          />
        )}

        {showDeleteConfirm ? (
          <View
            style={[
              styles.deleteConfirmContainer,
              {
                backgroundColor: colors.error + "10",
                borderColor: colors.error + "30",
              },
            ]}
          >
            <Caption1
              style={[styles.deleteConfirmText, { color: colors.error }]}
            >
              Delete this task permanently?
            </Caption1>
            <View style={styles.deleteConfirmActions}>
              <Button
                title="Delete"
                onPress={confirmDelete}
                variant="destructive"
                size="small"
                style={styles.deleteConfirmButton}
              />
              <Button
                title="Cancel"
                onPress={cancelDelete}
                variant="secondary"
                size="small"
                style={styles.deleteConfirmButton}
              />
            </View>
          </View>
        ) : (
          <View style={styles.taskActions}>
            <TouchableOpacity
              onPress={handleEdit}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Caption1 style={[styles.actionText, { color: colors.link }]}>
                Edit
              </Caption1>
            </TouchableOpacity>

            <View style={styles.actionDivider} />

            <TouchableOpacity
              onPress={handleDelete}
              style={styles.actionButton}
              activeOpacity={0.7}
            >
              <Caption1 style={[styles.actionText, { color: colors.error }]}>
                Delete
              </Caption1>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor: colors.border,
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {renderCheckbox()}
      {renderTaskContent()}
    </Animated.View>
  );
});

TaskItem.displayName = "TaskItem";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 72,
  },
  checkboxContainer: {
    marginRight: Spacing.md,
    marginTop: Spacing.xs,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  taskInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  taskText: {
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  frequencyDetail: {
    fontStyle: "italic",
    lineHeight: 16,
  },
  frequencyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: "flex-start",
  },
  frequencyBadgeText: {
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  actionButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  actionText: {
    fontWeight: "500",
  },
  actionDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#C6C6C8",
    marginHorizontal: Spacing.sm,
  },
  editContainer: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 80,
    textAlignVertical: "top",
  },
  editActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  editButton: {
    flex: 1,
  },
  deleteConfirmContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  deleteConfirmText: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  deleteConfirmActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  deleteConfirmButton: {
    paddingHorizontal: Spacing.lg,
  },
});
