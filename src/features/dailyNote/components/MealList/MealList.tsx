import { FlatList, Text, View } from 'react-native';

import { MEAL_LIST_LABELS } from './constants';
import { styles } from './styles';

import type { MealListProps } from './MealList.types';
import type { ParsedMeal } from '../../dailyNote.types';
import type { ReactElement } from 'react';

const keyForMeal = (meal: ParsedMeal, index: number): string => `${meal.time}-${index}`;

const renderMeal = ({ item }: { item: ParsedMeal }): ReactElement => (
  <View style={styles.row}>
    <Text style={styles.time}>{item.time}</Text>
    <Text style={styles.description}>{item.description}</Text>
  </View>
);

const renderEmpty = (): ReactElement => <Text style={styles.empty}>{MEAL_LIST_LABELS.empty}</Text>;

export const MealList = ({ meals }: MealListProps): ReactElement => (
  <FlatList
    contentContainerStyle={styles.content}
    data={meals}
    keyExtractor={keyForMeal}
    ListEmptyComponent={renderEmpty}
    renderItem={renderMeal}
  />
);
