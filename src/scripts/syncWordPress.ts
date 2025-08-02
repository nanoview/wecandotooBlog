import { WordPressSyncService } from '../services/wordpressSyncService';
import * as cron from 'node-cron';

const wpConfig = {
  host: process.env.WP_DB_HOST || 'localhost',
  user: process.env.WP_DB_USER || 'root',
  password: process.env.WP_DB_PASSWORD || '',
  database: process.env.WP_DB_NAME || 'wordpress'
};

// Run sync every hour
cron.schedule('0 * * * *', async () => {
  console.log('Starting WordPress sync...');
  const wpSync = new WordPressSyncService(wpConfig);
  
  try {
    const result = await wpSync.syncPosts();
    console.log(`Sync completed: ${result.synced} posts synced, ${result.failed} failed`);
  } catch (error) {
    console.error('Sync failed:', error);
  }
});
