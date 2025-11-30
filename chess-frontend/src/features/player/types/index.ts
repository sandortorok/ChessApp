export type Player = {
  uid: string;
  name?: string; // Legacy field, prefer displayName
  displayName: string | null;
  email: string | null;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
};
