export interface RatingDotProps {
  readonly value: number;
  readonly isSelected: boolean;
  readonly disabled: boolean;
  readonly onPress: (value: number) => void;
}
