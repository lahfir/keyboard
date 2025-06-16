/**
 * CustomKeyboard
 *
 * A fully custom virtual keyboard that occupies all remaining space beneath the
 * `InputBar`. It displays uppercase Latin letters arranged in a grid. After
 * every key press the array of letters is shuffled, causing the layout to
 * change dynamically.
 */
import { FC, useCallback, useMemo, useState } from 'react';
import {
    Dimensions,
    Text,
    View,
    Pressable,
    StyleSheet,
    LayoutChangeEvent,
} from 'react-native';
import { TKey } from 'types';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Simple immutable Fisher–Yates shuffle.
 */
function shuffleArray<T>(array: readonly T[]): T[] {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

type CustomKeyboardProps = {
    /** Callback triggered when a key is pressed. Receives the selected letter. */
    onKeyPress: (key: TKey) => void;
};

/**
 * Renders the letter-based keyboard with a reshuffle-on-press behaviour.
 */
export const CustomKeyboard: FC<CustomKeyboardProps> = ({ onKeyPress }) => {
    const ALPHABET = useMemo((): TKey[] =>
        Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
        []);

    const [keys, setKeys] = useState<TKey[]>(() => shuffleArray(ALPHABET));
    const [layout, setLayout] = useState<{ width: number; height: number } | null>(
        null,
    );

    const handleLayout = (event: LayoutChangeEvent) => {
        const { width, height } = event.nativeEvent.layout;
        setLayout({ width, height });
    };

    const handleKeyPress = useCallback(
        (key: TKey) => {
            onKeyPress(key);
            Haptics.selectionAsync();
        },
        [onKeyPress],
    );

    const reshuffle = useCallback(() => {
        setKeys(shuffleArray(ALPHABET));
    }, [ALPHABET]);

    const numColumns = 5;
    const numRows = Math.ceil(ALPHABET.length / numColumns);

    const buttonWidth = layout ? layout.width / numColumns : 0;
    const buttonHeight = layout ? layout.height / numRows : 0;

    const KeyButton: FC<{ letter: TKey }> = ({ letter }) => {
        const progress = useSharedValue(0);

        const animatedStyle = useAnimatedStyle(() => {
            const scale = 1 - progress.value * 0.15;
            return {
                transform: [{ scale }],
            };
        });

        const animatedTextStyle = useAnimatedStyle(() => ({
            color: interpolateColor(
                progress.value,
                [0, 1],
                ['#1F2937', '#FFFFFF'],
            ),
        }));

        const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
        const AnimatedText = Animated.createAnimatedComponent(Text);

        return (
            <AnimatedPressable
                onPressIn={() => {
                    handleKeyPress(letter);
                    progress.value = withTiming(1, { duration: 150 });
                }}
                onPressOut={() => {
                    progress.value = withTiming(0, { duration: 400 });
                    setTimeout(reshuffle, 50);
                }}
                style={[
                    { width: buttonWidth, height: buttonHeight },
                    animatedStyle,
                ]}
                className="items-center justify-center rounded-lg overflow-hidden border-gray-200 shadow-lg border"
            >
                <LinearGradient
                    colors={['#F9FAFB', '#E5E7EB']}
                    style={StyleSheet.absoluteFill}
                />
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        useAnimatedStyle(() => ({ opacity: progress.value })),
                    ]}
                >
                    <LinearGradient
                        colors={['#8B5CF6', '#6366F1']}
                        style={StyleSheet.absoluteFill}
                    />
                </Animated.View>

                <AnimatedText
                    style={animatedTextStyle}
                    className="text-3xl font-bold"
                >
                    {letter}
                </AnimatedText>
            </AnimatedPressable>
        );
    };

    const totalCells = numColumns * numRows;
    const placeholders = totalCells - keys.length;

    return (
        <View
            className="flex-1 flex-wrap flex-row content-start"
            onLayout={handleLayout}
        >
            {layout && (
                <>
                    {keys.map((k) => (
                        <KeyButton key={k} letter={k} />
                    ))}
                    {Array.from({ length: placeholders }).map((_, idx) => (
                        <View
                            key={`placeholder-${idx}`}
                            style={{ width: buttonWidth, height: buttonHeight }}
                        />
                    ))}
                </>
            )}
        </View>
    );
}; 