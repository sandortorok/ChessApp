export type Player = {
  uid: string;
  name?: string;
  displayName: string | null;
  email: string | null;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
};
