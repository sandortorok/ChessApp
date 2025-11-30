/** User profile stored in Firestore (separate from Realtime DB game data) */
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
