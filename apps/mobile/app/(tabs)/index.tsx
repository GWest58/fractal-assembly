import React, { useState } from "react";
import { StyleSheet, ScrollView } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { FloatingActionButton } from "@/components/tasks/FloatingActionButton";

export default function HomeScreen() {
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);

  const openAddTaskModal = () => {
    setIsAddTaskModalVisible(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalVisible(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Habit Tracker</ThemedText>
        <ThemedText style={styles.subtitle}>Manage your daily tasks</ThemedText>
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TaskList />
      </ScrollView>

      <FloatingActionButton onPress={openAddTaskModal} />

      <AddTaskForm
        visible={isAddTaskModalVisible}
        onClose={closeAddTaskModal}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
});
