import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTask } from "@/contexts/TaskContext";
import { TaskItem } from "./TaskItem";

export const TaskList: React.FC = React.memo(() => {
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
});

TaskList.displayName = "TaskList";

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
