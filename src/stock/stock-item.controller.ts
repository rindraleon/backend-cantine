import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { StockItemService } from './stock-item.service';
import { StockItem, Unite } from './entities/stock-type.entity';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';


@Controller('stock-items')
@UseInterceptors(LoggingInterceptor)
export class StockItemController {
  constructor(private readonly stockItemService: StockItemService) {}

  @Get()
  async getAllItems(): Promise<StockItem[]> {
    return this.stockItemService.getAllItems();
  }

  @Get(':id')
  async getItemById(@Param('id', ParseIntPipe) id: number): Promise<StockItem> {
    return this.stockItemService.getItemById(id);
  }

  @Post('ajout')
  async createItem(@Body() data: {
    name: string;
    quantity: number;
    unite: Unite;
    alertThreshold: number;
  }): Promise<StockItem> {
    return this.stockItemService.createItem(data);
  }

  @Put(':id')
  async updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: {
      name?: string;
      quantity?: number;
      unite?: Unite;
      alertThreshold?: number;
    },
  ): Promise<StockItem> {
    return this.stockItemService.updateItem(id, data);
  }

  @Delete(':id')
  async deleteItem(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.stockItemService.deleteItem(id);
  }

  @Get('low-stock')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  checkLowStock() {
    return this.stockItemService.checkLowStock();
  }
}