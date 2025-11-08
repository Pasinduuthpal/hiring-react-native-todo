import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Plus, X } from 'react-native-feather';

type FabProps = {
  onPress: () => void;
  isInputVisible?: boolean;
  bottomInset?: number;
};

const FloatingActionButton = ({ onPress, isInputVisible = false, bottomInset = 0 }: FabProps) => {
  // Fixed bottom position relative to parent container
  // The parent SafeAreaView will shrink when keyboard opens, so the button moves with it
  const bottomPosition = 20 + bottomInset;
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: isInputVisible ? 1 : 0,
        useNativeDriver: true,
        tension: 300,
        friction: 20,
      }),
    ]).start();
  }, [isInputVisible, rotateAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <TouchableOpacity 
      style={[
        styles.fab,
        { bottom: bottomPosition }
      ]} 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={{
          transform: [
            { rotate },
            { scale: scaleAnim },
          ],
        }}
      >
        {isInputVisible ? (
          <X color="#fff" width={28} height={28} />
        ) : (
          <Plus color="#fff" width={28} height={28} />
        )}
      </Animated.View>
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
