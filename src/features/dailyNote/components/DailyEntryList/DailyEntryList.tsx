import { FlatList, Text, View } from 'react-native';

import { DAILY_ENTRY_LIST_LABELS, ENTRY_ICONS } from './constants';
import { styles } from './styles';

import type { DailyEntryListProps } from './DailyEntryList.types';
import type { DailyEntry } from '../../dailyNote.types';
import type { ReactElement } from 'react';

const keyForEntry = (entry: DailyEntry, index: number): string =>
  `${entry.kind}-${entry.time}-${index}`;

const renderEntry = ({ item }: { item: DailyEntry }): ReactElement => (
  <View style={styles.row}>
    <Text style={styles.icon}>{ENTRY_ICONS[item.kind]}</Text>
    <Text style={styles.time}>{item.time}</Text>
    <Text style={styles.description}>{item.description}</Text>
  </View>
);

const renderEmpty = (): ReactElement => (
  <Text style={styles.empty}>{DAILY_ENTRY_LIST_LABELS.empty}</Text>
);

export const DailyEntryList = ({ entries }: DailyEntryListProps): ReactElement => (
  <FlatList
    contentContainerStyle={styles.content}
    data={entries}
    keyExtractor={keyForEntry}
    ListEmptyComponent={renderEmpty}
    renderItem={renderEntry}
  />
);
