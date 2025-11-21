export interface EcoEvent {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: 'reporting' | 'holiday' | 'other';
}

export interface DailyTip {
  date: string;
  tip: string;
  actionItem: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}