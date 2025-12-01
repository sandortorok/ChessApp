
import { auth, db } from "@/lib/firebase/config";
import { ref, update } from "firebase/database";
import { useGamePropSelector } from "../hooks/useGamePropSelector";
import GameActionButton from "./GameActionButton";
import { gameStateManagementService } from "../services/gameStateManagement";
import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "@firebase/auth";
import { ConfirmSurrenderModal, DEFAULT_GAME, DrawOfferModal, GameEndModal, gameService } from "..";
import { playerService } from "@/features/player";

export default function GameActionButtons() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u));
        return () => unsub();
    }, []);
    const gameData = useGamePropSelector((game) => game, DEFAULT_GAME);

    const [showSurrenderConfirm, setShowSurrenderConfirm] = useState(false);
    const [showEndModal, setShowEndModal] = useState(false);
    const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
    const [drawOfferedBy, setDrawOfferedBy] = useState<string | null>(null);
    const [prevStatus, setPrevStatus] = useState(gameData.status);

    // Show game end modal
    useEffect(() => {
        if (!gameData) return;
        // Show end modal to everyone (players and spectators)
        if (gameData.status === "ended" && !showEndModal && prevStatus !== "ended") {
            setShowEndModal(true);
        }
        setPrevStatus(gameData.status);

    }, [gameData.status, showEndModal, prevStatus]);

    // Listen for draw offers
    useEffect(() => {
        if (!gameData || !currentUser) return;

        // If someone offered a draw AND it wasn't me
        if (gameData.drawOfferedBy && gameData.drawOfferedBy !== currentUser.uid) {
            setDrawOfferedBy(gameData.drawOfferedBy);
            setShowDrawOfferModal(true);
        } else if (!gameData.drawOfferedBy) {
            // If no offer, close the modal
            setShowDrawOfferModal(false);
            setDrawOfferedBy(null);
        }
    }, [gameData?.drawOfferedBy, currentUser]);
    let gameId: string | null = null;
    gameStateManagementService.gameId$.subscribe(id => {gameId = id;}); // Subscribe to game ID changes
    async function onAbort(){
        if (!gameId) return;
        if (gameData.status === "ended") return;

        // Csak 0-1 lépés esetén lehet megszakítani
        if (gameData.moves.length > 1) return;

            console.log("Játék megszakítása...");

            const gameRef = ref(db, `games/${gameId}`);

            try {
                // Játék befejezése döntetlenként, DE ELO változás nélkül
                const now = Date.now();
                await update(gameRef, {
                    status: "ended",
                    winner: "draw",
                    winReason: "aborted",
                    updatedAt: now,
                });

                console.log("Game aborted without ELO changes");

            } catch (err) {
                console.error("Error aborting game:", err);
            }
    }
    async function onOfferDraw() {
        if (!gameId || gameData.status === "ended" || !currentUser) return;
        console.log("Döntetlen ajánlás...");
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            // Csak beállítjuk, hogy ki ajánlotta fel a döntetlent
            await update(gameRef, {
                drawOfferedBy: currentUser.uid,
            });
            
            console.log("Döntetlen ajánlva:", currentUser.uid);
        } catch (err) {
            console.error("Hiba a döntetlen ajánlásakor:", err);
        }
    }
    async function onSurrender() {
        // Ellenőrizzük, hogy játékos vagy-e és a játék nem ért-e véget
        if (!gameId || !gameData.players || gameData.status === "ended" || !currentUser) return;
        console.log("Feladás...");
        
        // Service-t használjuk a játékos oldalának meghatározására
        const mySide = playerService.getPlayerSide(currentUser, gameData.players);
        
        // Csak játékos adhatja fel a játékot (nem néző)
        if (!mySide) return;
        
        // Megerősítő modal megnyitása
        setShowSurrenderConfirm(true);
    }
    async function confirmSurrender() {
        if (!gameId || !gameData.players || !currentUser) return;

        // Modal bezárása azonnal
        setShowSurrenderConfirm(false);

        console.log("Megadás...");

        const gameRef = ref(db, `games/${gameId}`);

        // Service-t használjuk a játékos oldalának meghatározására
        const mySide = playerService.getPlayerSide(currentUser, gameData.players);
        if (!mySide) return;

        const winner = mySide === "white" ? "black" : "white";

        try {
            await update(gameRef, {
                status: "ended",
                winner,
                winReason: "resignation",
            });

            console.log(`${mySide} surrendered, ${winner} wins!`);

            // Frissítjük a Firestore-t
            await gameService.updateFirestoreOnGameEnd(gameId, gameData, winner);
        } catch (err) {
            console.error("Error updating game on surrender:", err);
        }
    }
    async function handleAcceptDraw() {
        if (!gameId || !gameData) return;
        console.log("Döntetlen elfogadása...");

        const gameRef = ref(db, `games/${gameId}`);

        try {
            await update(gameRef, {
                status: "ended",
                winner: "draw",
                winReason: "aggreement",
                drawOfferedBy: null, // Töröljük az ajánlatot
            });

            console.log("Döntetlen elfogadva!");

            // Frissítjük a Firestore-t
            await gameService.updateFirestoreOnGameEnd(gameId, gameData, "draw");

            setShowDrawOfferModal(false);
            setShowEndModal(true);
        } catch (err) {
            console.error("Error accepting draw:", err);
        }
    }
    async function handleDeclineDraw() {
        if (!gameId) return;
        console.log("Döntetlen elutasítása...");
        
        const gameRef = ref(db, `games/${gameId}`);
        
        try {
            // Töröljük az ajánlatot
            await update(gameRef, {
                drawOfferedBy: null,
            });
            
            setShowDrawOfferModal(false);
            console.log("Draw declined");
        } catch (err) {
            console.error("Error declining draw:", err);
        }
    }
    /** @todo Implement new game flow */
    function handleNewGame() {
        console.log("Starting new game...");
    }

    /** @todo Implement rematch logic */
    function handleRematch() {
        console.log("Starting rematch...");
    }
    return (
        <div className="flex gap-3 justify-center items-center py-2">
            {gameData.moves.length <= 1 && (
                <GameActionButton onClick={() => onAbort()} variant="orange" icon="⛔" label="Megszakítás" />
            )}

            {gameData.moves.length > 1 && gameData?.status !== "ended" && (
                <>
                    <GameActionButton onClick={() => onOfferDraw()} variant="emerald" icon="🤝" label="Döntetlen"/>
                    <GameActionButton onClick={() => onSurrender()} variant="red" icon="🏳️" label="Feladás"/>
                </>
            )}
            <ConfirmSurrenderModal
                isOpen={showSurrenderConfirm}
                title="Feladás megerősítése"
                message="Biztosan feladod a játékot? Ez azonnal véget ér a játéknak, veszítesz és ELO pontokat veszítesz."
                confirmText="Feladom"
                cancelText="Folytatom"
                type="danger"
                onConfirm={() => confirmSurrender()}
                onCancel={() => setShowSurrenderConfirm(false)}
            />
            <GameEndModal
                isOpen={showEndModal}
                winner={gameData?.winner || null}
                players={gameData?.players || null}
                winReason={gameData?.winReason || null}
                startingElo={gameData?.startingElo}
                finalElo={gameData?.finalElo}
                currentUser={currentUser}
                onClose={() => setShowEndModal(false)}
                onNewGame={() => handleNewGame()}
                onRematch={() => handleRematch()}
            />
            
            <DrawOfferModal
                isOpen={showDrawOfferModal && !!drawOfferedBy}
                opponentName={
                    gameData?.players?.white?.uid === drawOfferedBy
                        ? (gameData.players.white.displayName || gameData.players.white.email?.split('@')[0] || "Ellenfél")
                        : gameData?.players?.black?.uid === drawOfferedBy
                        ? (gameData.players.black.displayName || gameData.players.black.email?.split('@')[0] || "Ellenfél")
                        : "Ellenfél"
                }
                onAccept={handleAcceptDraw}
                onDecline={handleDeclineDraw}
            />
        </div>
        
    );
}

