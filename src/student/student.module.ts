import { Module } from '@nestjs/common';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student } from './entities/student.entity';
import { Class } from 'src/classe/entities/classe.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsModule } from 'src/logs/logs.module';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';

@Module({
  imports: [TypeOrmModule.forFeature([Student, Class]), LogsModule
        // forwardRef(() => PresenceModule)
    ],
    controllers: [StudentController],
   providers: [StudentService, LoggingInterceptor],
   exports: [StudentService],
})
export class StudentModule {}
