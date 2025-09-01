import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { UserModule } from 'src/user/user.module'; // Import dependent modules
import { StudentModule } from 'src/student/student.module';

import { StockModule } from 'src/stock/stock.module';
import { Presence } from 'src/presence/entities/presence.entity';
import { ClasseModule } from 'src/classe/classe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Presence]),
    UserModule,
    StudentModule,
    ClasseModule,
    StockModule,
  ],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}