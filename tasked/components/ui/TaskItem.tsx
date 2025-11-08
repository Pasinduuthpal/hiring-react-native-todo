import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'react-native-feather';

type TaskItemProps = {
  item: {
    id: string;
    title: string;
    completed: boolean;
  };
};

const TaskItem = ({ item }: TaskItemProps) => {
  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity style={styles.checkboxContainer}>
        <View
          style={[
            styles.box,
            item.completed ? styles.boxChecked : styles.boxUnchecked,
          ]}
        >
          {item.completed && <Check color="#fff" width={18} height={18} />}
        </View>
      </TouchableOpacity>

      <Text
        style={[
          styles.title,
          item.completed ? styles.titleCompleted : styles.titleNormal,
        ]}
      >
        {item.title}
      </Text>
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
  title: {
    fontSize: 16,
    fontWeight: '500',
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