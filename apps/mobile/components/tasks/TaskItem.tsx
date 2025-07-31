import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTask } from "@/contexts/TaskContext";
import { useThemeColor } from "@/hooks/useThemeColor";

import { Task } from "@/types/Task";

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask, toggleTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Theme colors
  const inputTextColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const deleteConfirmBg = useThemeColor(
    { light: "#fff3cd", dark: "#3a3a2a" },
    "background",
  );
  const deleteConfirmBorder = useThemeColor(
    { light: "#ffeaa7", dark: "#666" },
    "text",
  );
  const deleteConfirmText = useThemeColor(
    { light: "#856404", dark: "#d4c069" },
    "text",
  );

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const getFrequencyDisplayText = () => {
    if (!task.frequency) return "Daily";

    switch (task.frequency.type) {
      case "daily":
        return "Daily";
      case "specific_days":
        return "Custom";
      case "times_per_week":
        return `${task.frequency.data.count || 3}x/week`;
      case "times_per_month":
        return `${task.frequency.data.count || 3}x/month`;
      default:
        return "Daily";
    }
  };

  const getDetailedFrequencyText = () => {
    if (!task.frequency) return "";

    switch (task.frequency.type) {
      case "daily":
        return task.frequency.time ? `Every day at ${task.frequency.time}` : "";
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
    deleteTask(task.id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const isCompleted = task.frequency ? task.completedToday : task.completed;

  return (
    <ThemedView style={[styles.container, { borderBottomColor: borderColor }]}>
      <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
        <ThemedView
          style={[styles.checkboxInner, isCompleted && styles.checkboxChecked]}
        >
          {isCompleted && <ThemedText style={styles.checkmark}>✓</ThemedText>}
        </ThemedView>
      </TouchableOpacity>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: borderColor,
                  backgroundColor: inputBackgroundColor,
                  color: inputTextColor,
                },
              ]}
              value={editText}
              onChangeText={setEditText}
              onSubmitEditing={handleSave}
              autoFocus
              multiline
            />
            <View style={styles.editButtons}>
              <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                <ThemedText style={styles.buttonText}>Save</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.displayContainer}>
            <View style={styles.taskHeader}>
              <ThemedText
                style={[styles.taskText, isCompleted && styles.completedText]}
                onPress={handleEdit}
              >
                {task.text}
              </ThemedText>
              {task.frequency && (
                <ThemedText style={styles.frequencyBadge}>
                  {getFrequencyDisplayText()}
                </ThemedText>
              )}
            </View>
            {task.frequency && (
              <ThemedText style={styles.frequencyText}>
                {getDetailedFrequencyText()}
              </ThemedText>
            )}
            {showDeleteConfirm ? (
              <View
                style={[
                  styles.deleteConfirmContainer,
                  {
                    backgroundColor: deleteConfirmBg,
                    borderColor: deleteConfirmBorder,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.deleteConfirmText,
                    { color: deleteConfirmText },
                  ]}
                >
                  Delete this task?
                </ThemedText>
                <View style={styles.deleteConfirmButtons}>
                  <TouchableOpacity
                    onPress={confirmDelete}
                    style={styles.confirmDeleteButton}
                  >
                    <ThemedText style={styles.buttonText}>Delete</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={cancelDelete}
                    style={styles.cancelDeleteButton}
                  >
                    <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.editButton}
                >
                  <ThemedText style={styles.actionText}>Edit</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleDelete}
                  style={styles.deleteButton}
                >
                  <ThemedText style={styles.actionText}>Delete</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    backgroundColor: "transparent",
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  displayContainer: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskText: {
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  frequencyBadge: {
    backgroundColor: "#007AFF",
    color: "#ffffff",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: "600",
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#007AFF",
  },
  editContainer: {
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: "top",
  },
  editButtons: {
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#666",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteConfirmContainer: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  deleteConfirmText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  deleteConfirmButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  confirmDeleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelDeleteButton: {
    backgroundColor: "#6c757d",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  frequencyText: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
    fontStyle: "italic",
  },
});
