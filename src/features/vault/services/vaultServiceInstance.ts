import { safBackend } from './safBackend';
import { createVaultService } from './vaultService';

export const vaultService = createVaultService(safBackend);
