import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Check, Trash } from 'react-native-feather';
import { Swipeable } from 'react-native-gesture-handler';

type TaskItemProps = {
  item: {
    id: string;
    title: string;
    completed: boolean;
  };
  onToggle: () => void;
  onEdit: (newTitle: string) => void;
  onDelete: () => void;
};

const TaskItem = ({ item, onToggle, onEdit, onDelete }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(item.title);
  const swipeableRef = useRef<Swipeable>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const checkboxScaleAnim = useRef(new Animated.Value(item.completed ? 1 : 0)).current;
  const prevCompletedRef = useRef(item.completed);

  useEffect(() => {
    if (!isEditing) {
      setCurrentTitle(item.title);
    }
  }, [item.title, isEditing]);

  useEffect(() => {
    // Animate checkbox checkmark
    Animated.spring(checkboxScaleAnim, {
      toValue: item.completed ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 20,
    }).start();
  }, [item.completed, checkboxScaleAnim]);

  useEffect(() => {
    // Animate when task completion status changes
    if (prevCompletedRef.current !== item.completed) {
      if (item.completed) {
        // Task just completed - slide down and fade slightly
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 200,
            friction: 15,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.7,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        // Task uncompleted - slide up and fade back in
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 15,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
      prevCompletedRef.current = item.completed;
    }
  }, [item.completed, slideAnim, fadeAnim]);

  const handleSave = () => {
    if (currentTitle.trim() === '') {
      setCurrentTitle(item.title);
    } else {
      onEdit(currentTitle.trim());
    }
    setIsEditing(false);
  };

  const handleTogglePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
    ]).start();
    onToggle();
  };

  const handleDelete = () => {
    swipeableRef.current?.close();
    onDelete();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Trash color="#fff" width={22} height={22} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const slideDown = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  const TaskContent = (
    <Animated.View
      style={[
        styles.itemContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideDown }],
        },
      ]}
    >
      <TouchableOpacity style={styles.checkboxContainer} onPress={handleTogglePress}>
        <Animated.View
          style={[
            styles.box,
            item.completed ? styles.boxChecked : styles.boxUnchecked,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: checkboxScaleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
              opacity: checkboxScaleAnim,
            }}
          >
            <Check color="#fff" width={18} height={18} />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {isEditing ? (
        <TextInput
          style={styles.title}
          value={currentTitle}
          onChangeText={setCurrentTitle}
          autoFocus
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          returnKeyType="go"
        />
      ) : (
        <TouchableOpacity
          style={styles.titleContainer}
          onLongPress={() => setIsEditing(true)}
        >
          <Text
            style={[
              styles.title,
              item.completed ? styles.titleCompleted : styles.titleNormal,
            ]}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
      {TaskContent}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    marginRight: 15,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  boxUnchecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  boxChecked: {
    backgroundColor: '#54A7A7',
    borderColor: '#54A7A7',
  },
  titleContainer: {
    flex: 1,
    paddingVertical: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  titleNormal: {
    color: '#000',
  },
  titleCompleted: {
    color: '#888',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    flex: 1,
  },
});

export default TaskItem;