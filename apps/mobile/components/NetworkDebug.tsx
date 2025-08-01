import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Title2, Headline, Body, Caption1 } from "./ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import {
  NetworkDiagnostics,
  NetworkDiagnosticResult,
} from "../services/networkDiagnostics";

export const NetworkDebug: React.FC = () => {
  const [results, setResults] = useState<NetworkDiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    // Auto-run diagnostics on mount
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      console.log("🔍 Starting network diagnostics...");
      const diagnosticResults = await NetworkDiagnostics.runFullDiagnostic();

      setResults(diagnosticResults);
      setLastRun(new Date());

      NetworkDiagnostics.logResults(diagnosticResults);

      const successCount = diagnosticResults.filter((r) => r.success).length;
      const totalCount = diagnosticResults.length;

      if (successCount === totalCount) {
        Alert.alert("✅ All Tests Passed", "Network connectivity looks good!");
      } else {
        Alert.alert(
          "❌ Some Tests Failed",
          `${successCount}/${totalCount} tests passed. Check console for details.`,
        );
      }
    } catch (error) {
      console.error("Failed to run diagnostics:", error);
      Alert.alert("Error", "Failed to run network diagnostics");
    } finally {
      setIsRunning(false);
    }
  };

  const testSpecificUrl = async () => {
    Alert.prompt(
      "Test Custom URL",
      "Enter URL to test:",
      async (url) => {
        if (url) {
          setIsRunning(true);
          try {
            const result = await NetworkDiagnostics.testSpecificUrl(url);
            Alert.alert(
              result.success ? "✅ Success" : "❌ Failed",
              result.success
                ? "URL is reachable"
                : result.error || "Unknown error",
            );
          } catch {
            Alert.alert("Error", "Failed to test URL");
          } finally {
            setIsRunning(false);
          }
        }
      },
      "plain-text",
      "http://192.168.1.157:3001/health",
    );
  };

  const getStatusIcon = (success: boolean) => (success ? "✅" : "❌");

  const renderResult = (result: NetworkDiagnosticResult, index: number) => (
    <View
      key={index}
      style={[styles.resultItem, { borderColor: colors.border }]}
    >
      <View style={styles.resultHeader}>
        <Text style={styles.statusIcon}>{getStatusIcon(result.success)}</Text>
        <Headline style={[styles.testName, { color: colors.text }]}>
          {result.test}
        </Headline>
        {result.timing && (
          <Caption1 style={[styles.timing, { color: colors.textSecondary }]}>
            {result.timing}ms
          </Caption1>
        )}
      </View>

      {result.success && result.response && (
        <View
          style={[
            styles.responseContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <Caption1
            style={[styles.responseLabel, { color: colors.textSecondary }]}
          >
            Response:
          </Caption1>
          <Body style={[styles.responseText, { color: colors.text }]}>
            {typeof result.response === "string"
              ? result.response
              : JSON.stringify(result.response, null, 2)}
          </Body>
        </View>
      )}

      {!result.success && result.error && (
        <View style={[styles.errorContainer, { backgroundColor: "#ffebee" }]}>
          <Caption1 style={styles.errorLabel}>Error:</Caption1>
          <Body style={styles.errorText}>{result.error}</Body>
        </View>
      )}
    </View>
  );

  const debugInfo = NetworkDiagnostics.getDebugInfo();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Title2 style={[styles.title, { color: colors.text }]}>
          Network Diagnostics
        </Title2>
        <Caption1 style={[styles.subtitle, { color: colors.textSecondary }]}>
          Test connectivity to backend server
        </Caption1>
      </View>

      {/* Debug Info */}
      <View
        style={[
          styles.debugInfo,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        <Headline style={[styles.sectionTitle, { color: colors.text }]}>
          Debug Information
        </Headline>
        <Body style={[styles.debugText, { color: colors.text }]}>
          Platform: {String((debugInfo as Record<string, unknown>).platform)}{" "}
          {String((debugInfo as Record<string, unknown>).version)}
        </Body>
        <Body style={[styles.debugText, { color: colors.text }]}>
          Environment:{" "}
          {(debugInfo as Record<string, unknown>).isDev
            ? "Development"
            : "Production"}
        </Body>
        <Body style={[styles.debugText, { color: colors.text }]}>
          API Base URL:{" "}
          {String((debugInfo as Record<string, unknown>).apiBaseUrl)}
        </Body>
        {lastRun && (
          <Body style={[styles.debugText, { color: colors.text }]}>
            Last Run: {lastRun.toLocaleTimeString()}
          </Body>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            isRunning && styles.disabledButton,
          ]}
          onPress={runDiagnostics}
          disabled={isRunning}
        >
          <Text style={styles.buttonText}>
            {isRunning ? "Running Tests..." : "Run Diagnostics"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={testSpecificUrl}
          disabled={isRunning}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            Test Custom URL
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      {results.length > 0 && (
        <View style={styles.results}>
          <Headline style={[styles.sectionTitle, { color: colors.text }]}>
            Test Results
          </Headline>
          {results.map(renderResult)}

          <View
            style={[
              styles.summary,
              {
                backgroundColor: colors.backgroundSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Body style={[styles.summaryText, { color: colors.text }]}>
              {results.filter((r) => r.success).length}/{results.length} tests
              passed
            </Body>
          </View>
        </View>
      )}

      {/* Troubleshooting Tips */}
      <View
        style={[
          styles.troubleshooting,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        <Headline style={[styles.sectionTitle, { color: colors.text }]}>
          Troubleshooting Tips
        </Headline>
        <Body style={[styles.tipText, { color: colors.text }]}>
          • Make sure backend server is running (npm start in apps/backend)
        </Body>
        <Body style={[styles.tipText, { color: colors.text }]}>
          • Check if your IP address has changed
        </Body>
        <Body style={[styles.tipText, { color: colors.text }]}>
          • Ensure device and computer are on same network
        </Body>
        <Body style={[styles.tipText, { color: colors.text }]}>
          • Try disabling VPN or firewall temporarily
        </Body>
        <Body style={[styles.tipText, { color: colors.text }]}>
          • Check if port 3001 is blocked
        </Body>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  debugInfo: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  controls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  results: {
    marginBottom: 24,
  },
  resultItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  testName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  timing: {
    fontSize: 12,
    opacity: 0.7,
  },
  responseContainer: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  responseText: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  errorContainer: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  errorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#d32f2f",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: "#d32f2f",
  },
  summary: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 12,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  troubleshooting: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default NetworkDebug;
