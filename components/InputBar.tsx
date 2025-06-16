/**
 * InputBar
 *
 * A visually distinct text input area pinned to the top of the screen. It
 * displays the composed text and offers a button to copy that text to the
 * clipboard. The bar is implemented with NativeWind classes and a subtle
 * Reanimated scaling interaction on the copy button.
 */
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
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
 * Renders the large input bar with copy-to-clipboard functionality.
 */
export const InputBar: FC<InputBarProps> = ({ value, onClear }) => {
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

    return (
        <View className="w-full bg-gray-100 px-4 py-5 border-b border-gray-300 flex-row items-center justify-between gap-3">
            <Text
                className="flex-1 text-2xl font-bold font-mono text-gray-800"
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {value || 'Type something…'}
            </Text>

            <ScalingPressable onPress={handleCopy}>
                <Text className="text-white font-semibold">Copy</Text>
            </ScalingPressable>
        </View>
    );
};