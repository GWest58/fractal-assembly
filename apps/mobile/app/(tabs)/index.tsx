import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ThemedText,
  Title1,
  Subheadline,
  Caption1,
} from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { FloatingActionButton } from "@/components/tasks/FloatingActionButton";
import { Button, IconButton } from "@/components/ui/Button";
import { useTask } from "@/contexts/TaskContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
} from "@/constants/DesignTokens";

export default function HomeScreen() {
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { resetDailyTasks, refreshTasks, state } = useTask();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const openAddTaskModal = () => {
    setIsAddTaskModalVisible(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalVisible(false);
  };

  const handleDailyReset = () => {
    if (Platform.OS === "web") {
      setShowResetConfirm(true);
    } else {
      // Use native Alert for mobile
      const Alert = require("react-native").Alert;
      Alert.alert(
        "Reset Daily Tasks",
        "This will mark all recurring tasks as incomplete for a new day. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reset",
            style: "destructive",
            onPress: async () => {
              try {
                await resetDailyTasks();
                Alert.alert("Success", "Daily tasks have been reset!");
              } catch {
                Alert.alert(
                  "Error",
                  "Failed to reset tasks. Please try again.",
                );
              }
            },
          },
        ],
      );
    }
  };

  const confirmReset = async () => {
    try {
      await resetDailyTasks();
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Reset failed:", error);
    }
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const recurringTasks = state.tasks.filter((task) => task.frequency);
  const completedToday = recurringTasks.filter((task) => task.completedToday);
  const progressPercentage =
    recurringTasks.length > 0
      ? Math.round((completedToday.length / recurringTasks.length) * 100)
      : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentDate.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header Section */}
      <ThemedView
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.lg,
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerMain}>
            <Title1 style={styles.greeting}>{getGreeting()}</Title1>
            <Subheadline hierarchy="secondary" style={styles.dateText}>
              {formatDate(currentDate)}
            </Subheadline>
          </View>

          {/* Connection Status */}
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: state.isOnline
                    ? Colors[colorScheme ?? "light"].success
                    : Colors[colorScheme ?? "light"].error,
                },
              ]}
            />
            <Caption1 hierarchy="secondary">
              {state.isOnline ? "Online" : "Offline"}
            </Caption1>
          </View>
        </View>

        {/* Progress Section */}
        {recurringTasks.length > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <ThemedText type="headline">Today's Progress</ThemedText>
              <View style={styles.progressActions}>
                <IconButton
                  onPress={refreshTasks}
                  icon={<ThemedText style={styles.refreshIcon}>↻</ThemedText>}
                  variant="ghost"
                  size="small"
                  disabled={state.loading}
                />
                <Button
                  title="Reset Day"
                  onPress={handleDailyReset}
                  variant="tertiary"
                  size="small"
                  disabled={state.loading}
                />
              </View>
            </View>

            <View style={styles.progressStats}>
              <View style={styles.progressCard}>
                <ThemedText type="largeTitle" style={styles.progressNumber}>
                  {completedToday.length}
                </ThemedText>
                <Caption1 hierarchy="secondary">Completed</Caption1>
              </View>

              <View style={styles.progressDivider} />

              <View style={styles.progressCard}>
                <ThemedText type="largeTitle" style={styles.progressNumber}>
                  {recurringTasks.length - completedToday.length}
                </ThemedText>
                <Caption1 hierarchy="secondary">Remaining</Caption1>
              </View>

              <View style={styles.progressDivider} />

              <View style={styles.progressCard}>
                <ThemedText
                  type="largeTitle"
                  style={[
                    styles.progressNumber,
                    {
                      color:
                        progressPercentage >= 100
                          ? Colors[colorScheme ?? "light"].success
                          : Colors[colorScheme ?? "light"].primary,
                    },
                  ]}
                >
                  {progressPercentage}%
                </ThemedText>
                <Caption1 hierarchy="secondary">Complete</Caption1>
              </View>
            </View>

            {/* Progress Bar */}
            <View
              style={[
                styles.progressBarContainer,
                {
                  backgroundColor: Colors[colorScheme ?? "light"].gray5,
                },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor:
                      progressPercentage >= 100
                        ? Colors[colorScheme ?? "light"].success
                        : Colors[colorScheme ?? "light"].primary,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Error Display */}
        {state.error && (
          <View
            style={[
              styles.errorContainer,
              {
                backgroundColor: Colors[colorScheme ?? "light"].error + "15",
                borderColor: Colors[colorScheme ?? "light"].error + "30",
              },
            ]}
          >
            <ThemedText
              type="footnote"
              style={{
                color: Colors[colorScheme ?? "light"].error,
              }}
            >
              ⚠️ {state.error}
            </ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Content Section */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom:
              insets.bottom + Layout.floatingActionButton.bottomOffset,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading State */}
        {state.loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={Colors[colorScheme ?? "light"].primary}
            />
            <ThemedText
              type="subheadline"
              hierarchy="secondary"
              style={styles.loadingText}
            >
              {state.isOnline ? "Syncing with server..." : "Loading tasks..."}
            </ThemedText>
          </View>
        )}

        {/* Tasks List */}
        <TaskList />

        {/* Empty State */}
        {!state.loading && state.tasks.length === 0 && (
          <View style={styles.emptyStateContainer}>
            <ThemedText type="title2" style={styles.emptyStateTitle}>
              No tasks yet
            </ThemedText>
            <ThemedText
              type="body"
              hierarchy="secondary"
              style={styles.emptyStateDescription}
            >
              Create your first task to get started with your daily routine.
            </ThemedText>
            <Button
              title="Create First Task"
              onPress={openAddTaskModal}
              variant="primary"
              style={styles.emptyStateButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton onPress={openAddTaskModal} />

      {/* Add Task Modal */}
      <AddTaskForm
        visible={isAddTaskModalVisible}
        onClose={closeAddTaskModal}
      />

      {/* Web Reset Confirmation Modal */}
      {showResetConfirm && (
        <View style={styles.overlay}>
          <View
            style={[
              styles.confirmDialog,
              {
                backgroundColor: Colors[colorScheme ?? "light"].background,
                borderColor: Colors[colorScheme ?? "light"].separator,
              },
            ]}
          >
            <ThemedText type="headline" style={styles.confirmTitle}>
              Reset Daily Tasks
            </ThemedText>
            <ThemedText
              type="body"
              hierarchy="secondary"
              style={styles.confirmMessage}
            >
              This will mark all recurring tasks as incomplete for a new day.
              Are you sure?
            </ThemedText>
            <Caption1 hierarchy="tertiary" style={styles.confirmStats}>
              Current: {completedToday.length}/{recurringTasks.length} completed
            </Caption1>
            <View style={styles.confirmButtons}>
              <Button
                title="Cancel"
                onPress={cancelReset}
                variant="secondary"
                style={styles.confirmButton}
              />
              <Button
                title="Reset"
                onPress={confirmReset}
                variant="destructive"
                style={styles.confirmButton}
              />
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  headerMain: {
    flex: 1,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  dateText: {
    marginBottom: Spacing.xs,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressSection: {
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  progressActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  refreshIcon: {
    fontSize: 18,
    fontWeight: "600",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  progressCard: {
    flex: 1,
    alignItems: "center",
  },
  progressNumber: {
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E5EA",
    marginHorizontal: Spacing.md,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.3s ease",
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },
  loadingContainer: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyStateTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  emptyStateDescription: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  emptyStateButton: {
    minWidth: 200,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  confirmDialog: {
    margin: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 320,
    maxWidth: 400,
    ...Shadows.large,
  },
  confirmTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  confirmMessage: {
    textAlign: "center",
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  confirmStats: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  confirmButton: {
    flex: 1,
  },
});
