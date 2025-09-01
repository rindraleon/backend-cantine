import { forwardRef, Module } from '@nestjs/common';
import { ClasseController } from './classe.controller';
import { ClasseService } from './classe.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Class } from './entities/classe.entity';
import { StudentModule } from 'src/student/student.module';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';

import { LogsModule } from 'src/logs/logs.module';
import { PresenceModule } from 'src/presence/presence.module';

@Module({
   imports: [
     TypeOrmModule.forFeature([Class]),  //👈 important
     forwardRef(()=> PresenceModule),
    StudentModule,  //👈 si nécessaire
    
    LogsModule
   ],
  controllers: [ClasseController],
  providers: [ClasseService, LoggingInterceptor],
  exports: [ClasseService],
})
export class ClasseModule {}
