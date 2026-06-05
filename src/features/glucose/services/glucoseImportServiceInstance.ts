import { dailyNoteService } from '@/features/dailyNote/services/dailyNoteServiceInstance';
import { safBackend } from '@/features/vault/services/safBackend';

import { createGlucoseImportService } from './glucoseImportService';

export const glucoseImportService = createGlucoseImportService(safBackend, dailyNoteService);
