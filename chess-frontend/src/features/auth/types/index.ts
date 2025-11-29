export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  elo: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: number;
  updatedAt: number;
}
