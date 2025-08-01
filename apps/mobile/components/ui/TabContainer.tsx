import React from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ThemedView";
import { TabHeader } from "@/components/ui/TabHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spacing, Layout } from "@/constants/DesignTokens";

interface TabContainerProps {
  // Header props
  title: string;
  subtitle?: string;
  showStatus?: boolean;
  statusText?: string;
  isOnline?: boolean;
  error?: string | null;
  onAddPress?: () => void;
  onRefreshPress?: () => void;
  onDebugPress?: () => void;
  headerActions?: React.ReactNode[];
  headerContent?: React.ReactNode;

  // Content props
  loading?: boolean;
  loadingMessage?: string;
  isEmpty?: boolean;
  emptyStateProps?: {
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
  };

  // Layout props
  children?: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: object;
  showsVerticalScrollIndicator?: boolean;
}

export function TabContainer({
  // Header props
  title,
  subtitle,
  showStatus = false,
  statusText,
  isOnline = true,
  error,
  onAddPress,
  onRefreshPress,
  onDebugPress,
  headerActions = [],
  headerContent,

  // Content props
  loading = false,
  loadingMessage = "Loading...",
  isEmpty = false,
  emptyStateProps,

  // Layout props
  children,
  scrollable = true,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}: TabContainerProps) {
  const insets = useSafeAreaInsets();

  const renderContent = () => {
    if (loading) {
      return <LoadingState message={loadingMessage} />;
    }

    if (isEmpty && emptyStateProps) {
      return <EmptyState {...emptyStateProps} />;
    }

    return children;
  };

  const contentStyles = [
    styles.scrollContainer,
    { paddingBottom: insets.bottom + Spacing.xl },
    contentContainerStyle,
  ];

  return (
    <ThemedView style={styles.container}>
      <TabHeader
        title={title}
        subtitle={subtitle}
        showStatus={showStatus}
        statusText={statusText}
        isOnline={isOnline}
        error={error}
        onAddPress={onAddPress}
        onRefreshPress={onRefreshPress}
        onDebugPress={onDebugPress}
        actions={headerActions}
      >
        {headerContent}
      </TabHeader>

      {scrollable ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={contentStyles}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          {renderContent()}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.nonScrollableContent]}>
          {renderContent()}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },
  nonScrollableContent: {
    paddingHorizontal: Layout.screenPadding,
    paddingTop: Spacing.md,
  },
});
