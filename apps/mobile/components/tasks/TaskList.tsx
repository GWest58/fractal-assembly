import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTask } from "@/contexts/TaskContext";
import { TaskItem } from "./TaskItem";

export const TaskList: React.FC = () => {
  const { state } = useTask();
  const { tasks } = state;

  const foundationalHabits = tasks.filter((task) => task.isFoundational);
  const regularTasks = tasks.filter((task) => !task.isFoundational);

  const completedFoundationalToday = foundationalHabits.filter(
    (task) => task.completedToday,
  );
  const pendingFoundational = foundationalHabits.filter(
    (task) => !task.completedToday,
  );

  const completedRegularTasks = regularTasks.filter((task) => task.completed);
  const pendingRegularTasks = regularTasks.filter((task) => !task.completed);

  if (tasks.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>
          Setting up your habits...
        </ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Your foundational habits will appear here shortly.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Foundational Habits Section */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.foundationalTitle}>
          🌟 Foundational Habits ({completedFoundationalToday.length}/
          {foundationalHabits.length})
        </ThemedText>
        <ThemedText style={styles.foundationalSubtitle}>
          Your daily minimum viable habits
        </ThemedText>

        {pendingFoundational.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}

        {completedFoundationalToday.length > 0 && (
          <>
            <ThemedText style={styles.completedLabel}>
              ✅ Completed Today
            </ThemedText>
            {completedFoundationalToday.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </>
        )}
      </ThemedView>

      {/* Regular Tasks Section */}
      {regularTasks.length > 0 && (
        <>
          {pendingRegularTasks.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Other Tasks ({pendingRegularTasks.length})
              </ThemedText>
              {pendingRegularTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ThemedView>
          )}

          {completedRegularTasks.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Completed Tasks ({completedRegularTasks.length})
              </ThemedText>
              {completedRegularTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ThemedView>
          )}
        </>
      )}

      <ThemedView style={styles.stats}>
        <ThemedText style={styles.statsText}>
          Daily Progress: {completedFoundationalToday.length}/
          {foundationalHabits.length} foundational habits
        </ThemedText>
        {regularTasks.length > 0 && (
          <ThemedText style={styles.statsText}>
            {`Other: ${completedRegularTasks.length}/${regularTasks.length} completed`}
          </ThemedText>
        )}
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
  foundationalTitle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FF6B35",
    marginBottom: 4,
    borderRadius: 8,
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  foundationalSubtitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 12,
    opacity: 0.7,
    fontStyle: "italic",
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
  completedLabel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
    marginTop: 12,
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
    marginBottom: 2,
  },
});
