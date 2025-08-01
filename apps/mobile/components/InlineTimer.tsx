import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
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
    const soundRef = useRef<Audio.Sound | null>(null);
    const notificationSentRef = useRef<boolean>(false);

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

    // Load sound and setup audio on component mount
    useEffect(() => {
      const loadSound = async () => {
        try {
          // Set audio mode to allow sounds even in silent mode
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
          });

          // Load timer completion sound
          const { sound } = await Audio.Sound.createAsync(
            require("../assets/sounds/timer-complete.wav"),
            { shouldPlay: false },
          );
          soundRef.current = sound;
        } catch (error) {
          console.log("Error setting up audio:", error);
        }
      };

      loadSound();

      // Cleanup sound on unmount
      return () => {
        if (soundRef.current) {
          soundRef.current.unloadAsync();
        }
      };
    }, []);

    const playTimerCompleteNotification = async () => {
      try {
        // Strong haptic feedback
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );

        // Try multiple sound approaches
        let soundPlayed = false;

        // Play sound if available
        if (soundRef.current) {
          try {
            await soundRef.current.setVolumeAsync(1.0);
            await soundRef.current.setPositionAsync(0);
            await soundRef.current.playAsync();
          } catch (soundError) {
            console.log("Sound playback failed:", soundError);
          }
        }

        // Show completion alert
        Alert.alert(
          "⏰ Timer Complete!",
          "Your timer has finished. Great job!",
          [{ text: "OK", style: "default" }],
          { cancelable: true },
        );

        // Delay API call to let sound finish playing
        setTimeout(() => {
          if (onTimerComplete) {
            onTimerComplete();
          }
        }, 1500);

        // Additional haptic sequence for emphasis
        const hapticSequence = [200, 400, 600];
        hapticSequence.forEach((delay) => {
          setTimeout(async () => {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
              console.log("Error with haptic sequence:", error);
            }
          }, delay);
        });
      } catch (error) {
        console.log("Error playing notification:", error);
      }
    };

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
        if (status.isExpired && !notificationSentRef.current) {
          notificationSentRef.current = true;

          // Play sound and haptic feedback FIRST, before any other callbacks
          await playTimerCompleteNotification();

          // onTimerComplete will be called when user dismisses alert
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
        notificationSentRef.current = false; // Reset notification flag when starting
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
        notificationSentRef.current = false; // Reset notification flag
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

        {/* Temporary Sound Test Button */}
        <TouchableOpacity
          style={{
            backgroundColor: "#FF6B6B",
            padding: 8,
            margin: 5,
            borderRadius: 5,
            alignItems: "center",
          }}
          onPress={async () => {
            await playTimerCompleteNotification();
          }}
        >
          <Caption1 style={{ color: "white", fontWeight: "bold" }}>
            🔊 Test Full Notification
          </Caption1>
        </TouchableOpacity>
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
