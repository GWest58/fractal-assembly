import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { FloatingActionButton } from "@/components/tasks/FloatingActionButton";
import { useTask } from "@/contexts/TaskContext";
import { debugApi, apiClient } from "@/services/api";

export default function HomeScreen() {
  const [isAddTaskModalVisible, setIsAddTaskModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const { resetDailyTasks, refreshTasks, state } = useTask();

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
            onPress: () => {
              resetDailyTasks();
              Alert.alert("Success", "Daily tasks have been reset!");
            },
          },
        ],
      );
    }
  };

  const confirmReset = async () => {
    console.log(
      "Web reset triggered - before reset:",
      state.tasks.filter((t) => t.frequency),
    );

    try {
      await resetDailyTasks();
      setShowResetConfirm(false);
      // Clear debug info and refresh it
      setDebugInfo("");
      // Add a brief success message for web
      setTimeout(() => {
        console.log(
          "Web reset triggered - after reset:",
          state.tasks.filter((t) => t.frequency),
        );
        debugState();
      }, 100);
    } catch (error) {
      console.error("Reset failed:", error);
      setDebugInfo(
        `Reset failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  const debugState = () => {
    const recurringTasks = state.tasks.filter((t) => t.frequency);
    const debugStr = recurringTasks
      .map((h) => `${h.text}: ${h.completedToday ? "✅" : "⭕"}`)
      .join(" | ");
    setDebugInfo(
      `${debugStr} | Total: ${recurringTasks.length}, Completed: ${completedToday.length} | Online: ${state.isOnline ? "✅" : "🔴"}`,
    );
    console.log("Current recurring tasks state:", recurringTasks);
    console.log("Completed today count:", completedToday.length);
    console.log("Connection status:", state.isOnline);
    console.log("Loading state:", state.loading);
    console.log("Error:", state.error);
  };

  const testApiConnection = async () => {
    try {
      setDebugInfo("Testing API connection...");
      await debugApi.fullTest();
      setDebugInfo("✅ API connection test passed!");
    } catch (error) {
      setDebugInfo(
        `❌ API test failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.error("API test failed:", error);
    }
  };

  const manualResetTest = async () => {
    try {
      setDebugInfo("Testing manual reset...");
      const result = await apiClient.resetDay();
      setDebugInfo(`✅ Manual reset success: ${JSON.stringify(result)}`);
      await refreshTasks();
    } catch (error) {
      setDebugInfo(
        `❌ Manual reset failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      console.error("Manual reset failed:", error);
    }
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

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.headerTop}>
          <ThemedView>
            <ThemedText type="title">My Tasks</ThemedText>
            <ThemedText style={styles.dateText}>
              {formatDate(currentDate)}
            </ThemedText>
            <ThemedView style={styles.statusRow}>
              <ThemedText style={styles.subtitle}>
                Daily Progress: {completedToday.length}/{recurringTasks.length}{" "}
                ({progressPercentage}%)
              </ThemedText>
              <ThemedText style={styles.connectionStatus}>
                {state.isOnline ? "🟢 Online" : "🔴 Offline"}
              </ThemedText>
            </ThemedView>
            {state.error && (
              <ThemedText style={styles.errorText}>⚠️ {state.error}</ThemedText>
            )}
          </ThemedView>
          <ThemedView style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={handleDailyReset}
              style={[
                styles.resetButton,
                state.loading && styles.buttonDisabled,
              ]}
              disabled={state.loading}
            >
              {state.loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <ThemedText style={styles.resetButtonText}>
                  🔄 Reset Day
                </ThemedText>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={debugState} style={styles.debugButton}>
              <ThemedText style={styles.debugButtonText}>🐛 Debug</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={refreshTasks}
              style={styles.refreshButton}
            >
              <ThemedText style={styles.refreshButtonText}>🔄</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={testApiConnection}
              style={styles.testButton}
            >
              <ThemedText style={styles.testButtonText}>🧪</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={manualResetTest}
              style={styles.manualResetButton}
            >
              <ThemedText style={styles.manualResetButtonText}>⚡</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {state.loading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <ThemedText style={styles.loadingText}>
              {state.isOnline ? "Syncing with server..." : "Loading tasks..."}
            </ThemedText>
          </ThemedView>
        )}
        {debugInfo && (
          <ThemedView style={styles.debugContainer}>
            <ThemedText style={styles.debugText}>Debug: {debugInfo}</ThemedText>
          </ThemedView>
        )}
        <TaskList
          key={`tasklist-${state.tasks.length}-${completedToday.length}`}
        />
      </ScrollView>

      <FloatingActionButton onPress={openAddTaskModal} />

      <AddTaskForm
        visible={isAddTaskModalVisible}
        onClose={closeAddTaskModal}
      />

      {/* Web-compatible confirmation dialog */}
      {showResetConfirm && (
        <ThemedView style={styles.overlay}>
          <ThemedView style={styles.confirmDialog}>
            <ThemedText style={styles.confirmTitle}>
              Reset Daily Tasks
            </ThemedText>
            <ThemedText style={styles.confirmMessage}>
              This will mark all recurring tasks as incomplete for a new day.
              Are you sure?
            </ThemedText>
            <ThemedText style={styles.debugInfo}>
              Current completed: {completedToday.length}/{recurringTasks.length}
            </ThemedText>
            <ThemedView style={styles.confirmButtons}>
              <TouchableOpacity
                onPress={cancelReset}
                style={styles.cancelConfirmButton}
              >
                <ThemedText style={styles.cancelConfirmText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmReset}
                style={styles.resetConfirmButton}
              >
                <ThemedText style={styles.resetConfirmText}>Reset</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
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
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  connectionStatus: {
    fontSize: 12,
    opacity: 0.8,
  },
  errorText: {
    fontSize: 12,
    color: "#dc3545",
    marginTop: 4,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resetButton: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  resetButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  debugButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  debugButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  refreshButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  testButton: {
    backgroundColor: "#6f42c1",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  testButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  manualResetButton: {
    backgroundColor: "#fd7e14",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  manualResetButtonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "transparent",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    opacity: 0.7,
  },
  debugContainer: {
    backgroundColor: "#f0f0f0",
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "monospace",
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  confirmDialog: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 12,
    minWidth: 280,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#000",
  },
  confirmMessage: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cancelConfirmButton: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  resetConfirmButton: {
    flex: 1,
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelConfirmText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  resetConfirmText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  debugInfo: {
    fontSize: 12,
    textAlign: "center",
    color: "#999",
    marginBottom: 12,
  },
});
