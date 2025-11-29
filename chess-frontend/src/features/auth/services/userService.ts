import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { firestore } from "@/lib/firebase/config";
import type { User } from "firebase/auth";
import type { UserProfile } from "../types/index";

const DEFAULT_ELO = 1200;

/**
 * Létrehoz egy új felhasználói profilt Firestore-ban
 */
export async function createUserProfile(user: User): Promise<UserProfile> {
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

  const userRef = doc(firestore, "users", user.uid);
  await setDoc(userRef, userProfile);

  return userProfile;
}

/**
 * Lekéri a felhasználó profilját, ha nem létezik, létrehozza
 */
export async function getUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(firestore, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile;
  } else {
    // Ha nincs profil, létrehozunk egyet
    return await createUserProfile(user);
  }
}

/**
 * Frissíti a felhasználó ELO értékét
 */
export async function updateUserElo(uid: string, newElo: number): Promise<void> {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    elo: newElo,
    updatedAt: Date.now(),
  });
}

/**
 * Növeli a felhasználó győzelmeinek számát
 */
export async function incrementWins(uid: string): Promise<void> {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    wins: increment(1),
    updatedAt: Date.now(),
  });
}

/**
 * Növeli a felhasználó vereségeinek számát
 */
export async function incrementLosses(uid: string): Promise<void> {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    losses: increment(1),
    updatedAt: Date.now(),
  });
}

/**
 * Növeli a felhasználó döntetlenjeinek számát
 */
export async function incrementDraws(uid: string): Promise<void> {
  const userRef = doc(firestore, "users", uid);
  await updateDoc(userRef, {
    draws: increment(1),
    updatedAt: Date.now(),
  });
}

/**
 * Kiszámítja az új ELO értéket a játék eredménye alapján
 * @param playerElo - A játékos jelenlegi ELO-ja
 * @param opponentElo - Az ellenfél ELO-ja
 * @param score - 1 = győzelem, 0.5 = döntetlen, 0 = vereség
 * @param kFactor - K faktor (általában 32)
 */
export function calculateNewElo(
  playerElo: number,
  opponentElo: number,
  score: number,
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const newElo = playerElo + kFactor * (score - expectedScore);
  return Math.round(newElo);
}

/**
 * Frissíti mindkét játékos ELO-ját a játék eredménye alapján
 */
export async function updatePlayersElo(
  winner: "white" | "black" | "draw",
  whiteUid: string,
  blackUid: string,
  whiteElo: number,
  blackElo: number
): Promise<{ newWhiteElo: number; newBlackElo: number }> {
  let whiteScore: number;
  let blackScore: number;

  if (winner === "white") {
    whiteScore = 1;
    blackScore = 0;
  } else if (winner === "black") {
    whiteScore = 0;
    blackScore = 1;
  } else {
    // draw
    whiteScore = 0.5;
    blackScore = 0.5;
  }

  const newWhiteElo = calculateNewElo(whiteElo, blackElo, whiteScore);
  const newBlackElo = calculateNewElo(blackElo, whiteElo, blackScore);

  // Frissítjük az ELO értékeket és a statisztikákat
  await Promise.all([
    updateUserElo(whiteUid, newWhiteElo),
    updateUserElo(blackUid, newBlackElo),
    winner === "white"
      ? Promise.all([incrementWins(whiteUid), incrementLosses(blackUid)])
      : winner === "black"
      ? Promise.all([incrementLosses(whiteUid), incrementWins(blackUid)])
      : Promise.all([incrementDraws(whiteUid), incrementDraws(blackUid)]),
  ]);

  return { newWhiteElo, newBlackElo };
}
