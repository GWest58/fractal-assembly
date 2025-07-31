import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { ThemedText, Title2, Body } from "@/components/ThemedText";
import { Button } from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Spacing } from "@/constants/DesignTokens";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  primaryAction?: {
    title: string;
    onPress: () => void;
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
  style?: ViewStyle;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "📝",
  title,
  description,
  primaryAction,
  secondaryAction,
  style,
  compact = false,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, compact && styles.compact, style]}>
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.backgroundSecondary,
          },
        ]}
      >
        <ThemedText style={styles.icon}>{icon}</ThemedText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Title2 style={styles.title}>{title}</Title2>
        <Body hierarchy="secondary" style={styles.description}>
          {description}
        </Body>
      </View>

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <View style={styles.actions}>
          {primaryAction && (
            <Button
              title={primaryAction.title}
              onPress={primaryAction.onPress}
              variant="primary"
              style={styles.primaryButton}
            />
          )}
          {secondaryAction && (
            <Button
              title={secondaryAction.title}
              onPress={secondaryAction.onPress}
              variant="ghost"
              style={styles.secondaryButton}
            />
          )}
        </View>
      )}
    </View>
  );
};

// Specialized empty states for common scenarios
export const TasksEmptyState: React.FC<{
  onCreateTask: () => void;
  style?: ViewStyle;
}> = ({ onCreateTask, style }) => (
  <EmptyState
    icon="✨"
    title="No tasks yet"
    description="Create your first task to start building productive habits and tracking your daily progress."
    primaryAction={{
      title: "Create First Task",
      onPress: onCreateTask,
    }}
    style={style}
  />
);

export const CompletedTasksEmptyState: React.FC<{
  onViewAllTasks: () => void;
  style?: ViewStyle;
}> = ({ onViewAllTasks, style }) => (
  <EmptyState
    icon="🎯"
    title="No completed tasks"
    description="Complete your first task to see your progress here. Every journey starts with a single step!"
    secondaryAction={{
      title: "View All Tasks",
      onPress: onViewAllTasks,
    }}
    compact
    style={style}
  />
);

export const SearchEmptyState: React.FC<{
  searchQuery: string;
  onClearSearch: () => void;
  style?: ViewStyle;
}> = ({ searchQuery, onClearSearch, style }) => (
  <EmptyState
    icon="🔍"
    title="No results found"
    description={`We couldn't find any tasks matching "${searchQuery}". Try adjusting your search terms.`}
    secondaryAction={{
      title: "Clear Search",
      onPress: onClearSearch,
    }}
    compact
    style={style}
  />
);

export const OfflineEmptyState: React.FC<{
  onRetry: () => void;
  style?: ViewStyle;
}> = ({ onRetry, style }) => (
  <EmptyState
    icon="📡"
    title="You're offline"
    description="Your tasks are saved locally and will sync when you're back online. You can continue working normally."
    primaryAction={{
      title: "Try Again",
      onPress: onRetry,
    }}
    compact
    style={style}
  />
);

export const ErrorEmptyState: React.FC<{
  error?: string;
  onRetry: () => void;
  style?: ViewStyle;
}> = ({ error, onRetry, style }) => (
  <EmptyState
    icon="⚠️"
    title="Something went wrong"
    description={
      error || "We encountered an unexpected error. Please try again."
    }
    primaryAction={{
      title: "Try Again",
      onPress: onRetry,
    }}
    compact
    style={style}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
    maxWidth: 400,
    alignSelf: "center",
  },
  compact: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 32,
    lineHeight: 40,
  },
  content: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  description: {
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  actions: {
    alignItems: "center",
    gap: Spacing.sm,
    width: "100%",
  },
  primaryButton: {
    minWidth: 200,
  },
  secondaryButton: {
    minWidth: 140,
  },
});
