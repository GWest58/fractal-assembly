import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTask } from "@/contexts/TaskContext";
import { Task } from "@/types/Task";

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const { updateTask, deleteTask, toggleTask } = useTask();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleToggle = () => {
    toggleTask(task.id);
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "health":
        return "💊";
      case "wellness":
        return "🧘";
      case "productivity":
        return "📋";
      case "personal":
        return "🛏️";
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

  const isCompleted = task.isFoundational
    ? task.completedToday
    : task.completed;

  return (
    <ThemedView
      style={[
        styles.container,
        task.isFoundational && styles.foundationalContainer,
      ]}
    >
      <TouchableOpacity onPress={handleToggle} style={styles.checkbox}>
        <ThemedView
          style={[
            styles.checkboxInner,
            isCompleted && styles.checkboxChecked,
            task.isFoundational && styles.foundationalCheckbox,
          ]}
        >
          {isCompleted && <ThemedText style={styles.checkmark}>✓</ThemedText>}
        </ThemedView>
      </TouchableOpacity>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.textInput}
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
                style={[
                  styles.taskText,
                  isCompleted && styles.completedText,
                  task.isFoundational && styles.foundationalText,
                ]}
                onPress={handleEdit}
              >
                {getCategoryIcon(task.category)} {task.text}
              </ThemedText>
              {task.isFoundational && (
                <ThemedText style={styles.foundationalBadge}>Daily</ThemedText>
              )}
            </View>
            {showDeleteConfirm ? (
              <View style={styles.deleteConfirmContainer}>
                <ThemedText style={styles.deleteConfirmText}>
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
              !task.isFoundational && (
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
              )
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
    borderBottomColor: "#e1e1e1",
    backgroundColor: "transparent",
  },
  foundationalContainer: {
    backgroundColor: "#FFF8F0",
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B35",
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
  foundationalCheckbox: {
    borderColor: "#FF6B35",
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
  foundationalText: {
    fontWeight: "600",
  },
  foundationalBadge: {
    backgroundColor: "#FF6B35",
    color: "white",
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: "600",
    marginLeft: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
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
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    color: "#000",
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
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteConfirmContainer: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeaa7",
    marginTop: 8,
  },
  deleteConfirmText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
    color: "#856404",
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
});
