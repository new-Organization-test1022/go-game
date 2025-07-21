import { eq } from 'drizzle-orm';
import { db } from './drizzle';
import { players } from './schema';
import { DEFAULT_RANK } from '../go/rank';

async function seed() {
  console.log('Starting seed process...');

  // Create sample players with default ranks
  const samplePlayers = [
    { nickname: 'AliceGo', rank: DEFAULT_RANK.numericValue },
    { nickname: 'BobStone', rank: DEFAULT_RANK.numericValue + 5 }, // 5K
    { nickname: 'CharlieWeiqi', rank: DEFAULT_RANK.numericValue + 10 }, // 10 levels up
    { nickname: 'DianaGoban', rank: DEFAULT_RANK.numericValue + 2 }, // 28K
    { nickname: 'EvanKomi', rank: DEFAULT_RANK.numericValue + 15 }, // Better player
  ];

  try {
    // Check if players already exist
    const existingPlayers = await db.select().from(players);
    
    if (existingPlayers.length > 0) {
      console.log('Players already exist. Updating existing players with default ranks...');
      
      // Update existing players to have proper rank data
      for (const player of existingPlayers) {
        if (player.rank === 1) { // Still has default database value
          await db
            .update(players)
            .set({
              rank: DEFAULT_RANK.numericValue,
              consecutiveWins: 0,
              consecutiveLosses: 0,
              totalGames: player.winCount + player.loseCount,
              lastRankUpdate: Date.now(),
              updatedAt: Date.now(),
            })
            .where(eq(players.id, player.id));
        }
      }
      console.log('Updated existing players with rank data.');
    } else {
      console.log('Creating sample players...');
      
      // Create new sample players
      const createdPlayers = await db
        .insert(players)
        .values(samplePlayers.map(player => ({
          ...player,
          winCount: 0,
          loseCount: 0,
          totalTime: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
          totalGames: 0,
          lastRankUpdate: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })))
        .returning();

      console.log(`Created ${createdPlayers.length} sample players.`);
    }

    console.log('Seed data created successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  }
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });