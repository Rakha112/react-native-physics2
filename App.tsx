import {StyleSheet, View, useWindowDimensions} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';
import Genre from './src/components/Genre';
import musicGenres, {GenreType} from './src/data/data';

const App = () => {
  const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = useWindowDimensions();
  const [renderGenre, setRenderGenre] = useState<GenreType[]>([]);
  const pos = useSharedValue<{x: number; y: number; r: number}[]>([]);

  useDerivedValue(() => {
    for (let i = 0; i < pos.value.length; i++) {
      pos.modify(value => {
        'worklet';
        if (pos.value[i].y > 100) {
          value[i] = {
            x: pos.value[i].x,
            y: pos.value[i].y - 5,
            r: pos.value[i].r,
          };
        }

        return value;
      });
    }

    for (let i = 0; i < pos.value.length; i++) {
      for (let j = i; j < pos.value.length; j++) {
        const circleA = pos.value[i];
        const circleB = pos.value[j];

        // Calculate the distance on both axes
        const dx = circleB.x + circleB.r - (circleA.x + circleA.r);
        const dy = circleB.y + circleB.r - (circleA.y + circleA.r);
        // Calculate the distance between the two circles
        const distanceBetweenCenters = Math.sqrt(dx * dx + dy * dy);
        // Calculate the sum of the radius of the two circles
        const totalRadius = circleB.r + circleA.r;
        // Check if the two circles are overlapping
        const areOverlapping = distanceBetweenCenters < totalRadius;

        // If the circles are overlapping, move them apart
        if (areOverlapping) {
          // Calculate the overlap distance
          const overlapDistance = totalRadius - distanceBetweenCenters;
          // Calculate the percentage of overlap
          const percentOverlap = overlapDistance / totalRadius;

          // Move the circles apart
          pos.modify(value => {
            'worklet';
            // Check if the circle is below the 100 mark
            if (pos.value[i].y > 100) {
              // Check if the circle is at the edge of the screen
              if (
                pos.value[i].x <= 0 ||
                pos.value[i].x >= SCREEN_WIDTH - pos.value[i].r * 2
              ) {
                value[i] = {
                  x: pos.value[i].x,
                  y: pos.value[i].y - dy * percentOverlap,
                  r: pos.value[i].r,
                };
              } else {
                value[i] = {
                  x: pos.value[i].x - dx * percentOverlap,
                  y: pos.value[i].y - dy * percentOverlap,
                  r: pos.value[i].r,
                };
              }
            }
            return value;
          });

          pos.modify(value => {
            'worklet';
            if (pos.value[j].y > 100) {
              if (
                pos.value[j].x <= 0 ||
                pos.value[j].x >= SCREEN_WIDTH - pos.value[j].r * 2
              ) {
                value[j] = {
                  x: pos.value[j].x,
                  y: pos.value[j].y + dy * percentOverlap,
                  r: pos.value[j].r,
                };
              } else {
                value[j] = {
                  x: pos.value[j].x + dx * percentOverlap,
                  y: pos.value[j].y + dy * percentOverlap,
                  r: pos.value[j].r,
                };
              }
            }
            return value;
          });
        }
      }
    }
  });

  // useAnimatedReaction hook to detect changes in the pos value
  useAnimatedReaction(
    () => {
      return pos.value;
    },
    (currentValue, previousValue) => {
      // detect if the value has changed
      if (currentValue !== previousValue) {
        // get the last index of the array
        const index = pos.value.length - 1;
        // check if the index is less than the length of the musicGenres array
        if (index <= musicGenres.length - 1) {
          // add the genre to the renderGenre array
          runOnJS(setRenderGenre)([...renderGenre, musicGenres[index]]);
        }
      }
    },
  );

  useEffect(() => {
    'worklet';
    // function to generate random number
    const getRandomNumber = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // calculate the radius of the circle based on the length of the text
    const calculateRadius = (text: string): number => {
      const textLength = text.length;
      const baseRadius = 20; // Set your desired base radius here
      const radiusIncrement = 5; // Set the increment value for each character here
      return baseRadius + textLength * radiusIncrement;
    };

    // timer function
    const timer = (ms: number) => new Promise(res => setTimeout(res, ms));

    const load = async () => {
      for (var i = 0; i < musicGenres.length; i++) {
        // calculate the radius of the circle
        const radius = calculateRadius(musicGenres[i].name);

        // calculate the diameter of the circle
        const diameter = radius * 2;

        // generate random x and y position for the circle
        const randomX = getRandomNumber(radius, SCREEN_WIDTH - diameter);
        const randomY = getRandomNumber(
          SCREEN_HEIGHT / 2,
          SCREEN_HEIGHT - diameter,
        );

        // add position the circle randomly on the screen
        pos.value = [
          ...pos.value,
          {
            x: randomX,
            y: randomY,
            r: radius,
          },
        ];

        // Wait for a short time before adding the next bubble
        await timer(250);
      }
    };

    // load the circles
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {renderGenre.map((item, index) => {
        return (
          <Genre
            text={item.name}
            color={item.color}
            key={index}
            pos={pos}
            index={index}
          />
        );
      })}
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
