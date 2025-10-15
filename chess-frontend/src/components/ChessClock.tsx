import { useEffect, useState, useRef } from "react";

interface ChessClockProps {
  initialTime?: number; // milliszekundumban
  active?: boolean;
  onTimeExpired?: () => void; // Callback amikor lejár az idő
}

const ChessClock = ({ initialTime = 60000, active = true, onTimeExpired }: ChessClockProps) => {
  const intervalRef = useRef<number | null>(null);
  const [time, setTime] = useState(initialTime);
  const startTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef(initialTime);
  
  // Frissítjük a clockot, ha a prop változik
  useEffect(() => {
    setTime(initialTime);
    remainingTimeRef.current = initialTime;
    startTimeRef.current = null;
  }, [initialTime]);

  useEffect(() => {
    // Töröljük a korábbi intervallumot
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Ha nem aktív, mentsük el a jelenlegi időt és álljunk meg
    if (!active) {
      remainingTimeRef.current = time;
      startTimeRef.current = null;
      return;
    }

    // Amikor újra aktív lesz, állítsuk be a kezdési időpontot
    startTimeRef.current = Date.now();
    const baseTime = remainingTimeRef.current;

    // Új intervallum indítása (100ms-enként a smooth animációhoz)
    intervalRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      
      // Számítsuk ki, hogy ténylegesen mennyi idő telt el
      const elapsed = Date.now() - startTimeRef.current;
      const newTime = Math.max(0, baseTime - elapsed);
      
      setTime(newTime);
      remainingTimeRef.current = newTime;
      
      // Ha lejárt az idő, hívjuk meg a callback-et
      if (newTime === 0 && baseTime > 0 && onTimeExpired) {
        onTimeExpired();
      }
      
      if (newTime === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, 100); // 100ms-enként frissít

    // Cleanup: töröljük az intervallumot, amikor a komponens unmountol vagy az active változik
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, onTimeExpired, time]);

  const totalSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg shadow-md w-32 justify-between ${
        active ? "bg-gray-100 text-gray-700" : "bg-gray-800 text-gray-500"
      } ${active ? "ring-2 ring-gray-500" : ""} ${time === 0 ? "ring-red-500 bg-red-100 text-red-700" : ""}`}
    >
      <div className="w-4 h-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          className={`w-full h-full ${active && time > 0 ? "animate-spin" : ""}`}
          style={active && time > 0 ? { animationDuration: "2s" } : {}}
        >
          <path d="M5.48,9a.93.93,0,0,0-.3.71v.58a.94.94,0,0,0,.3.71,1,1,0,0,0,.71.3h4.58a1,1,0,0,0,.71-.3.94.94,0,0,0,.29-.71V9.7A.92.92,0,0,0,11.48,9a1,1,0,0,0-.71-.27H6.19A1,1,0,0,0,5.48,9Z"></path>
          <path d="M19.22,6.1a9.9,9.9,0,0,0-2.14-3.18A10.23,10.23,0,0,0,13.9.78,9.76,9.76,0,0,0,10,0,9.86,9.86,0,0,0,6.1.78,10,10,0,0,0,.78,6.1,9.81,9.81,0,0,0,0,10a9.81,9.81,0,0,0,.78,3.9A10,10,0,0,0,6.1,19.22,9.86,9.86,0,0,0,10,20a9.76,9.76,0,0,0,3.89-.78,10.23,10.23,0,0,0,3.18-2.14,9.9,9.9,0,0,0,2.14-3.18A9.81,9.81,0,0,0,20,10,9.81,9.81,0,0,0,19.22,6.1ZM17.07,13a7.65,7.65,0,0,1-1.65,2.42A7.81,7.81,0,0,1,13,17.06a7.46,7.46,0,0,1-3,.6,7.51,7.51,0,0,1-3-.6,7.74,7.74,0,0,1-2.43-1.65A8,8,0,0,1,2.94,13a7.46,7.46,0,0,1-.6-3,7.46,7.46,0,0,1,.6-3A8,8,0,0,1,4.58,4.59,7.74,7.74,0,0,1,7,2.94a7.51,7.51,0,0,1,3-.6,7.45,7.45,0,0,1,3,.6,7.74,7.74,0,0,1,2.43,1.65A7.65,7.65,0,0,1,17.07,7a7.46,7.46,0,0,1,.6,3A7.46,7.46,0,0,1,17.07,13Z"></path>
        </svg>
      </div>
      <span className="font-mono text-base">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

export default ChessClock;
