import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Play,
  Trophy,
  Users,
  GameController2,
  type LucideIcon,
} from 'lucide-react';
import { getRecentGames } from '@/lib/db/queries';

const statusIconMap: Record<string, LucideIcon> = {
  ongoing: Play,
  finished: Trophy,
  abandoned: GameController2,
};

function getRelativeTime(timestamp: number) {
  const now = Date.now();
  const diffInSeconds = Math.floor((now - timestamp) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return new Date(timestamp).toLocaleDateString();
}

function formatGameActivity(game: any): string {
  if (game.status === 'ongoing') {
    return `Game started between players`;
  } else if (game.status === 'finished') {
    return `Game completed`;
  } else {
    return `Game was abandoned`;
  }
}

export default async function ActivityPage() {
  const games = await getRecentGames(10); // Get last 10 games

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Activity Log
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Go Game Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {games.length > 0 ? (
            <ul className="space-y-4">
              {games.map((game) => {
                const Icon = statusIconMap[game.status] || Play;
                const formattedAction = formatGameActivity(game);

                return (
                  <li key={game.id} className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full p-2">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {formattedAction}
                      </p>
                      <p className="text-xs text-gray-500">
                        {game.boardSize}x{game.boardSize} board • {game.ruleType} rules
                        {game.status === 'finished' && game.winnerId && ` • Winner: Player ${game.winnerId}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getRelativeTime(game.dateTime)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <Users className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No games yet
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                When you start playing Go games, they'll appear here in your activity log.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}