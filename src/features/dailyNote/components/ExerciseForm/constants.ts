export const EXERCISE_FORM_LABELS = {
  title: 'Log exercise',
  editTitle: 'Edit exercise',
  typeLabel: 'Type',
  durationLabel: 'Duration (minutes)',
  durationPlaceholder: 'e.g. 60',
  intensityLabel: 'Intensity',
  notesLabel: 'Notes (optional)',
  notesPlaceholder: 'e.g. full upper body',
  save: 'Save exercise',
  saving: 'Saving…',
  cancel: 'Cancel',
  delete: 'Delete exercise',
  deleteTitle: 'Delete this exercise?',
  deleteMessage: 'This removes the entry from the daily note.',
  deleteConfirm: 'Delete',
  deleteCancel: 'Cancel',
  notFound: 'Could not load this exercise.',
  permissionError: 'Lost access to the folder. Reopen the app and pick it again.',
  genericError: 'Could not save the exercise. Please try again.',
} as const;

export const DEFAULT_EXERCISE_TYPE = 'strength';
