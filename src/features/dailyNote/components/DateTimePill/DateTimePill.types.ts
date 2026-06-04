export interface DateTimePillProps {
  readonly value: Date;
  readonly onChange: (value: Date) => void;
  readonly maximumDate?: Date;
  readonly disabled?: boolean;
}
