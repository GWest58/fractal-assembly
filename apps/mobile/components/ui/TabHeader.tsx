import React from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  ThemedText,
  Title1,
  Subheadline,
  Caption1,
} from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconButton } from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  Spacing,
  BorderRadius,
  Layout,
} from "@/constants/DesignTokens";

interface TabHeaderProps {
  title: string;
  subtitle?: string;
  showStatus?: boolean;
  statusText?: string;
  isOnline?: boolean;
  error?: string | null;
  onAddPress?: () => void;
  onRefreshPress?: () => void;
  onDebugPress?: () => void;
  actions?: React.ReactNode[];
  children?: React.ReactNode;
}

export function TabHeader({
  title,
  subtitle,
  showStatus = false,
  statusText,
  isOnline = true,
  error,
  onAddPress,
  onRefreshPress,
  onDebugPress,
  actions = [],
  children,
}: TabHeaderProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const defaultActions = [];

  if (onRefreshPress) {
    defaultActions.push(
      <IconButton
        key="refresh"
        onPress={onRefreshPress}
        icon={<ThemedText style={styles.actionIcon}>↻</ThemedText>}
        variant="ghost"
        size="small"
      />
    );
  }

  if (onDebugPress) {
    defaultActions.push(
      <IconButton
        key="debug"
        onPress={onDebugPress}
        icon={<ThemedText style={styles.actionIcon}>🔍</ThemedText>}
        variant="ghost"
        size="small"
      />
    );
  }

  if (onAddPress) {
    defaultActions.push(
      <IconButton
        key="add"
        onPress={onAddPress}
        icon={<ThemedText style={styles.addIcon}>+</ThemedText>}
        variant="primary"
        size="medium"
      />
    );
  }

  const allActions = [...defaultActions, ...actions];

  return (
    <ThemedView
      style={[
        styles.header,
        {
          paddingTop: insets.top + Spacing.lg,
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderBottomColor: Colors[colorScheme ?? "light"].separator,
        },
      ]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerMain}>
          <Title1 style={styles.title}>{title}</Title1>
          {subtitle && (
            <Subheadline hierarchy="secondary" style={styles.subtitle}>
              {subtitle}
            </Subheadline>
          )}
        </View>

        {/* Status or Actions */}
        {showStatus && statusText ? (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isOnline
                    ? Colors[colorScheme ?? "light"].success
                    : Colors[colorScheme ?? "light"].error,
                },
              ]}
            />
            <Caption1 hierarchy="secondary">{statusText}</Caption1>
          </View>
        ) : allActions.length > 0 ? (
          <View style={styles.actionsContainer}>
            {allActions}
          </View>
        ) : null}
      </View>

      {/* Custom children (like progress section) */}
      {children}

      {/* Error Display */}
      {error && (
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
            ⚠️ {error}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  headerMain: {
    flex: 1,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
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
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  actionIcon: {
    fontSize: 18,
    fontWeight: "600",
  },
  addIcon: {
    fontSize: 24,
    fontWeight: "600",
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
});
