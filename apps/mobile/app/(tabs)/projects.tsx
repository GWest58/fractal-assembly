import React, { useState, useEffect } from "react";
import { StyleSheet, View, Modal, Alert, Platform } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button, IconButton } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/TextInput";
import { Dropdown } from "@/components/ui/Dropdown";
import { TabContainer } from "@/components/ui/TabContainer";
import { ProjectCard } from "@/components/ui/Card";
import { Spacing } from "@/constants/DesignTokens";
import { Project, Goal, CreateProjectInput } from "@/types";
import { projectApi } from "@/services/projectApi";
import { goalApi } from "@/services/goalApi";

export default function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddProjectModalVisible, setIsAddProjectModalVisible] =
    useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedProjects, fetchedGoals] = await Promise.all([
        projectApi.getAllProjects(),
        goalApi.getAllGoals(),
      ]);
      setProjects(fetchedProjects);
      setGoals(fetchedGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      Alert.alert("Error", "Project name is required");
      return;
    }

    try {
      const projectData: CreateProjectInput = {
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
        goalId: selectedGoalId || undefined,
      };

      const createdProject = await projectApi.createProject(projectData);
      setProjects((prev) => [createdProject, ...prev]);
      setIsAddProjectModalVisible(false);
      setNewProjectName("");
      setNewProjectDescription("");
      setSelectedGoalId("");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to create project",
      );
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !newProjectName.trim()) {
      Alert.alert("Error", "Project name is required");
      return;
    }

    try {
      const updatedProject = await projectApi.updateProject({
        id: editingProject.id,
        name: newProjectName.trim(),
        description: newProjectDescription.trim() || undefined,
        goalId: selectedGoalId || undefined,
      });

      setProjects((prev) =>
        prev.map((project) =>
          project.id === updatedProject.id ? updatedProject : project,
        ),
      );
      setEditingProject(null);
      setNewProjectName("");
      setNewProjectDescription("");
      setSelectedGoalId("");
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to update project",
      );
    }
  };

  const handleDeleteProject = (project: Project) => {
    if (Platform.OS === "web") {
      if (
        window.confirm(`Are you sure you want to delete "${project.name}"?`)
      ) {
        deleteProject(project.id);
      }
    } else {
      Alert.alert(
        "Delete Project",
        `Are you sure you want to delete "${project.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteProject(project.id),
          },
        ],
      );
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectApi.deleteProject(projectId);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      Alert.alert(
        "Error",
        err instanceof Error ? err.message : "Failed to delete project",
      );
    }
  };

  const openAddProjectModal = () => {
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedGoalId("");
    setEditingProject(null);
    setIsAddProjectModalVisible(true);
  };

  const openEditProjectModal = (project: Project) => {
    setNewProjectName(project.name);
    setNewProjectDescription(project.description || "");
    setSelectedGoalId(project.goalId || "");
    setEditingProject(project);
    setIsAddProjectModalVisible(true);
  };

  const closeModal = () => {
    setIsAddProjectModalVisible(false);
    setEditingProject(null);
    setNewProjectName("");
    setNewProjectDescription("");
    setSelectedGoalId("");
  };

  const getGoalName = (goalId?: string) => {
    if (!goalId) return "No goal";
    const goal = goals.find((g) => g.id === goalId);
    return goal?.name || "Unknown goal";
  };

  return (
    <>
      <TabContainer
        title="Projects"
        subtitle="Organize your tasks by project"
        loading={loading}
        loadingMessage="Loading projects..."
        error={error}
        onAddPress={openAddProjectModal}
        onRefreshPress={loadData}
        isEmpty={projects.length === 0}
        emptyStateProps={{
          icon: "📁",
          title: "No projects yet",
          description:
            "Create your first project to start organizing your tasks.",
          primaryAction: {
            title: "Create First Project",
            onPress: openAddProjectModal,
          },
        }}
      >
        <View style={styles.projectsContainer}>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              goalName={getGoalName(project.goalId)}
              onPress={() => openEditProjectModal(project)}
              onDelete={() => handleDeleteProject(project)}
            />
          ))}
        </View>
      </TabContainer>

      {/* Add/Edit Project Modal */}
      <Modal
        visible={isAddProjectModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText type="headline">
              {editingProject ? "Edit Project" : "New Project"}
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
                Project Name
              </ThemedText>
              <TextInput
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholder="Enter project name"
                autoFocus
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="subheadline" style={styles.label}>
                Description (Optional)
              </ThemedText>
              <TextInput
                value={newProjectDescription}
                onChangeText={setNewProjectDescription}
                placeholder="Enter project description"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText type="subheadline" style={styles.label}>
                Goal (Optional)
              </ThemedText>
              <Dropdown
                options={[
                  { label: "No goal", value: "" },
                  ...goals.map((goal) => ({
                    label: goal.name,
                    value: goal.id,
                  })),
                ]}
                value={selectedGoalId}
                onSelect={setSelectedGoalId}
                placeholder="Select a goal"
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
                title={editingProject ? "Update" : "Create"}
                onPress={
                  editingProject ? handleUpdateProject : handleCreateProject
                }
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
  projectsContainer: {
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
