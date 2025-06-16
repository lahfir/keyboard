/**
 * InputBar
 *
 * A visually distinct text input area anchored to the bottom of the screen. It
 * displays the composed text in a horizontally scrollable view, ensuring all
 * content is visible. It also offers "Copy" and "Clear" buttons.
 */
import { FC, useRef, useEffect } from 'react';
import { Pressable, Text, View, ScrollView } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import Toast from 'react-native-root-toast';

export type InputBarProps = {
    /** Current value of the composed text */
    value: string;
    /** Callback to clear text after copy */
    onClear: () => void;
};

/** Reanimated wrapper that scales down on press. */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ScalingPressable: FC<{ onPress: () => void; children: React.ReactNode }> = ({
    onPress,
    children,
}) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={() => {
                scale.value = withTiming(0.9, { duration: 60 });
            }}
            onPressOut={() => {
                scale.value = withTiming(1, { duration: 60 });
            }}
            style={animatedStyle}
            className="bg-blue-500 px-4 py-2 rounded-lg shadow-md active:bg-blue-600"
        >
            {children}
        </AnimatedPressable>
    );
};

/**
 * Renders the auto-scrolling input bar.
 */
export const InputBar: FC<InputBarProps> = ({ value, onClear }) => {
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (value.length) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [value]);

    const handleCopy = async () => {
        if (value) {
            await Clipboard.setStringAsync(value);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Toast.show('Text copied!', {
                duration: Toast.durations.SHORT,
                position: Toast.positions.BOTTOM,
            });
            onClear();
        }
    };

    const handleClear = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onClear();
    };

    return (
        <View className="w-full bg-gray-100 px-4 py-5 border-t border-gray-300 flex-row items-center justify-between gap-3">
            {/* Scrollable Text Area */}
            <View className="flex-1">
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="items-center"
                >
                    <Text className="text-2xl font-bold font-mono text-gray-800 pr-2">
                        {value || 'Type something…'}
                    </Text>
                </ScrollView>
            </View>

            {/* Action Buttons */}
            <View className="flex-row items-center gap-3">
                {value.length > 0 && (
                    <ScalingPressable onPress={handleClear}>
                        <Text className="text-white font-semibold">Clear</Text>
                    </ScalingPressable>
                )}
                <ScalingPressable onPress={handleCopy}>
                    <Text className="text-white font-semibold">Copy</Text>
                </ScalingPressable>
            </View>
        </View>
    );
};