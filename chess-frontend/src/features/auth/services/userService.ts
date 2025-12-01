import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import type { UserProfile } from '../types/index';

const DEFAULT_ELO = 1200;

/**
 * User Service - Singleton pattern
 * Handles user profile operations
 */
class UserService {
  private static instance: UserService | null = null;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /** Creates a new user profile in Firestore */
  async createUserProfile(user: User): Promise<UserProfile> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      elo: DEFAULT_ELO,
      wins: 0,
      losses: 0,
      draws: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, userProfile);

    return userProfile;
  }

  /** Gets user profile from Firestore, creates one if it doesn't exist */
  async getUserProfile(user: User): Promise<UserProfile> {
    const userRef = doc(firestore, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    } else {
      return await this.createUserProfile(user);
    }
  }

  /** Updates user's ELO rating */
  async updateUserElo(uid: string, newElo: number): Promise<void> {
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      elo: newElo,
      updatedAt: Date.now(),
    });
  }

  /** Increments user's win count */
  async incrementWins(uid: string): Promise<void> {
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      wins: increment(1),
      updatedAt: Date.now(),
    });
  }

  /** Increments user's loss count */
  async incrementLosses(uid: string): Promise<void> {
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      losses: increment(1),
      updatedAt: Date.now(),
    });
  }

  /** Increments user's draw count */
  async incrementDraws(uid: string): Promise<void> {
    const userRef = doc(firestore, 'users', uid);
    await updateDoc(userRef, {
      draws: increment(1),
      updatedAt: Date.now(),
    });
  }

  /** Calculates new ELO rating. Score: 1 = win, 0.5 = draw, 0 = loss */
  calculateNewElo(
    playerElo: number,
    opponentElo: number,
    score: number,
    kFactor: number = 32
  ): number {
    const expectedScore =
      1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    const newElo = playerElo + kFactor * (score - expectedScore);
    return Math.round(newElo);
  }

  /** Updates both players' ELO ratings and stats based on game result */
  async updatePlayersElo(
    winner: 'white' | 'black' | 'draw',
    whiteUid: string,
    blackUid: string,
    whiteElo: number,
    blackElo: number
  ): Promise<{ newWhiteElo: number; newBlackElo: number }> {
    let whiteScore: number;
    let blackScore: number;

    if (winner === 'white') {
      whiteScore = 1;
      blackScore = 0;
    } else if (winner === 'black') {
      whiteScore = 0;
      blackScore = 1;
    } else {
      whiteScore = 0.5;
      blackScore = 0.5;
    }

    const newWhiteElo = this.calculateNewElo(whiteElo, blackElo, whiteScore);
    const newBlackElo = this.calculateNewElo(blackElo, whiteElo, blackScore);
    await Promise.all([
      this.updateUserElo(whiteUid, newWhiteElo),
      this.updateUserElo(blackUid, newBlackElo),
      winner === 'white'
        ? Promise.all([
            this.incrementWins(whiteUid),
            this.incrementLosses(blackUid),
          ])
        : winner === 'black'
          ? Promise.all([
              this.incrementLosses(whiteUid),
              this.incrementWins(blackUid),
            ])
          : Promise.all([
              this.incrementDraws(whiteUid),
              this.incrementDraws(blackUid),
            ]),
    ]);

    return { newWhiteElo, newBlackElo };
  }
}

export const userService = UserService.getInstance();

export const createUserProfile = (user: User) =>
  userService.createUserProfile(user);
export const getUserProfile = (user: User) => userService.getUserProfile(user);
export const updateUserElo = (uid: string, newElo: number) =>
  userService.updateUserElo(uid, newElo);
export const incrementWins = (uid: string) => userService.incrementWins(uid);
export const incrementLosses = (uid: string) =>
  userService.incrementLosses(uid);
export const incrementDraws = (uid: string) => userService.incrementDraws(uid);
export const calculateNewElo = (
  playerElo: number,
  opponentElo: number,
  score: number,
  kFactor?: number
) => userService.calculateNewElo(playerElo, opponentElo, score, kFactor);
export const updatePlayersElo = (
  winner: 'white' | 'black' | 'draw',
  whiteUid: string,
  blackUid: string,
  whiteElo: number,
  blackElo: number
) =>
  userService.updatePlayersElo(winner, whiteUid, blackUid, whiteElo, blackElo);
