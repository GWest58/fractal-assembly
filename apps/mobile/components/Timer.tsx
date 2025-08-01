import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TimerService } from "../services/timerService";
import { TimerStatusResponse, TimerStatus } from "../types/Task";

interface TimerProps {
  taskId: string;
  durationSeconds?: number;
  timerStatus?: TimerStatus;
  onTimerComplete?: () => void;
  onTimerUpdate?: (status: TimerStatusResponse) => void;
}

export const Timer: React.FC<TimerProps> = ({
  taskId,
  durationSeconds,
  timerStatus = "not_started",
  onTimerComplete,
  onTimerUpdate,
}) => {
  const [currentStatus, setCurrentStatus] = useState<TimerStatus>(timerStatus);
  const [timeRemaining, setTimeRemaining] = useState<number>(
    durationSeconds || 0,
  );
  const [elapsed, setElapsed] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const updateTimerStatus = async () => {
    try {
      const status = await TimerService.getTimerStatus(taskId);
      setCurrentStatus(status.status);
      setElapsed(status.elapsed);
      setTimeRemaining(status.remainingSeconds || 0);

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
  };

  const handleStartTimer = async () => {
    if (!durationSeconds) {
      Alert.alert(
        "No Duration Set",
        "Please set a duration for this task before starting the timer.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await TimerService.startTimer(taskId);
      setCurrentStatus("running");
      await updateTimerStatus();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to start timer",
      );
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
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to pause timer",
      );
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
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to stop timer",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    return TimerService.formatTime(seconds);
  };

  const getProgressPercentage = (): number => {
    if (!durationSeconds || durationSeconds === 0) return 0;
    return (elapsed / durationSeconds) * 100;
  };

  const renderTimerControls = () => {
    switch (currentStatus) {
      case "not_started":
        return (
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={handleStartTimer}
            disabled={isLoading || !durationSeconds}
          >
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        );

      case "running":
        return (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={handlePauseTimer}
              disabled={isLoading}
            >
              <Ionicons name="pause" size={24} color="white" />
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStopTimer}
              disabled={isLoading}
            >
              <Ionicons name="stop" size={24} color="white" />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        );

      case "paused":
        return (
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[styles.controlButton, styles.resumeButton]}
              onPress={handleStartTimer}
              disabled={isLoading}
            >
              <Ionicons name="play" size={24} color="white" />
              <Text style={styles.buttonText}>Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStopTimer}
              disabled={isLoading}
            >
              <Ionicons name="stop" size={24} color="white" />
              <Text style={styles.buttonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        );

      case "completed":
        return (
          <View style={styles.completedContainer}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.completedText}>Timer Completed!</Text>
            <TouchableOpacity
              style={[styles.controlButton, styles.resetButton]}
              onPress={handleStopTimer}
              disabled={isLoading}
            >
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (!durationSeconds) {
    return (
      <View style={styles.noDurationContainer}>
        <Ionicons name="time-outline" size={24} color="#666" />
        <Text style={styles.noDurationText}>No duration set</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timer Display */}
      <View style={styles.timerDisplay}>
        <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
        <Text style={styles.statusText}>
          {currentStatus === "running"
            ? "Running"
            : currentStatus === "paused"
              ? "Paused"
              : currentStatus === "completed"
                ? "Completed"
                : "Ready"}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${getProgressPercentage()}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {elapsed > 0
            ? `${formatTime(elapsed)} / ${formatTime(durationSeconds)}`
            : formatTime(durationSeconds)}
        </Text>
      </View>

      {/* Controls */}
      {renderTimerControls()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  noDurationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginVertical: 8,
  },
  noDurationText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#666",
  },
  timerDisplay: {
    alignItems: "center",
    marginBottom: 16,
  },
  timeText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2c3e50",
    fontVariant: ["tabular-nums"],
  },
  statusText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    gap: 8,
  },
  startButton: {
    backgroundColor: "#4CAF50",
  },
  pauseButton: {
    backgroundColor: "#FF9800",
  },
  resumeButton: {
    backgroundColor: "#4CAF50",
  },
  stopButton: {
    backgroundColor: "#f44336",
  },
  resetButton: {
    backgroundColor: "#6c757d",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  completedContainer: {
    alignItems: "center",
    gap: 8,
  },
  completedText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
  },
});

export default Timer;
