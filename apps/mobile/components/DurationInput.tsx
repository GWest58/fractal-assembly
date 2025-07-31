import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TimerService } from "../services/timerService";

interface DurationInputProps {
  initialDuration?: number; // in seconds
  onDurationChange: (seconds: number) => void;
  placeholder?: string;
  showPresets?: boolean;
}

export const DurationInput: React.FC<DurationInputProps> = ({
  initialDuration,
  onDurationChange,
  placeholder = "e.g., 5 minutes, 1h 30m, 0:30",
  showPresets = true,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [parsedSeconds, setParsedSeconds] = useState<number>(
    initialDuration || 0,
  );
  const [isValid, setIsValid] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Preset durations in seconds
  const presets = [
    { label: "5 min", seconds: 5 * 60 },
    { label: "10 min", seconds: 10 * 60 },
    { label: "15 min", seconds: 15 * 60 },
    { label: "25 min", seconds: 25 * 60 },
    { label: "30 min", seconds: 30 * 60 },
    { label: "1 hour", seconds: 60 * 60 },
  ];

  useEffect(() => {
    if (initialDuration) {
      setInputValue(formatDurationForInput(initialDuration));
      setParsedSeconds(initialDuration);
    }
  }, [initialDuration]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const formatDurationForInput = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      if (minutes > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${hours}h`;
    } else if (minutes > 0) {
      if (remainingSeconds > 0) {
        return `${minutes}m ${remainingSeconds}s`;
      }
      return `${minutes}m`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const handleInputChange = (text: string) => {
    setInputValue(text);

    // Clear any existing validation timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (text.trim() === "") {
      setParsedSeconds(0);
      setIsValid(true);
      setIsValidating(false);
      onDurationChange(0);
      return;
    }

    // Set validating state
    setIsValidating(true);

    // Debounce validation by 500ms to prevent auto-formatting while typing
    validationTimeoutRef.current = setTimeout(() => {
      try {
        const seconds = TimerService.parseDurationInput(text);
        if (seconds > 0) {
          setParsedSeconds(seconds);
          setIsValid(true);
          onDurationChange(seconds);
        } else {
          setIsValid(false);
        }
      } catch {
        setIsValid(false);
      }
      setIsValidating(false);
    }, 500);
  };

  const handlePresetSelect = (seconds: number) => {
    setParsedSeconds(seconds);
    setInputValue(""); // Clear input when preset is selected
    setIsValid(true);
    onDurationChange(seconds);
  };

  const handleClear = () => {
    setInputValue("");
    setParsedSeconds(0);
    setIsValid(true);
    onDurationChange(0);
  };

  const getInputStyles = () => {
    if (inputValue.trim() === "") {
      return styles.input;
    }
    if (isValidating) {
      return [styles.input, styles.inputValidating];
    }
    return isValid
      ? [styles.input, styles.inputValid]
      : [styles.input, styles.inputInvalid];
  };

  const showCurrentDuration = () => {
    return parsedSeconds > 0 && inputValue.trim() === "";
  };

  return (
    <View style={styles.container}>
      {/* Input Section */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Duration</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={getInputStyles()}
            value={inputValue}
            onChangeText={handleInputChange}
            placeholder={placeholder}
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Current duration display when no input */}
        {showCurrentDuration() && (
          <View style={styles.feedbackContainer}>
            <View style={styles.currentDurationFeedback}>
              <Ionicons name="time-outline" size={16} color="#007AFF" />
              <Text style={styles.currentDurationText}>
                Duration: {TimerService.formatTime(parsedSeconds)}
              </Text>
            </View>
          </View>
        )}

        {/* Validation feedback */}
        {inputValue.trim() !== "" && (
          <View style={styles.feedbackContainer}>
            {isValidating ? (
              <View style={styles.validatingFeedback}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.validatingText}>Parsing...</Text>
              </View>
            ) : isValid ? (
              <View style={styles.validFeedback}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.validText}>
                  Duration: {TimerService.formatTime(parsedSeconds)}
                </Text>
              </View>
            ) : (
              <View style={styles.invalidFeedback}>
                <Ionicons name="alert-circle" size={16} color="#f44336" />
                <Text style={styles.invalidText}>
                  Invalid format. Try "5 minutes", "1h 30m", or "0:30"
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Preset Buttons */}
      {showPresets && (
        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>Quick presets:</Text>
          <View style={styles.presetsContainer}>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset.seconds}
                style={[
                  styles.presetButton,
                  parsedSeconds === preset.seconds &&
                    inputValue === "" &&
                    styles.presetButtonActive,
                ]}
                onPress={() => handlePresetSelect(preset.seconds)}
              >
                <Text
                  style={[
                    styles.presetButtonText,
                    parsedSeconds === preset.seconds &&
                      inputValue === "" &&
                      styles.presetButtonTextActive,
                  ]}
                >
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Help Text */}
      <View style={styles.helpSection}>
        <Text style={styles.helpText}>
          Supported formats: "5 minutes", "1h 30m", "0:30", "90 seconds"
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "white",
    paddingRight: 40, // Space for clear button
  },
  inputValid: {
    borderColor: "#4CAF50",
    backgroundColor: "#f8fff8",
  },
  inputInvalid: {
    borderColor: "#f44336",
    backgroundColor: "#fff8f8",
  },
  inputValidating: {
    borderColor: "#666",
    backgroundColor: "#f8f8f8",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  feedbackContainer: {
    marginTop: 8,
  },
  validFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  validText: {
    color: "#4CAF50",
    fontSize: 14,
    fontWeight: "500",
  },
  currentDurationFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  currentDurationText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  validatingFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  validatingText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  invalidFeedback: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  invalidText: {
    color: "#f44336",
    fontSize: 14,
    flex: 1,
  },
  presetsSection: {
    marginBottom: 16,
  },
  presetsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  presetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f1f3f4",
    borderWidth: 1,
    borderColor: "#e1e3e4",
  },
  presetButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  presetButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  presetButtonTextActive: {
    color: "white",
  },
  helpSection: {
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});

export default DurationInput;
