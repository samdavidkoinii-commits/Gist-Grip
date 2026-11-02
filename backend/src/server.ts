import { app } from './app.js';
import { config } from './config.js';
import { verifyDatabaseConnection } from './db.js';

async function start() {
  if (process.env.NODE_ENV === 'production') await verifyDatabaseConnection();
  app.listen(config.port,()=>console.log(`Gist & Grip API listening on port ${config.port}`));
}

start().catch(error=>{
  console.error('API startup failed',error);
  process.exit(1);
});
