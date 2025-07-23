import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTask } from "@/contexts/TaskContext";
import { TaskItem } from "./TaskItem";

export const TaskList: React.FC = () => {
  const { state } = useTask();
  const { tasks } = state;

  if (tasks.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No tasks yet!</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Add your first task above to get started.
        </ThemedText>
      </ThemedView>
    );
  }

  const completedTasks = tasks.filter((task) => task.completed);
  const pendingTasks = tasks.filter((task) => !task.completed);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Pending Tasks ({pendingTasks.length})
        </ThemedText>
        {pendingTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ThemedView>

      {completedTasks.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Completed Tasks ({completedTasks.length})
          </ThemedText>
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ThemedView>
      )}

      <ThemedView style={styles.stats}>
        <ThemedText style={styles.statsText}>
          Total: {tasks.length} | Completed: {completedTasks.length} | Pending:{" "}
          {pendingTasks.length}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  section: {
    marginBottom: 24,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    marginBottom: 8,
    borderRadius: 8,
    color: "white",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    backgroundColor: "transparent",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  stats: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    backgroundColor: "transparent",
  },
  statsText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
  },
});
