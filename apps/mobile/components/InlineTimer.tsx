import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Caption1, Caption2 } from "./ThemedText";
import { TimerService } from "../services/timerService";
import { TimerStatusResponse, TimerStatus } from "../types/Task";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

interface InlineTimerProps {
  taskId: string;
  durationSeconds?: number;
  timerStatus?: TimerStatus;
  onTimerComplete?: () => void;
  onTimerUpdate?: (status: TimerStatusResponse) => void;
}

export const InlineTimer: React.FC<InlineTimerProps> = React.memo(
  ({
    taskId,
    durationSeconds,
    timerStatus = "not_started",
    onTimerComplete,
    onTimerUpdate,
  }) => {
    const [currentStatus, setCurrentStatus] =
      useState<TimerStatus>(timerStatus);
    const [timeRemaining, setTimeRemaining] = useState<number>(
      durationSeconds || 0,
    );
    const [elapsed, setElapsed] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];

    // Update timer display every second when running
    useEffect(() => {
      if (currentStatus === "running") {
        intervalRef.current = setInterval(() => {
          updateTimerStatus();
        }, 1000);
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [currentStatus]);

    // Clean up interval on unmount
    useEffect(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    const updateTimerStatus = useCallback(async () => {
      try {
        const status = await TimerService.getTimerStatus(taskId);

        // Only update state if values actually changed to prevent flicker
        if (status.status !== currentStatus) {
          setCurrentStatus(status.status);
        }
        if (status.elapsed !== elapsed) {
          setElapsed(status.elapsed);
        }
        if ((status.remainingSeconds || 0) !== timeRemaining) {
          setTimeRemaining(status.remainingSeconds || 0);
        }

        if (onTimerUpdate) {
          onTimerUpdate(status);
        }

        // Check if timer completed
        if (status.isExpired && onTimerComplete) {
          onTimerComplete();
        }
      } catch (error) {
        console.error("Failed to update timer status:", error);
      }
    }, [
      taskId,
      currentStatus,
      elapsed,
      timeRemaining,
      onTimerUpdate,
      onTimerComplete,
    ]);

    const handleStartTimer = async () => {
      if (!durationSeconds) return;

      setIsLoading(true);
      try {
        await TimerService.startTimer(taskId);
        setCurrentStatus("running");
        await updateTimerStatus();
      } catch (error) {
        console.error("Failed to start timer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handlePauseTimer = async () => {
      setIsLoading(true);
      try {
        await TimerService.pauseTimer(taskId);
        setCurrentStatus("paused");
        await updateTimerStatus();
      } catch (error) {
        console.error("Failed to pause timer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleStopTimer = async () => {
      setIsLoading(true);
      try {
        await TimerService.stopTimer(taskId);
        setCurrentStatus("not_started");
        setTimeRemaining(durationSeconds || 0);
        setElapsed(0);
        await updateTimerStatus();
      } catch (error) {
        console.error("Failed to stop timer:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const formatTime = (seconds: number): string => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const getProgressPercentage = (): number => {
      if (!durationSeconds || durationSeconds === 0) return 0;
      return Math.min(100, (elapsed / durationSeconds) * 100);
    };

    const getStatusColor = () => {
      switch (currentStatus) {
        case "running":
          return "#4CAF50";
        case "paused":
          return "#FF9800";
        case "completed":
          return "#2196F3";
        default:
          return colors.textSecondary;
      }
    };

    const getStatusIcon = () => {
      switch (currentStatus) {
        case "running":
          return "pause";
        case "paused":
          return "play";
        case "completed":
          return "checkmark-circle";
        default:
          return "play";
      }
    };

    const handleControlPress = () => {
      if (currentStatus === "not_started") {
        handleStartTimer();
      } else if (currentStatus === "running") {
        handlePauseTimer();
      } else if (currentStatus === "paused") {
        handleStartTimer(); // Resume
      }
    };

    if (!durationSeconds) {
      return null;
    }

    return (
      <View style={styles.container}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: getStatusColor(),
                },
              ]}
            />
          </View>
        </View>

        {/* Timer Controls */}
        <View style={styles.controls}>
          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Caption1 style={[styles.timeText, { color: colors.text }]}>
              {formatTime(timeRemaining)}
            </Caption1>
            {currentStatus !== "not_started" && (
              <Caption2
                style={[styles.statusText, { color: getStatusColor() }]}
              >
                {currentStatus === "running"
                  ? "Running"
                  : currentStatus === "paused"
                    ? "Paused"
                    : "Complete"}
              </Caption2>
            )}
          </View>

          {/* Control Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                {
                  backgroundColor: getStatusColor(),
                  opacity: isLoading ? 0.6 : 1,
                },
              ]}
              onPress={handleControlPress}
              disabled={isLoading || currentStatus === "completed"}
              activeOpacity={0.7}
            >
              <Ionicons name={getStatusIcon()} size={14} color="white" />
            </TouchableOpacity>

            {currentStatus !== "not_started" &&
              currentStatus !== "completed" && (
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    styles.stopButton,
                    { opacity: isLoading ? 0.6 : 1 },
                  ]}
                  onPress={handleStopTimer}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Ionicons name="stop" size={14} color="white" />
                </TouchableOpacity>
              )}
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  progressContainer: {
    marginBottom: 6,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeContainer: {
    flex: 1,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  statusText: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 6,
  },
  controlButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stopButton: {
    backgroundColor: "#f44336",
  },
});

export default InlineTimer;
