import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from 'react-native';
import { X } from 'react-native-feather';

type TaskInputProps = {
  visible: boolean;
  onClose: () => void;
  onAddTask: (title: string) => void;
};

const TaskInput = ({ visible, onClose, onAddTask }: TaskInputProps) => {
  const [title, setTitle] = useState('');

  const handleAddTask = () => {
    if (title.trim() === '') return;
    onAddTask(title);
    setTitle('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.inputContainer}>
          <View style={styles.checkboxPlaceholder} />
          <TextInput
            style={styles.input}
            placeholder="What do you need to do?"
            value={title}
            onChangeText={setTitle}
            autoFocus
            onSubmitEditing={handleAddTask}
            returnKeyType="go"
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X color="#aaa" width={28} height={28} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
  },
  checkboxPlaceholder: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  closeButton: {
    marginLeft: 10,
  },
});

export default TaskInput;
