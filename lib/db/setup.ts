import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './drizzle';
import { createPlayer } from './queries';

async function setup() {
  console.log('Setting up SQLite database...');
  
  try {
    // Run migrations
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    console.log('✅ Database migrations completed');

    // Create some sample players
    try {
      await createPlayer({ nickname: 'AlphaGo' });
      await createPlayer({ nickname: 'HumanPlayer' });
      console.log('✅ Sample players created');
    } catch (error) {
      console.log('Sample players already exist or error:', error);
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setup();