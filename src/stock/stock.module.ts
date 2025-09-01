import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItem } from './entities/stock-type.entity';
import { StockMovement } from './entities/stock-mouvement.entity';
import { UserModule } from 'src/user/user.module';
import { StockItemController } from './stock-item.controller';
import { StockMovementController } from './stock-mouvement.controller';
import { StockMovementService } from './stock-mouvement.service';
import { StockItemService } from './stock-item.service';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';
import { LogsModule } from 'src/logs/logs.module';

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, StockMovement]), UserModule, LogsModule],
   providers: [StockItemService, StockMovementService, LoggingInterceptor],
  controllers: [StockItemController, StockMovementController],
   exports: [StockItemService, StockMovementService],
})
export class StockModule {}
