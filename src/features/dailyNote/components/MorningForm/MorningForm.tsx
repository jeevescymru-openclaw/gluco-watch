import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton/AppButton';
import { formatRating } from '@/components/RatingSelector/formatRating';
import { RatingSelector } from '@/components/RatingSelector/RatingSelector';

import { WAIST_UNIT } from '../../constants';
import { MORNING_FORM_LABELS, YESTERDAY_PREFIX } from './constants';
import { styles } from './styles';

import type { MorningFormProps } from './MorningForm.types';
import type { MorningEntry } from '../../dailyNote.types';
import type { ReactElement } from 'react';

const initialWaist = (initial: MorningEntry | null, yesterday: MorningEntry | null): string => {
  const prefill = initial?.waistCm ?? yesterday?.waistCm;
  return prefill !== undefined ? String(prefill) : '';
};

const formatYesterday = (yesterday: MorningEntry): string =>
  `${YESTERDAY_PREFIX}${yesterday.waistCm}${WAIST_UNIT}, ${formatRating(yesterday.bloat)}`;

export const MorningForm = ({
  initial,
  yesterday,
  isSaving,
  errorMessage,
  onSubmit,
  onCancel,
}: MorningFormProps): ReactElement => {
  const [waist, setWaist] = useState(() => initialWaist(initial, yesterday));
  const [bloat, setBloat] = useState<number | null>(initial?.bloat ?? null);
  const [sleep, setSleep] = useState<number | null>(initial?.sleep ?? null);
  const [notes, setNotes] = useState(initial?.notes ?? '');

  const waistCm = Number(waist.trim());
  const isWaistValid = waist.trim().length > 0 && Number.isFinite(waistCm) && waistCm > 0;
  const canSave = isWaistValid && bloat !== null && !isSaving;

  const handleSubmit = (): void => {
    if (!canSave || bloat === null) {
      return;
    }
    const trimmedNotes = notes.trim();
    onSubmit({
      waistCm,
      bloat,
      ...(sleep !== null ? { sleep } : {}),
      ...(trimmedNotes ? { notes: trimmedNotes } : {}),
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{MORNING_FORM_LABELS.title}</Text>
        {yesterday ? <Text style={styles.yesterday}>{formatYesterday(yesterday)}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>{MORNING_FORM_LABELS.waistLabel}</Text>
          <TextInput
            autoFocus
            editable={!isSaving}
            keyboardType="decimal-pad"
            onChangeText={setWaist}
            placeholder={MORNING_FORM_LABELS.waistPlaceholder}
            style={styles.input}
            value={waist}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{MORNING_FORM_LABELS.bloatLabel}</Text>
          <RatingSelector
            accessibilityLabel={MORNING_FORM_LABELS.bloatLabel}
            disabled={isSaving}
            onChange={setBloat}
            value={bloat}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{MORNING_FORM_LABELS.sleepLabel}</Text>
          <RatingSelector
            accessibilityLabel={MORNING_FORM_LABELS.sleepLabel}
            disabled={isSaving}
            onChange={setSleep}
            value={sleep}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{MORNING_FORM_LABELS.notesLabel}</Text>
          <TextInput
            editable={!isSaving}
            multiline
            onChangeText={setNotes}
            placeholder={MORNING_FORM_LABELS.notesPlaceholder}
            style={styles.notesInput}
            value={notes}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
        <AppButton
          disabled={!canSave}
          label={isSaving ? MORNING_FORM_LABELS.saving : MORNING_FORM_LABELS.save}
          onPress={handleSubmit}
        />
        <AppButton
          disabled={isSaving}
          label={MORNING_FORM_LABELS.cancel}
          onPress={onCancel}
          tone="secondary"
        />
      </View>
    </View>
  );
};
