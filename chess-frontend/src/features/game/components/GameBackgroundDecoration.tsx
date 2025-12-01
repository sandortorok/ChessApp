/** Background decorations for the chess game - animated gradients and floating chess pieces */
export function GameBackgroundDecoration() {
  return (
    <>
      {/* Animated background gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(20,184,166,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(6,182,212,0.15),transparent_50%)]" />
      </div>

      {/* Floating chess pieces */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 text-6xl animate-float">♔</div>
        <div className="absolute top-40 right-20 text-5xl animate-float delay-1000">
          ♕
        </div>
        <div className="absolute bottom-32 left-1/4 text-7xl animate-float delay-2000">
          ♖
        </div>
        <div className="absolute bottom-20 right-1/3 text-6xl animate-float delay-3000">
          ♗
        </div>
      </div>
    </>
  );
}
