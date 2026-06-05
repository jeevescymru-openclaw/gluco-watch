import { KeyboardAvoidingView } from 'react-native';

import { styles } from './styles';

import type { KeyboardAvoidingScreenProps } from './KeyboardAvoidingScreen.types';
import type { ReactElement } from 'react';

// Expo's edge-to-edge mode (default in SDK 54+) stops Android from resizing the
// window for the keyboard, so a plain ScrollView never scrolls the focused input
// clear. Padding the layout by the measured keyboard height is what reveals it.
export const KeyboardAvoidingScreen = ({ children }: KeyboardAvoidingScreenProps): ReactElement => (
  <KeyboardAvoidingView behavior="padding" style={styles.flex}>
    {children}
  </KeyboardAvoidingView>
);
