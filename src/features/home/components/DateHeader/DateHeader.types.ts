export interface DateHeaderProps {
  readonly label: string;
  readonly canGoForward: boolean;
  readonly isToday: boolean;
  readonly onPreviousDay: () => void;
  readonly onNextDay: () => void;
  readonly onToday: () => void;
}
