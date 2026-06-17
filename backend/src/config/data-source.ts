import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import dbConfig from './db.config';

// Ensure the CLI can read your system environment variables
config();

// Extract the raw configuration object from your NestJS registerAs function
const rawConfig = dbConfig();

export default new DataSource({
  type: 'postgres',
  url: rawConfig.url,
  entities: rawConfig.entities,
  migrations: rawConfig.migrations,
  synchronize: false,
});
// npm run migration:generate -- src/migrations/CreateUsersTable
// npm run migration:run
