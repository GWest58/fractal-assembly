import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { Spacing, BorderRadius, Shadows } from "@/constants/DesignTokens";

export interface DropdownOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: object;
}

export function Dropdown({
  options,
  value,
  onSelect,
  placeholder = "Select an option",
  disabled = false,
  style,
}: DropdownProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dropdownTop, setDropdownTop] = useState(0);
  const [dropdownLeft, setDropdownLeft] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const buttonRef = useRef<any>(null);
  const colorScheme = useColorScheme();

  const selectedOption = options.find((option) => option.value === value);

  const openDropdown = () => {
    if (disabled) return;

    buttonRef.current?.measure(
      (
        fx: number,
        fy: number,
        width: number,
        height: number,
        px: number,
        py: number,
      ) => {
        setDropdownTop(py + height);
        setDropdownLeft(px);
        setDropdownWidth(width);
        setIsVisible(true);
      },
    );
  };

  const closeDropdown = () => {
    setIsVisible(false);
  };

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    closeDropdown();
  };

  const renderDropdownOption = ({ item }: { item: DropdownOption }) => (
    <TouchableOpacity
      style={[
        styles.dropdownOption,
        {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderBottomColor: Colors[colorScheme ?? "light"].separator,
        },
        item.value === value && {
          backgroundColor: Colors[colorScheme ?? "light"].primary + "15",
        },
        item.disabled && styles.disabledOption,
      ]}
      onPress={() => !item.disabled && handleSelect(item.value)}
      disabled={item.disabled}
    >
      <ThemedText
        type="body"
        hierarchy={item.value === value ? "primary" : "secondary"}
        style={[styles.optionText, item.disabled && styles.disabledOptionText]}
      >
        {item.label}
      </ThemedText>
      {item.value === value && (
        <ThemedText
          style={[
            styles.checkmark,
            { color: Colors[colorScheme ?? "light"].primary },
          ]}
        >
          ✓
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        style={[
          styles.dropdownButton,
          {
            backgroundColor: Colors[colorScheme ?? "light"].gray6,
            borderColor: Colors[colorScheme ?? "light"].separator,
          },
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={openDropdown}
        disabled={disabled}
      >
        <ThemedText
          type="body"
          hierarchy={selectedOption ? "primary" : "secondary"}
          style={styles.buttonText}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </ThemedText>
        <ThemedText
          style={[
            styles.arrow,
            { color: Colors[colorScheme ?? "light"].textSecondary },
            isVisible && styles.arrowUp,
          ]}
        >
          ▼
        </ThemedText>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDropdown}
        >
          <View
            style={[
              styles.dropdown,
              {
                top: dropdownTop,
                left: dropdownLeft,
                width: dropdownWidth,
                backgroundColor: Colors[colorScheme ?? "light"].background,
                borderColor: Colors[colorScheme ?? "light"].separator,
              },
            ]}
          >
            <FlatList
              data={options}
              renderItem={renderDropdownOption}
              keyExtractor={(item) => item.value}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: Spacing.sm,
    transform: [{ rotate: "0deg" }],
  },
  arrowUp: {
    transform: [{ rotate: "180deg" }],
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  dropdown: {
    position: "absolute",
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: 200,
    ...Shadows.medium,
  },
  dropdownList: {
    borderRadius: BorderRadius.md,
  },
  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 44,
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionText: {
    flex: 1,
  },
  disabledOptionText: {
    opacity: 0.5,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
});
