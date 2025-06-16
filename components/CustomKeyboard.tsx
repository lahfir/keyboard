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

/** Gradient pool for random letter key animations */
const GRADIENTS: readonly [string, string][] = [
    ['#8B5CF6', '#6366F1'], // violet → indigo
    ['#EC4899', '#F43F5E'], // pink → rose
    ['#14B8A6', '#06B6D4'], // teal → cyan
    ['#F97316', '#F59E0B'], // orange → amber
    ['#22C55E', '#84CC16'], // green → lime
    ['#EF4444', '#F97316'], // red → orange
];

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

type KeyData = {
    id: number;
    char: TKey;
};

type CustomKeyboardProps = {
    /** Callback triggered when a key is pressed. Receives the selected letter. */
    onKeyPress: (key: TKey) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

/**
 * A single, animated key button. By defining it outside the main component,
 * we ensure it's a stable component whose animations and state aren't reset
 * on every reshuffle.
 */
const KeyButton: FC<{
    letter: TKey;
    onPressIn: (key: TKey) => void;
    onPressOut: () => void;
    width: number;
    height: number;
}> = ({ letter, onPressIn, onPressOut, width, height }) => {
    const progress = useSharedValue(0);
    const [gradient, setGradient] = useState(GRADIENTS[0]);
    const isSpace = letter === ' ';

    const animatedStyle = useAnimatedStyle(() => {
        const scale = 1 - progress.value * 0.15;
        return {
            transform: [{ scale }],
        };
    });

    // Animations for letter keys
    const textAnimatedStyle = useAnimatedStyle(() => ({
        color: interpolateColor(
            progress.value,
            [0, 1],
            ['#1F2937', '#FFFFFF'],
        ),
    }));

    const pressInOverlayStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
    }));

    return (
        <AnimatedPressable
            onPressIn={() => {
                if (!isSpace) {
                    const randomIndex = Math.floor(Math.random() * GRADIENTS.length);
                    setGradient(GRADIENTS[randomIndex]);
                }
                onPressIn(letter);
                progress.value = withTiming(1, { duration: 150 });
            }}
            onPressOut={() => {
                progress.value = withTiming(0, { duration: 400 });
                onPressOut();
            }}
            style={[{ width, height }, animatedStyle]}
            className="items-center justify-center rounded-lg overflow-hidden border-gray-200 shadow-lg border"
        >
            {/* Common base gradient for all keys */}
            <LinearGradient
                colors={['#F9FAFB', '#E5E7EB']}
                style={StyleSheet.absoluteFill}
            />

            {isSpace ? (
                <>
                    {/* Press-in overlay for space */}
                    <Animated.View
                        style={[
                            StyleSheet.absoluteFill,
                            { backgroundColor: '#D1D5DB' }, // gray-300
                            pressInOverlayStyle,
                        ]}
                    />
                    <View className="h-2 w-3/5 bg-gray-500 rounded-full" />
                </>
            ) : (
                <>
                    {/* Press-in overlay for letters */}
                    <Animated.View
                        style={[StyleSheet.absoluteFill, pressInOverlayStyle]}
                    >
                        <LinearGradient
                            colors={gradient as [string, string]}
                            style={StyleSheet.absoluteFill}
                        />
                    </Animated.View>
                    <AnimatedText
                        style={textAnimatedStyle}
                        className="text-3xl font-bold"
                    >
                        {letter}
                    </AnimatedText>
                </>
            )}
        </AnimatedPressable>
    );
};

/**
 * Renders the letter-based keyboard with a reshuffle-on-press behaviour.
 */
export const CustomKeyboard: FC<CustomKeyboardProps> = ({ onKeyPress }) => {
    const ALPHABET = useMemo((): KeyData[] => {
        const letters = Array.from({ length: 26 }, (_, i) =>
            String.fromCharCode(65 + i),
        );
        const spaces = Array(4).fill(' '); // 4 spaces to make a perfect 30-key grid
        return [...letters, ...spaces].map((char, index) => ({
            id: index,
            char,
        }));
    }, []);

    const [keys, setKeys] = useState<KeyData[]>(() => shuffleArray(ALPHABET));
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
        setTimeout(() => {
            setKeys(shuffleArray(ALPHABET));
        }, 50);
    }, [ALPHABET]);

    const numColumns = 5;
    const numRows = Math.ceil(ALPHABET.length / numColumns);

    const buttonWidth = layout ? layout.width / numColumns : 0;
    const buttonHeight = layout ? layout.height / numRows : 0;

    const totalCells = numColumns * numRows;
    const placeholders = totalCells - keys.length;

    return (
        <View
            className="flex-1 flex-wrap flex-row content-start"
            onLayout={handleLayout}
        >
            {layout && (
                <>
                    {keys.map((item) => (
                        <KeyButton
                            key={item.id}
                            letter={item.char}
                            width={buttonWidth}
                            height={buttonHeight}
                            onPressIn={handleKeyPress}
                            onPressOut={reshuffle}
                        />
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