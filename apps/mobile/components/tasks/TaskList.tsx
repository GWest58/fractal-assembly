import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTask } from "@/contexts/TaskContext";
import { TaskItem } from "./TaskItem";

export const TaskList: React.FC = () => {
  const { state } = useTask();
  const { tasks } = state;

  const recurringTasks = tasks.filter((task) => task.frequency);
  const oneTimeTasks = tasks.filter((task) => !task.frequency);

  const completedRecurringToday = recurringTasks.filter(
    (task) => task.completedToday,
  );
  const pendingRecurring = recurringTasks.filter(
    (task) => !task.completedToday,
  );

  const completedOneTime = oneTimeTasks.filter((task) => task.completed);
  const pendingOneTime = oneTimeTasks.filter((task) => !task.completed);

  if (tasks.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <ThemedText style={styles.emptyText}>No tasks yet</ThemedText>
        <ThemedText style={styles.emptySubtext}>
          Add your first task to get started!
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Recurring Tasks Section */}
      {recurringTasks.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📅 Recurring Tasks ({completedRecurringToday.length}/
            {recurringTasks.length})
          </ThemedText>

          {pendingRecurring.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}

          {completedRecurringToday.length > 0 && (
            <>
              <ThemedText style={styles.completedLabel}>
                ✅ Completed Today
              </ThemedText>
              {completedRecurringToday.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </>
          )}
        </ThemedView>
      )}

      {/* One-time Tasks Section */}
      {oneTimeTasks.length > 0 && (
        <>
          {pendingOneTime.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                📝 One-time Tasks ({pendingOneTime.length})
              </ThemedText>
              {pendingOneTime.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ThemedView>
          )}

          {completedOneTime.length > 0 && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                ✅ Completed Tasks ({completedOneTime.length})
              </ThemedText>
              {completedOneTime.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ThemedView>
          )}
        </>
      )}

      <ThemedView style={styles.stats}>
        {recurringTasks.length > 0 && (
          <ThemedText style={styles.statsText}>
            Today: {completedRecurringToday.length}/{recurringTasks.length}{" "}
            recurring tasks
          </ThemedText>
        )}
        {oneTimeTasks.length > 0 && (
          <ThemedText style={styles.statsText}>
            {`One-time: ${completedOneTime.length}/${oneTimeTasks.length} completed`}
          </ThemedText>
        )}
      </ThemedView>

      {/* Bottom spacer to prevent FAB overlap */}
      <ThemedView style={styles.bottomSpacer} />
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
  bottomSpacer: {
    height: 40,
    backgroundColor: "transparent",
  },
});
