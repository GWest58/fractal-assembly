import React from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import {
  ThemedText,
  Title1,
  Title2,
  Body,
  Caption1,
} from "@/components/ThemedText";
import { Button, PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
} from "@/constants/DesignTokens";

export const DarkModePreview: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  if (colorScheme !== "dark") {
    return null; // Only show in dark mode
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Title1 style={styles.headerTitle}>Premium Dark Mode</Title1>
        <Caption1 hierarchy="secondary" style={styles.headerSubtitle}>
          Sophisticated color palette with warm undertones
        </Caption1>
      </View>

      {/* Color Palette Showcase */}
      <View style={styles.section}>
        <Title2 style={styles.sectionTitle}>Background Hierarchy</Title2>
        <View style={styles.colorRow}>
          <View
            style={[
              styles.colorCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.separator,
              },
            ]}
          >
            <Body style={styles.colorLabel}>Primary</Body>
            <Caption1 hierarchy="secondary">#0D0E11</Caption1>
          </View>
          <View
            style={[
              styles.colorCard,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.separator,
              },
            ]}
          >
            <Body style={styles.colorLabel}>Secondary</Body>
            <Caption1 hierarchy="secondary">#161820</Caption1>
          </View>
          <View
            style={[
              styles.colorCard,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.separator,
              },
            ]}
          >
            <Body style={styles.colorLabel}>Tertiary</Body>
            <Caption1 hierarchy="secondary">#1E202A</Caption1>
          </View>
        </View>
      </View>

      {/* Text Hierarchy */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.backgroundSecondary,
          },
        ]}
      >
        <Title2 style={styles.sectionTitle}>Text Hierarchy</Title2>
        <View style={styles.textSamples}>
          <ThemedText type="title1">Primary Text (#F8F9FA)</ThemedText>
          <ThemedText type="body" hierarchy="secondary">
            Secondary Text (#C8CDD8)
          </ThemedText>
          <ThemedText type="callout" hierarchy="tertiary">
            Tertiary Text (#9CA3B2)
          </ThemedText>
          <ThemedText type="caption1" hierarchy="tertiary">
            Placeholder Text (#64748B)
          </ThemedText>
        </View>
      </View>

      {/* Semantic Colors */}
      <View style={styles.section}>
        <Title2 style={styles.sectionTitle}>Semantic Colors</Title2>
        <View style={styles.semanticColors}>
          <View
            style={[
              styles.semanticCard,
              {
                backgroundColor: colors.success + "20",
                borderColor: colors.success,
              },
            ]}
          >
            <View
              style={[styles.semanticDot, { backgroundColor: colors.success }]}
            />
            <Body style={[styles.semanticLabel, { color: colors.success }]}>
              Success
            </Body>
            <Caption1 hierarchy="secondary">#10B981</Caption1>
          </View>

          <View
            style={[
              styles.semanticCard,
              {
                backgroundColor: colors.warning + "20",
                borderColor: colors.warning,
              },
            ]}
          >
            <View
              style={[styles.semanticDot, { backgroundColor: colors.warning }]}
            />
            <Body style={[styles.semanticLabel, { color: colors.warning }]}>
              Warning
            </Body>
            <Caption1 hierarchy="secondary">#F59E0B</Caption1>
          </View>

          <View
            style={[
              styles.semanticCard,
              {
                backgroundColor: colors.error + "20",
                borderColor: colors.error,
              },
            ]}
          >
            <View
              style={[styles.semanticDot, { backgroundColor: colors.error }]}
            />
            <Body style={[styles.semanticLabel, { color: colors.error }]}>
              Error
            </Body>
            <Caption1 hierarchy="secondary">#EF4444</Caption1>
          </View>

          <View
            style={[
              styles.semanticCard,
              {
                backgroundColor: colors.primary + "20",
                borderColor: colors.primary,
              },
            ]}
          >
            <View
              style={[styles.semanticDot, { backgroundColor: colors.primary }]}
            />
            <Body style={[styles.semanticLabel, { color: colors.primary }]}>
              Primary
            </Body>
            <Caption1 hierarchy="secondary">#60A5FA</Caption1>
          </View>
        </View>
      </View>

      {/* Interactive Elements */}
      <View
        style={[
          styles.section,
          {
            backgroundColor: colors.backgroundTertiary,
          },
        ]}
      >
        <Title2 style={styles.sectionTitle}>Interactive Elements</Title2>
        <View style={styles.buttonRow}>
          <PrimaryButton title="Primary" onPress={() => {}} />
          <SecondaryButton title="Secondary" onPress={() => {}} />
          <Button
            title="Destructive"
            variant="destructive"
            onPress={() => {}}
          />
        </View>
      </View>

      {/* Task Card Preview */}
      <View style={styles.section}>
        <Title2 style={styles.sectionTitle}>Task Card Preview</Title2>
        <View
          style={[
            styles.taskCard,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.separator,
            },
          ]}
        >
          <View style={styles.taskCardHeader}>
            <View
              style={[
                styles.taskCheckbox,
                {
                  borderColor: colors.primary,
                },
              ]}
            >
              <ThemedText style={[styles.checkmark, { color: colors.primary }]}>
                ✓
              </ThemedText>
            </View>
            <View style={styles.taskCardContent}>
              <Body style={styles.taskTitle}>
                Morning meditation and journaling
              </Body>
              <Caption1 hierarchy="secondary" style={styles.taskFrequency}>
                Daily habit • 7:00 AM
              </Caption1>
            </View>
            <View
              style={[
                styles.frequencyBadge,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Caption1 style={[styles.badgeText, { color: "#FFFFFF" }]}>
                DAILY
              </Caption1>
            </View>
          </View>
        </View>

        {/* Completed Task */}
        <View
          style={[
            styles.taskCard,
            {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.separator,
              opacity: 0.7,
            },
          ]}
        >
          <View style={styles.taskCardHeader}>
            <View
              style={[
                styles.taskCheckbox,
                styles.taskCheckboxCompleted,
                {
                  backgroundColor: colors.success,
                  borderColor: colors.success,
                },
              ]}
            >
              <ThemedText style={[styles.checkmark, { color: "#FFFFFF" }]}>
                ✓
              </ThemedText>
            </View>
            <View style={styles.taskCardContent}>
              <Body style={[styles.taskTitle, styles.taskTitleCompleted]}>
                Review quarterly goals
              </Body>
              <Caption1 hierarchy="secondary" style={styles.taskFrequency}>
                Weekly • Completed at 2:30 PM
              </Caption1>
            </View>
            <View
              style={[
                styles.frequencyBadge,
                {
                  backgroundColor: colors.success,
                },
              ]}
            >
              <Caption1 style={[styles.badgeText, { color: "#FFFFFF" }]}>
                DONE
              </Caption1>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Caption1 hierarchy="secondary" style={styles.footerText}>
          Professional dark mode with sophisticated color relationships
        </Caption1>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xl,
    borderBottomWidth: 1,
  },
  headerTitle: {
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontStyle: "italic",
  },
  section: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    fontWeight: "600",
  },
  colorRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  colorCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    minHeight: 80,
    justifyContent: "center",
  },
  colorLabel: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  textSamples: {
    gap: Spacing.md,
  },
  semanticColors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  semanticCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: "47%",
    gap: Spacing.sm,
  },
  semanticDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  semanticLabel: {
    fontWeight: "600",
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  taskCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  taskCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCheckboxCompleted: {
    borderWidth: 0,
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 16,
  },
  taskCardContent: {
    flex: 1,
  },
  taskTitle: {
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  taskFrequency: {
    fontStyle: "italic",
  },
  frequencyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: Layout.screenPadding,
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  footerText: {
    textAlign: "center",
    fontStyle: "italic",
  },
});
