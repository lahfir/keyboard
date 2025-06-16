import { useState } from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { RootSiblingParent } from 'react-native-root-siblings';

import './global.css';

import { InputBar } from 'components/InputBar';
import { CustomKeyboard } from 'components/CustomKeyboard';
import { TranslateModal } from 'components/TranslateModal';
import { translateGibberish } from 'utils/translate';
import { TTranslationResult } from 'types';

/**
 * Root component that wires the `InputBar` and `CustomKeyboard` together.
 */
export default function App() {
  const [text, setText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TTranslationResult>();
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setModalVisible(true);
    try {
      const res = await translateGibberish(text);
      setResult(res);
    } catch (err: any) {
      setError(err.message ?? 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <RootSiblingParent>
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        <CustomKeyboard onKeyPress={(key) => setText((prev) => prev + key)} />
        <InputBar value={text} onClear={() => setText('')} onTranslate={handleTranslate} />
        <TranslateModal
          visible={modalVisible}
          result={result}
          loading={loading}
          error={error}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </RootSiblingParent>
  );
}
