export interface MealFormValues {
  readonly description: string;
  readonly dateTime: Date;
  readonly loggedLate: boolean;
}

export interface MealFormProps {
  readonly initialDateTime: Date;
  readonly targetIsToday: boolean;
  readonly isSaving: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (values: MealFormValues) => void;
  readonly onCancel: () => void;
}
