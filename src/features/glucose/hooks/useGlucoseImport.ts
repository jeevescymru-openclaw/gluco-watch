import { useCallback, useEffect, useState } from 'react';

import { VaultPermissionError } from '@/features/vault/services/vaultService';

import { GLUCOSE_IMPORT_LABELS } from '../components/GlucoseImportScreen/constants';
import { glucoseImportService } from '../services/glucoseImportServiceInstance';
import { includedMeals, mealKey } from '../utils/previewSelection';

import type { GlucoseImportPlan } from '../glucose.types';

export type ImportPhase =
  | 'loading'
  | 'preview'
  | 'empty'
  | 'applying'
  | 'cancelled'
  | 'done'
  | 'error';

export interface UseGlucoseImport {
  readonly phase: ImportPhase;
  readonly plan: GlucoseImportPlan | null;
  readonly overrides: ReadonlySet<string>;
  readonly writeCount: number;
  readonly errorMessage: string | null;
  readonly toggleOverride: (key: string) => void;
  readonly confirm: () => void;
}

const messageFor = (error: unknown): string =>
  error instanceof VaultPermissionError
    ? GLUCOSE_IMPORT_LABELS.permissionError
    : GLUCOSE_IMPORT_LABELS.genericError;

export const useGlucoseImport = (experimentFolderUri: string): UseGlucoseImport => {
  const [phase, setPhase] = useState<ImportPhase>('loading');
  const [plan, setPlan] = useState<GlucoseImportPlan | null>(null);
  const [overrides, setOverrides] = useState<ReadonlySet<string>>(() => new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    glucoseImportService
      .previewCsvImport(experimentFolderUri)
      .then((result) => {
        if (!active) {
          return;
        }
        if (!result) {
          setPhase('cancelled');
          return;
        }
        setPlan(result);
        setPhase(result.meals.length === 0 ? 'empty' : 'preview');
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(messageFor(error));
          setPhase('error');
        }
      });
    return () => {
      active = false;
    };
  }, [experimentFolderUri]);

  const toggleOverride = useCallback((key: string): void => {
    setOverrides((previous) => {
      const next = new Set(previous);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const confirm = useCallback((): void => {
    if (!plan) {
      return;
    }
    setPhase('applying');
    glucoseImportService
      .applyImport(experimentFolderUri, includedMeals(plan.meals, overrides))
      .then(() => setPhase('done'))
      .catch((error: unknown) => {
        setErrorMessage(messageFor(error));
        setPhase('error');
      });
  }, [plan, overrides, experimentFolderUri]);

  const writeCount = plan ? includedMeals(plan.meals, overrides).length : 0;

  return { phase, plan, overrides, writeCount, errorMessage, toggleOverride, confirm };
};

export { mealKey };
