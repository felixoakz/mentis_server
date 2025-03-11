import { drizzle } from 'drizzle-orm/node-postgres';
import { constants } from './constants.js';

const db = drizzle(constants.db.databaseUrl);

export { db };
