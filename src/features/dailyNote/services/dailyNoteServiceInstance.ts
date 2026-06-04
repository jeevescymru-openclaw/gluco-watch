import { safBackend } from '@/features/vault/services/safBackend';

import { createDailyNoteService } from './dailyNoteService';

export const dailyNoteService = createDailyNoteService(safBackend);
