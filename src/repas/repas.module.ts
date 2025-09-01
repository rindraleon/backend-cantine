import { Module } from '@nestjs/common';
import { RepasController } from './repas.controller';
import { RepasService } from './repas.service';
import { Repas } from './entities/repas.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from 'src/student/student.module';
import { PresenceModule } from 'src/presence/presence.module';
import { StudentService } from 'src/student/student.service';
import { PresenceService } from 'src/presence/presence.service';
import { StockItemService } from 'src/stock/stock-item.service';
import { StockMovementService } from 'src/stock/stock-mouvement.service';
import { Student } from 'src/student/entities/student.entity';
import { Presence } from 'src/presence/entities/presence.entity';
import { StockItem } from 'src/stock/entities/stock-type.entity';
import { StockMovement } from 'src/stock/entities/stock-mouvement.entity';
import { Class } from 'src/classe/entities/classe.entity';
import { ClasseModule } from 'src/classe/classe.module';
import { LogsModule } from 'src/logs/logs.module';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';

@Module({
  imports: [
   TypeOrmModule.forFeature([Repas,Student, Presence, StockItem, StockMovement, Class]),  
      StudentModule,
      PresenceModule,
      ClasseModule,
      LogsModule,
   ],
   controllers: [RepasController],
   providers: [RepasService, StudentService, PresenceService, StockItemService, StockMovementService,LoggingInterceptor],
   exports: [RepasService],
})
export class RepasModule {}
