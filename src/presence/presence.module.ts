import { forwardRef, Module } from '@nestjs/common';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { Presence } from './entities/presence.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentModule } from 'src/student/student.module';
import { UserModule } from 'src/user/user.module';
import { ClasseService } from 'src/classe/classe.service';
import { StudentService } from 'src/student/student.service';
import { ClasseModule } from 'src/classe/classe.module';
import { LogsService } from 'src/logs/logs.service';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [
     TypeOrmModule.forFeature([Presence]),
     forwardRef(() => StudentModule),
     forwardRef(()=> ClasseModule),
     forwardRef(() => StudentModule),
     UserModule,
     LogsModule

   ],
   providers: [
     PresenceService,
     LoggingInterceptor,
     //ClasseService,
     //StudentService
   ],
   exports: [PresenceService],
   controllers: [PresenceController],
})
export class PresenceModule {}
