import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mariadb',
  host: 'localhost',
  port: 3306, 
  username: 'root', 
  password: '',
  database: 'cantine_scolaire', 

  entities: [join(__dirname, '**', '*.entity.{ts,js}')],

  // ✅ Charge toutes les migrations dans le dossier migrations/
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',

  // ✅ Génère les migrations avec le CLI
//   cli: {
//     migrationsDir: 'src/migrations',
//   },

  synchronize: true, // ✅ Jamais en production ! Utiliser les migrations
  autoLoadEntities: true, // ✅ Charge automatiquement les entités dans les modules Nest
};

export default typeOrmConfig;
