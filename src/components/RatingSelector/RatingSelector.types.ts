export interface RatingSelectorProps {
  readonly value: number | null;
  readonly onChange: (value: number) => void;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
}
