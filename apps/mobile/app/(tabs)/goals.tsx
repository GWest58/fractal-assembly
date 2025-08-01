import React, { useState, useEffect } from "react";
import { StyleSheet, View, Modal, Alert, Platform } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button, IconButton } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { TabContainer } from "@/components/ui/TabContainer";
import { GoalCard } from "@/components/ui/Card";
import { Spacing } from "@/constants/DesignTokens";
import { Goal, CreateGoalInput } from "@/types";
import { goalApi } from "@/services/goalApi";

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedGoals = await goalApi.getAllGoals();
      setGoals(fetchedGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!newGoalName.trim()) {
      Alert.alert("Error", "Goal name is required");
      return;
    }

    try {
      const goalData: CreateGoalInput = {
        name: newGoalName.trim(),
        description: newGoalDescription.trim() || undefined,
      };

      const createdGoal = await goalApi.createGoal(goalData);
      setGoals((prev) => [createdGoal, ...prev]);
      setIsAddGoalModalVisible(false);
      setNewGoalName("");
      setNewGoalDescription("");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to create goal",
      );
    }
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !newGoalName.trim()) {
      Alert.alert("Error", "Goal name is required");
      return;
    }

    try {
      const updatedGoal = await goalApi.updateGoal({
        id: editingGoal.id,
        name: newGoalName.trim(),
        description: newGoalDescription.trim() || undefined,
      });

      setGoals((prev) =>
        prev.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)),
      );
      setEditingGoal(null);
      setNewGoalName("");
      setNewGoalDescription("");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to update goal",
      );
    }
  };

  const handleDeleteGoal = (goal: Goal) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure you want to delete "${goal.name}"?`)) {
        deleteGoal(goal.id);
      }
    } else {
      Alert.alert(
        "Delete Goal",
        `Are you sure you want to delete "${goal.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteGoal(goal.id),
          },
        ],
      );
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      await goalApi.deleteGoal(goalId);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to delete goal",
      );
    }
  };

  const openAddGoalModal = () => {
    setNewGoalName("");
    setNewGoalDescription("");
    setEditingGoal(null);
    setIsAddGoalModalVisible(true);
  };

  const openEditGoalModal = (goal: Goal) => {
    setNewGoalName(goal.name);
    setNewGoalDescription(goal.description || "");
    setEditingGoal(goal);
    setIsAddGoalModalVisible(true);
  };

  const closeModal = () => {
    setIsAddGoalModalVisible(false);
    setEditingGoal(null);
    setNewGoalName("");
    setNewGoalDescription("");
  };

  return (
    <>
      <TabContainer
        title="Goals"
        subtitle="Organize your projects and tasks"
        loading={loading}
        loadingMessage="Loading goals..."
        error={error}
        onAddPress={openAddGoalModal}
        onRefreshPress={loadGoals}
        isEmpty={goals.length === 0}
        emptyStateProps={{
          icon: "🎯",
          title: "No goals yet",
          description:
            "Create your first goal to start organizing your projects and tasks.",
          primaryAction: {
            title: "Create First Goal",
            onPress: openAddGoalModal,
          },
        }}
      >
        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onPress={() => openEditGoalModal(goal)}
              onDelete={() => handleDeleteGoal(goal)}
            />
          ))}
        </View>
      </TabContainer>

      {/* Add/Edit Goal Modal */}
      <Modal
        visible={isAddGoalModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="headline">
              {editingGoal ? "Edit Goal" : "New Goal"}
            </ThemedText>
            <IconButton
              onPress={closeModal}
              icon={<ThemedText style={styles.closeIcon}>×</ThemedText>}
              variant="ghost"
              size="medium"
            />
          </View>

          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText type="subheadline" style={styles.label}>
                Goal Name
              </ThemedText>
              <TextInput
                value={newGoalName}
                onChangeText={setNewGoalName}
                placeholder="Enter goal name"
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="subheadline" style={styles.label}>
                Description (Optional)
              </ThemedText>
              <TextInput
                value={newGoalDescription}
                onChangeText={setNewGoalDescription}
                placeholder="Enter goal description"
                multiline
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={closeModal}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title={editingGoal ? "Update" : "Create"}
                onPress={editingGoal ? handleUpdateGoal : handleCreateGoal}
                variant="primary"
                style={styles.modalButton}
              />
            </View>
          </View>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  goalsContainer: {
    gap: Spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: "300",
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  modalButton: {
    flex: 1,
  },
});
