import { Modal, Pressable, Text } from 'react-native';

import { AppButton } from '@/components/AppButton/AppButton';

import { LOG_CHOOSER_LABELS, LOG_CHOOSER_OPTIONS } from './constants';
import { styles } from './styles';

import type { LogChooserProps } from './LogChooser.types';
import type { ReactElement } from 'react';

const absorbPress = (): void => {};

export const LogChooser = ({ visible, onSelect, onClose }: LogChooserProps): ReactElement => (
  <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
    <Pressable onPress={onClose} style={styles.backdrop}>
      <Pressable onPress={absorbPress} style={styles.card}>
        <Text style={styles.title}>{LOG_CHOOSER_LABELS.title}</Text>
        {LOG_CHOOSER_OPTIONS.map((option) => (
          <AppButton key={option.kind} label={option.label} onPress={() => onSelect(option.kind)} />
        ))}
        <AppButton label={LOG_CHOOSER_LABELS.cancel} onPress={onClose} tone="secondary" />
      </Pressable>
    </Pressable>
  </Modal>
);
