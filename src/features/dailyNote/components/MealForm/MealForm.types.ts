export interface MealFormProps {
  readonly isSaving: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (description: string) => void;
  readonly onCancel: () => void;
}
