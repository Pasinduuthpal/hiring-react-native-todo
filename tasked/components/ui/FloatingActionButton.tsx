import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, X } from 'react-native-feather';

type FabProps = {
  onPress: () => void;
  isInputVisible?: boolean;
};

const FloatingActionButton = ({ onPress, isInputVisible = false }: FabProps) => {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      {isInputVisible ? (
        <X color="#fff" width={28} height={28} />
      ) : (
        <Plus color="#fff" width={28} height={28} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#5A8FFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default FloatingActionButton;
