export interface MealFormValues {
  readonly description: string;
  readonly dateTime: Date;
  readonly loggedLate: boolean;
  /** A freshly captured local photo URI to copy into the vault on save. */
  readonly newPhotoUri?: string;
  /** An existing embed path to keep (edit mode, photo unchanged). */
  readonly photoPath?: string;
}

export interface MealFormProps {
  readonly initialValues: MealFormValues;
  readonly isSaving: boolean;
  readonly errorMessage: string | null;
  readonly onSubmit: (values: MealFormValues) => void;
  readonly onCancel: () => void;
  readonly onDelete?: () => void;
}
