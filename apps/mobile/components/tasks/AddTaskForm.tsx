import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTask } from '@/contexts/TaskContext';

export const AddTaskForm: React.FC = () => {
  const { addTask } = useTask();
  const [taskText, setTaskText] = useState('');

  const handleSubmit = () => {
    if (taskText.trim()) {
      addTask({ text: taskText.trim() });
      setTaskText('');
    } else {
      Alert.alert('Error', 'Please enter a task description');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>Add New Task</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={taskText}
          onChangeText={setTaskText}
          placeholder="Enter task description..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          onSubmitEditing={handleSubmit}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.addButton, !taskText.trim() && styles.addButtonDisabled]}
          disabled={!taskText.trim()}
        >
          <ThemedText style={styles.addButtonText}>Add Task</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  title: {
    marginBottom: 16,
  },
  inputContainer: {
    gap: 12,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
