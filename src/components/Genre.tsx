import {StyleSheet, TouchableWithoutFeedback} from 'react-native';
import React, {useEffect} from 'react';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Props = {
  pos: SharedValue<{x: number; y: number; r: number}[]>;
  index: number;
  text: string;
  color: string;
};

const Genre = ({text, color, pos, index}: Props) => {
  const radius = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    'worklet';
    radius.value = withSpring(pos.value[index].r);
    opacity.value = withSpring(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: radius.value * 2,
      height: radius.value * 2,
      borderRadius: radius.value * 2,
      transform: [
        {translateX: pos.value[index].x},
        {translateY: pos.value[index].y},
      ],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        console.log('Pressed', text);
      }}>
      <Animated.View
        style={[styles.circle, {backgroundColor: color}, animatedStyle]}>
        <Animated.Text style={[styles.text, animatedTextStyle]}>
          {text}
        </Animated.Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default Genre;

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
