import { Module } from '@nestjs/common';
import { RapportController } from './rapport.controller';
import { RapportService } from './rapport.service';
import { StockModule } from 'src/stock/stock.module';
import { ClasseModule } from 'src/classe/classe.module';
import { RepasModule } from 'src/repas/repas.module';
import { StudentModule } from 'src/student/student.module';
import { PresenceModule } from 'src/presence/presence.module';
import { Rapport } from './entities/rapport.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';
import { LogsModule } from 'src/logs/logs.module';
import { Presence } from 'src/presence/entities/presence.entity';
import { Repas } from 'src/repas/entities/repas.entity';
import { StockItem } from 'src/stock/entities/stock-type.entity';
import { StockMovement } from 'src/stock/entities/stock-mouvement.entity';

@Module({
  imports: [
    StudentModule,
    PresenceModule,
    RepasModule, // 👈 import du module qui expose RepasService
    ClasseModule,
    StockModule,
    LogsModule,
    TypeOrmModule.forFeature([Rapport,Presence, Repas, StockItem, StockMovement]),
  ],
  controllers: [RapportController],
  providers: [RapportService,LoggingInterceptor],
  exports: [RapportService]
})
export class RapportModule {}
