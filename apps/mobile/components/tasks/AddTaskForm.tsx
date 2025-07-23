import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTask } from "@/contexts/TaskContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Text } from "react-native";

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

  // Theme colors
  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#1e1e1e" },
    "background",
  );
  const textColor = useThemeColor({ light: "#000", dark: "#fff" }, "text");
  const borderColor = useThemeColor({ light: "#e1e1e1", dark: "#333" }, "text");
  const inputBackgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#000000" },
    "background",
  );
  const closeButtonBg = useThemeColor(
    { light: "#f5f5f5", dark: "#333" },
    "background",
  );
  const placeholderColor = useThemeColor(
    { light: "#999", dark: "#666" },
    "text",
  );
  const headerBorderColor = useThemeColor(
    { light: "#e1e1e1", dark: "#333" },
    "text",
  );

  const handleSubmit = () => {
    if (taskText.trim()) {
      addTask({ text: taskText.trim() });
      setTaskText("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView
        style={[styles.modalContainer, { backgroundColor: backgroundColor }]}
      >
        <View style={[styles.header, { borderBottomColor: headerBorderColor }]}>
          <ThemedText type="title" style={[styles.title, { color: "#007AFF" }]}>
            Add New Task
          </ThemedText>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: closeButtonBg }]}
          >
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: inputBackgroundColor,
                color: textColor,
                borderColor: borderColor,
              },
            ]}
            value={taskText}
            onChangeText={setTaskText}
            placeholder="Enter task description..."
            placeholderTextColor={placeholderColor}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.addButton,
                !taskText.trim() && styles.addButtonDisabled,
              ]}
              disabled={!taskText.trim()}
            >
              <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.cancelButton, { borderColor: borderColor }]}
            >
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "transparent",
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
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    opacity: 0.8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    gap: 16,
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonDisabled: {
    backgroundColor: "gray",
  },
  addButtonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
  },
  cancelButtonText: {
    opacity: 0.8,
    fontSize: 17,
    fontWeight: "600",
  },
});
