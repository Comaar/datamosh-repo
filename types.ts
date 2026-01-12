
export type MediaType = 'image' | 'video';

export interface MediaItemData {
  id: string;
  url: string;
  type: MediaType;
  width: number;
  height: number;
  initialX: number; // percentage 0-100
  speed: number;    // falling speed multiplier
  parallax: number; // depth effect
  isLocked?: boolean;
}

export interface WaterfallState {
  isExploding: boolean;
  isRecovering: boolean;
}
