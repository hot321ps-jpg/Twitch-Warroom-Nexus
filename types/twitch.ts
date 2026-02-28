export type ChannelSnapshot = {
  login: string;
  displayName: string;
  isLive: boolean;
  title?: string;
  category?: string;
  viewers?: number;
  startedAt?: string | null;
  flags?: string[];
};
