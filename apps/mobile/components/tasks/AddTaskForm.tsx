import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
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
  const [isFoundational, setIsFoundational] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "health" | "wellness" | "productivity" | "personal" | undefined
  >(undefined);

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
      addTask({
        text: taskText.trim(),
        isFoundational,
        category: selectedCategory,
      });
      setTaskText("");
      setIsFoundational(false);
      setSelectedCategory(undefined);
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

          <View style={styles.optionsContainer}>
            <View
              style={[styles.switchContainer, { borderColor: borderColor }]}
            >
              <ThemedText style={styles.switchLabel}>
                Foundational Habit
              </ThemedText>
              <Switch
                value={isFoundational}
                onValueChange={setIsFoundational}
                trackColor={{ false: "#767577", true: "#FF6B35" }}
                thumbColor={isFoundational ? "#fff" : "#f4f3f4"}
              />
            </View>

            {isFoundational && (
              <View style={styles.categoryContainer}>
                <ThemedText style={styles.categoryLabel}>Category:</ThemedText>
                <View style={styles.categoryButtons}>
                  {(
                    [
                      { key: "health", label: "💊 Health", color: "#FF6B6B" },
                      {
                        key: "wellness",
                        label: "🧘 Wellness",
                        color: "#4ECDC4",
                      },
                      {
                        key: "productivity",
                        label: "📋 Productivity",
                        color: "#45B7D1",
                      },
                      {
                        key: "personal",
                        label: "🛏️ Personal",
                        color: "#96CEB4",
                      },
                    ] as const
                  ).map((category) => (
                    <TouchableOpacity
                      key={category.key}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category.key && {
                          backgroundColor: category.color,
                        },
                      ]}
                      onPress={() => setSelectedCategory(category.key)}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          selectedCategory === category.key && {
                            color: "white",
                          },
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[
                styles.addButton,
                !taskText.trim() && styles.addButtonDisabled,
              ]}
              disabled={
                !taskText.trim() || (isFoundational && !selectedCategory)
              }
            >
              <Text style={styles.addButtonText}>
                {isFoundational ? "Add Foundational Habit" : "Add Task"}
              </Text>
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
  optionsContainer: {
    marginBottom: 24,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    backgroundColor: "#f9f9f9",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
