import { FlatList, Pressable, Text } from 'react-native';

import { DAILY_ENTRY_LIST_LABELS, ENTRY_ICONS } from './constants';
import { styles } from './styles';

import type { DailyEntryListProps } from './DailyEntryList.types';
import type { DailyEntry } from '../../dailyNote.types';
import type { ReactElement } from 'react';
import type { ListRenderItem } from 'react-native';

const keyForEntry = (entry: DailyEntry, index: number): string =>
  `${entry.kind}-${entry.time}-${index}`;

const renderEmpty = (): ReactElement => (
  <Text style={styles.empty}>{DAILY_ENTRY_LIST_LABELS.empty}</Text>
);

export const DailyEntryList = ({ entries, onPressEntry }: DailyEntryListProps): ReactElement => {
  const renderEntry: ListRenderItem<DailyEntry> = ({ item }) => (
    <Pressable accessibilityRole="button" onPress={() => onPressEntry(item)} style={styles.row}>
      <Text style={styles.icon}>{ENTRY_ICONS[item.kind]}</Text>
      <Text style={styles.time}>{item.time}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </Pressable>
  );

  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={entries}
      keyExtractor={keyForEntry}
      ListEmptyComponent={renderEmpty}
      renderItem={renderEntry}
    />
  );
};
