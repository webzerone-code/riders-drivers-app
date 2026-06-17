import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('dbConfig', () => ({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  // entities: [join(__dirname, 'entities', '**', '*.entity.{ts,js}')], //['src/**/*.entity{.ts,.js}'],
  //entities: [join(__dirname, '..', 'entities', '**', '*.entity.{ts,js}')],
  entities: [join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
  // Add this path so the CLI knows where to look for applied migrations
  migrations: [join(__dirname, '..', 'migrations', '**', '*.{ts,js}')],
  synchronize: false,
  autoLoadEntities: true,
}));
