import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Plus, X } from 'react-native-feather';

type FabProps = {
  onPress: () => void;
  isInputVisible?: boolean;
  keyboardHeight?: number;
  bottomInset?: number;
};

const FloatingActionButton = ({ onPress, isInputVisible = false, keyboardHeight = 0, bottomInset = 0 }: FabProps) => {
  const bottomPosition = keyboardHeight > 0 
    ? keyboardHeight + bottomInset + 20 
    : 40 + bottomInset;

  return (
    <TouchableOpacity 
      style={[
        styles.fab,
        { bottom: bottomPosition }
      ]} 
      onPress={onPress}
    >
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
    right: 20,
    backgroundColor: '#54A7A7',
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
