import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import { useTasks } from '../../hooks/useTasks';
import { TaskService } from '../../services/TaskService';
import { TaskStorage } from '../../storage/TaskStorage';
import TaskItem from '../../components/ui/TaskItem';
import FloatingActionButton from '../../components/ui/FloatingActionButton';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Initialize services (could be moved to a context/provider for better DI)
const taskStorage = new TaskStorage();
const taskService = new TaskService(taskStorage);

export default function TaskListScreen() {
  const { tasks, addTask, toggleTask, editTask, deleteTask } = useTasks(taskService);

  const [inputVisible, setInputVisible] = useState(false);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const inputOpacity = useRef(new Animated.Value(0)).current;
  const inputTranslateY = useRef(new Animated.Value(-20)).current;

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

  const handleAddTask = async () => {
    if (inputText.trim() === '') {
      setInputVisible(false);
      return;
    }

    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await addTask(inputText);
      setInputText('');
      setInputVisible(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
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
      await toggleTask(id);
    } catch (error) {
      console.error('Failed to toggle task:', error);
    }
  };

  const handleEditTask = async (id: string, newTitle: string) => {
    try {
      await editTask(id, newTitle);
    } catch (error) {
      console.error('Failed to edit task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await deleteTask(id);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
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
    marginTop: 40,
    marginBottom: 10,
    paddingHorizontal: 40,
    fontFamily: 'TTFirsNeue-Bold',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 40,
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
