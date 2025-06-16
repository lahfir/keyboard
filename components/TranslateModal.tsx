/**
 * TranslateModal
 *
 * Displays the result of the gibberish translator in a visually rich,
 * centered modal. It uses a card-based layout with a serene color palette,
 * custom typography, and a dismiss button. The modal is non-dismissible on
 * background tap to prevent accidental closure.
 */
import { FC, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, Text, View, ScrollView, Animated } from 'react-native';
import { TTranslationResult } from 'types';

// Fake progress bar component
const FakeProgressBar: FC<{ loading: boolean }> = ({ loading }) => {
    const progress = useRef(new Animated.Value(0)).current;
    const [show, setShow] = useState(loading);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (loading) {
            setShow(true);
            progress.setValue(0);
            // Fake a loading progress
            interval = setInterval(() => {
                progress.stopAnimation((value) => {
                    if (value < 90) {
                        Animated.timing(progress, {
                            toValue: value + Math.random() * 15,
                            duration: 400,
                            useNativeDriver: false,
                        }).start();
                    }
                });
            }, 500);
        } else {
            Animated.timing(progress, {
                toValue: 100,
                duration: 300,
                useNativeDriver: false,
            }).start(() => setTimeout(() => setShow(false), 200));
            if (interval) clearInterval(interval);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [loading, progress]);

    const widthInterpolate = progress.interpolate({
        inputRange: [0, 100],
        outputRange: ['0%', '100%'],
    });

    if (!show) return null;

    return (
        <View className="h-1.5 bg-sky-100 w-full">
            <Animated.View
                className="h-full bg-sky-400"
                style={{ width: widthInterpolate }}
            />
        </View>
    );
};

interface TranslateModalProps {
    visible: boolean;
    result?: TTranslationResult;
    onClose: () => void;
    loading: boolean;
    error?: string | null;
}

export const TranslateModal: FC<TranslateModalProps> = ({
    visible,
    result,
    onClose,
    loading,
    error,
}) => {
    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/60 p-4">
                {/* The main modal card */}
                <View className="w-full max-w-md max-h-[90vh] bg-gray-50 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <View className="px-5 py-3 bg-white flex-row items-center justify-between border-b border-gray-200">
                        <View className="flex-row items-center gap-2">
                            <Text className="text-2xl">🪶</Text>
                            <Text className="text-gray-700 font-bold text-base">
                                Spiritual Translation
                            </Text>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="h-8 w-8 bg-gray-200 rounded-full items-center justify-center active:bg-gray-300"
                        >
                            <Text className="text-gray-600 text-lg -mt-0.5">✕</Text>
                        </Pressable>
                    </View>

                    <FakeProgressBar loading={loading} />

                    {/* Content */}
                    <ScrollView contentContainerClassName="p-5">
                        {loading && !error && (
                            <Text className="text-center text-gray-500 py-10">
                                Translating your message...
                            </Text>
                        )}
                        {error && (
                            <View className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <Text className="text-center text-red-700 font-semibold">
                                    {error}
                                </Text>
                            </View>
                        )}
                        {result && !loading && (
                            <View className="gap-5">
                                {/* Main Translation Card */}
                                <View className="p-5 bg-white rounded-lg shadow-sm border border-gray-100">
                                    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">
                                        Translation
                                    </Text>
                                    <Text
                                        style={{ fontFamily: 'serif' }}
                                        className="text-2xl italic text-center text-gray-800"
                                    >
                                        “{result.translation}”
                                    </Text>
                                </View>

                                {/* Interpretation Card */}
                                <View>
                                    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Interpretation Process
                                    </Text>
                                    <View className="p-4 bg-white rounded-lg border border-gray-100">
                                        <Text className="text-base text-gray-700 leading-relaxed">
                                            {result.interpretation}
                                        </Text>
                                    </View>
                                </View>

                                {/* Final Insight Card */}
                                <View className="mt-2">
                                    <Text className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Spiritual Message
                                    </Text>
                                    <View className="p-5 bg-teal-50 border border-teal-200 rounded-lg">
                                        <Text className="text-lg text-center font-semibold text-teal-800">
                                            {result.spiritualMessage}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}; 