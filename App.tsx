import { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import './global.css';

import { InputBar } from 'components/InputBar';
import { CustomKeyboard } from 'components/CustomKeyboard';

/**
 * Root component that wires the `InputBar` and `CustomKeyboard` together.
 */
export default function App() {
  const [text, setText] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <InputBar value={text} onClear={() => setText('')} />
      <CustomKeyboard onKeyPress={(key) => setText((prev) => prev + key)} />
    </SafeAreaView>
  );
}
