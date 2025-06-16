import { TKey } from 'types';

export type CustomKeyboardProps = {
    /** Callback triggered when a key is pressed. Receives the selected letter. */
    onKeyPress: (key: TKey) => void;
};