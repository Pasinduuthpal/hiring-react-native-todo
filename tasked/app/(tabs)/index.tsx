import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, FlatList, TextInput, Keyboard } from 'react-native';
import TaskItem from '../../components/ui/TaskItem';
import FloatingActionButton from '../../components/ui/FloatingActionButton';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleAddTask = () => {
    if (inputText.trim() === '') {
      setInputVisible(false);
      return;
    }
    const newTask: Task = {
      id: Date.now().toString(),
      title: inputText.trim(),
      completed: false,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setInputText('');
    setInputVisible(false);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleEditTask = (id: string, newTitle: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, title: newTitle } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const handleFabPress = () => {
    if (inputVisible) {
      setInputText('');
      setInputVisible(false);
    } else {
      setInputVisible(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const renderInputItem = () => {
    if (!inputVisible) return null;
    
    return (
      <View style={styles.inputContainer}>
        <View style={styles.checkboxPlaceholder} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="What do you need to do?"
          value={inputText}
          onChangeText={setInputText}
          autoFocus
          onSubmitEditing={handleAddTask}
          returnKeyType="go"
          blurOnSubmit={false}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>tasked</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            item={item}
            onToggle={() => handleToggleTask(item.id)}
            onEdit={(newTitle: string) => handleEditTask(item.id, newTitle)}
            onDelete={() => handleDeleteTask(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderInputItem}
      />

      <FloatingActionButton 
        onPress={handleFabPress}
        isInputVisible={inputVisible}
        keyboardHeight={keyboardHeight}
        bottomInset={insets.bottom}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20, 
  },
  listContent: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkboxPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 12,
    color: '#000',
  },
});