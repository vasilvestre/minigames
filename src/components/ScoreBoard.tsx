import { Player } from "@/types/game";

interface ScoreBoardProps {
  players: Player[];
  currentPlayerIndex: number;
  winner: Player | null;
}

export default function ScoreBoard({
  players,
  currentPlayerIndex,
  winner,
}: ScoreBoardProps) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      {winner && (
        <div className="rounded-xl bg-zinc-900 px-6 py-4 text-center dark:bg-zinc-100">
          <p className="text-sm font-medium text-zinc-300 dark:text-zinc-700">
            Gagnant
          </p>
          <p className="mt-1 text-xl font-bold text-white dark:text-black">
            {winner.name} 🎉
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 sm:px-6 sm:py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Scores
          </h3>
        </div>

        {players.length === 0 ? (
          <div className="px-4 py-6 text-center sm:px-6 sm:py-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Aucun joueur
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {sortedPlayers.map((player, index) => {
              const isCurrent = players[currentPlayerIndex]?.id === player.id;
              const rank = index + 1;

              return (
                <li
                  key={player.id}
                  className={`flex min-h-[44px] items-center justify-between px-4 py-3 transition-colors sm:px-6 sm:py-4 ${
                    isCurrent
                      ? "bg-zinc-50 dark:bg-zinc-900/50"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        rank === 1
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : rank === 2
                          ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          : rank === 3
                          ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-600"
                      }`}
                    >
                      {rank}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isCurrent
                          ? "text-foreground"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {player.name}
                      {isCurrent && (
                        <span className="ml-2 text-xs font-normal text-zinc-500 dark:text-zinc-400">
                          (en cours)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {player.score}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
