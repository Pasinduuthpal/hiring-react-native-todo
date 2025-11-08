import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Check } from 'react-native-feather';

type TaskItemProps = {
  item: {
    id: string;
    title: string;
    completed: boolean;
  };
  onToggle: () => void;
  onEdit: (newTitle: string) => void;
};

const TaskItem = ({ item, onToggle, onEdit }: TaskItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(item.title);

  useEffect(() => {
    if (!isEditing) {
      setCurrentTitle(item.title);
    }
  }, [item.title, isEditing]);

  const handleSave = () => {
    if (currentTitle.trim() === '') {
      setCurrentTitle(item.title);
    } else {
      onEdit(currentTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity style={styles.checkboxContainer} onPress={onToggle}>
        <View
          style={[
            styles.box,
            item.completed ? styles.boxChecked : styles.boxUnchecked,
          ]}
        >
          {item.completed && <Check color="#fff" width={18} height={18} />}
        </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
    backgroundColor: '#5A8FFF',
    borderColor: '#5A8FFF',
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
});

export default TaskItem;