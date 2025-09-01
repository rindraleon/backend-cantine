import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { MovementType, StockMovement } from './entities/stock-mouvement.entity';
import { StockMovementService } from './stock-mouvement.service';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';


@Controller('stock-mouvements')
@UseInterceptors(LoggingInterceptor)
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Get()
  async getAllMovements(): Promise<StockMovement[]> {
    return this.stockMovementService.getAllMovements();
  }

  @Get('item/:itemId')
  async getMovementsByItemId(@Param('itemId', ParseIntPipe) itemId: number): Promise<StockMovement[]> {
    return this.stockMovementService.getMovementsByItemId(itemId);
  }

  @Post('ajout')
  async createMovement(@Body() data: {
    itemId: number;
    quantity: number;
    type: MovementType;
    reason?: string;
    newQuantity: number;
  }): Promise<StockMovement> {
    return this.stockMovementService.createMovement(data);
  }

  @Delete(':id')
  async deleteMovement(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.stockMovementService.deleteMovement(id);
  }
}