import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, FlatList, TextInput, Keyboard, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskItem from '../../components/ui/TaskItem';
import FloatingActionButton from '../../components/ui/FloatingActionButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const TASKS_STORAGE_KEY = '@tasked_tasks';

export default function TaskListScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const inputTranslateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (jsonValue != null) {
          const loadedTasks: Task[] = JSON.parse(jsonValue);
          // Sort: incomplete tasks first, then completed tasks
          const incompleteTasks = loadedTasks.filter(task => !task.completed);
          const completedTasks = loadedTasks.filter(task => task.completed);
          setTasks([...incompleteTasks, ...completedTasks]);
        }
      } catch (e) {
        console.error("Failed to load tasks from storage", e);
      } finally {
        setIsDataLoaded(true);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (isDataLoaded) {
      const saveTasks = async () => {
        try {
          const jsonValue = JSON.stringify(tasks);
          await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
        } catch (e) {
          console.error("Failed to save tasks to storage", e);
        }
      };

      saveTasks();
    }
  }, [tasks, isDataLoaded]);

  useEffect(() => {
    let isKeyboardVisible = false;
    
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      if (!isKeyboardVisible) {
        isKeyboardVisible = true;
        setKeyboardHeight(e.endCoordinates.height);
      }
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      if (isKeyboardVisible) {
        isKeyboardVisible = false;
        setKeyboardHeight(0);
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleAddTask = useCallback(() => {
    if (inputText.trim() === '') {
      setInputVisible(false);
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newTask: Task = {
      id: Date.now().toString(),
      title: inputText.trim(),
      completed: false,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setInputText('');
    setInputVisible(false);
  }, [inputText]);

  const handleToggleTask = (id: string) => {
    // Custom smooth animation for task movement
    LayoutAnimation.configureNext({
      duration: 400,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
        initialVelocity: 0.3,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      );
      
      // Sort: incomplete tasks first, then completed tasks
      const incompleteTasks = updatedTasks.filter(task => !task.completed);
      const completedTasks = updatedTasks.filter(task => task.completed);
      
      return [...incompleteTasks, ...completedTasks];
    });
  };

  const handleEditTask = (id: string, newTitle: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, title: newTitle } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  useEffect(() => {
    if (inputVisible) {
      Animated.parallel([
        Animated.spring(inputOpacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }),
        Animated.spring(inputTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 300,
          friction: 20,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(inputOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(inputTranslateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [inputVisible, inputOpacity, inputTranslateY]);

  const handleFabPress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>tasked</Text>

      <Animated.View
        style={[
          styles.inputContainer,
          {
            opacity: inputOpacity,
            transform: [{ translateY: inputTranslateY }],
          },
        ]}
        pointerEvents={inputVisible ? 'auto' : 'none'}
      >
        {inputVisible && (
          <>
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
          </>
        )}
      </Animated.View>

      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
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
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          removeClippedSubviews={false}
        />
      </KeyboardAvoidingView>

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
  keyboardAvoidingView: {
    flex: 1,
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
    paddingHorizontal: 20,
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