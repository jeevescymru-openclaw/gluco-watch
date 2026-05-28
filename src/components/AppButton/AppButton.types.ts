export type AppButtonTone = 'primary' | 'secondary';

export interface AppButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
  readonly tone?: AppButtonTone;
}
