import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText, Caption1 } from "@/components/ThemedText";
import { Button, IconButton } from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Spacing, BorderRadius } from "@/constants/DesignTokens";

interface ProgressSectionProps {
  title?: string;
  completed: number;
  total: number;
  onRefresh?: () => void;
  onDebug?: () => void;
  onReset?: () => void;
  loading?: boolean;
  showActions?: boolean;
}

export function ProgressSection({
  title = "Today's Progress",
  completed,
  total,
  onRefresh,
  onDebug,
  onReset,
  loading = false,
  showActions = true,
}: ProgressSectionProps) {
  const colorScheme = useColorScheme();
  const remaining = total - completed;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={styles.progressSection}>
      <View style={styles.progressHeader}>
        <ThemedText type="headline">{title}</ThemedText>
        {showActions && (
          <View style={styles.progressActions}>
            {onRefresh && (
              <IconButton
                onPress={onRefresh}
                icon={<ThemedText style={styles.refreshIcon}>↻</ThemedText>}
                variant="ghost"
                size="small"
                disabled={loading}
              />
            )}
            {onDebug && (
              <IconButton
                onPress={onDebug}
                icon={<ThemedText style={styles.refreshIcon}>🔍</ThemedText>}
                variant="ghost"
                size="small"
              />
            )}
            {onReset && (
              <Button
                title="Reset Day"
                onPress={onReset}
                variant="tertiary"
                size="small"
                disabled={loading}
              />
            )}
          </View>
        )}
      </View>

      <View style={styles.progressStats}>
        <View style={styles.progressCard}>
          <ThemedText type="largeTitle" style={styles.progressNumber}>
            {completed}
          </ThemedText>
          <Caption1 hierarchy="secondary">Completed</Caption1>
        </View>

        <View style={styles.progressDivider} />

        <View style={styles.progressCard}>
          <ThemedText type="largeTitle" style={styles.progressNumber}>
            {remaining}
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
  );
}

const styles = StyleSheet.create({
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
    borderRadius: BorderRadius.sm,
  },
});
