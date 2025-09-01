import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClasseModule } from './classe/classe.module';
import { StockModule } from './stock/stock.module';
import { RepasModule } from './repas/repas.module';
import { StudentModule } from './student/student.module';
import { RapportModule } from './rapport/rapport.module';
import { PresenceModule } from './presence/presence.module';
import { LogsModule } from './logs/logs.module';
import typeOrmConfig from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config'; 
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true, // Rend ConfigModule disponible globalement
      envFilePath: '.env', // Chemin vers le fichier .env
    }),

    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    AuthModule,
    ClasseModule,
    StockModule,
    RepasModule,
    StudentModule,
    RapportModule,
    PresenceModule,
    LogsModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
