import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  TouchableOpacityProps,
} from "react-native";
import { ThemedText, Headline, Caption1 } from "@/components/ThemedText";
import { IconButton } from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/DesignTokens";

interface CardProps extends TouchableOpacityProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftMetadata?: string;
  rightMetadata?: string;
  onPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: "default" | "compact";
  children?: React.ReactNode;
}

export function Card({
  title,
  subtitle,
  description,
  leftMetadata,
  rightMetadata,
  onPress,
  onDelete,
  onEdit,
  style,
  disabled = false,
  variant = "default",
  children,
  ...touchableProps
}: CardProps) {
  const colorScheme = useColorScheme();

  const hasFooter = leftMetadata || rightMetadata;
  const hasActions = onDelete || onEdit;
  const isCompact = variant === "compact";

  const cardContent = (
    <>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Headline style={[styles.cardTitle, isCompact && styles.compactTitle]}>
            {title}
          </Headline>
          {subtitle && (
            <Caption1 hierarchy="secondary" style={styles.cardSubtitle}>
              {subtitle}
            </Caption1>
          )}
          {description && (
            <ThemedText
              type="body"
              hierarchy="secondary"
              style={[styles.cardDescription, isCompact && styles.compactDescription]}
            >
              {description}
            </ThemedText>
          )}
        </View>
        {hasActions && (
          <View style={styles.cardActions}>
            {onEdit && (
              <IconButton
                onPress={onEdit}
                icon={<ThemedText style={styles.editIcon}>✎</ThemedText>}
                variant="ghost"
                size="small"
              />
            )}
            {onDelete && (
              <IconButton
                onPress={onDelete}
                icon={<ThemedText style={styles.deleteIcon}>×</ThemedText>}
                variant="ghost"
                size="small"
              />
            )}
          </View>
        )}
      </View>

      {children}

      {hasFooter && (
        <View style={[styles.cardFooter, { borderTopColor: Colors[colorScheme ?? "light"].separator }]}>
          {leftMetadata && (
            <Caption1 hierarchy="secondary">{leftMetadata}</Caption1>
          )}
          {rightMetadata && (
            <Caption1 hierarchy="tertiary">{rightMetadata}</Caption1>
          )}
        </View>
      )}
    </>
  );

  const cardStyles = [
    styles.card,
    isCompact && styles.compactCard,
    {
      backgroundColor: Colors[colorScheme ?? "light"].background,
      borderColor: Colors[colorScheme ?? "light"].separator,
    },
    disabled && styles.disabledCard,
    style,
  ];

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={onPress}
        activeOpacity={0.7}
        {...touchableProps}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{cardContent}</View>;
}

// Specialized card variants
export function GoalCard({
  goal,
  onPress,
  onDelete,
  onEdit,
  ...props
}: {
  goal: {
    id: string;
    name: string;
    description?: string;
    projectCount?: number;
    createdAt: Date;
  };
  onPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
} & Omit<CardProps, "title" | "description" | "leftMetadata" | "rightMetadata">) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      title={goal.name}
      description={goal.description}
      leftMetadata={`${goal.projectCount || 0} project${goal.projectCount !== 1 ? "s" : ""}`}
      rightMetadata={`Created ${formatDate(goal.createdAt)}`}
      onPress={onPress}
      onDelete={onDelete}
      onEdit={onEdit}
      {...props}
    />
  );
}

export function ProjectCard({
  project,
  goalName,
  onPress,
  onDelete,
  onEdit,
  ...props
}: {
  project: {
    id: string;
    name: string;
    description?: string;
    goalId?: string;
    taskCount?: number;
    createdAt: Date;
  };
  goalName?: string;
  onPress?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
} & Omit<CardProps, "title" | "description" | "subtitle" | "leftMetadata" | "rightMetadata">) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      title={project.name}
      subtitle={goalName ? `Goal: ${goalName}` : undefined}
      description={project.description}
      leftMetadata={`${project.taskCount || 0} task${project.taskCount !== 1 ? "s" : ""}`}
      rightMetadata={`Created ${formatDate(project.createdAt)}`}
      onPress={onPress}
      onDelete={onDelete}
      onEdit={onEdit}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    ...Shadows.small,
    marginBottom: Spacing.md,
  },
  compactCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  cardInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
    fontWeight: "600",
  },
  compactTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  cardSubtitle: {
    marginBottom: Spacing.xs,
    fontStyle: "italic",
  },
  cardDescription: {
    lineHeight: 20,
  },
  compactDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  editIcon: {
    fontSize: 18,
    fontWeight: "400",
  },
  deleteIcon: {
    fontSize: 24,
    fontWeight: "300",
  },
});
