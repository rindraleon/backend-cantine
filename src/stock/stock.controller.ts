import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockItemDto, CreateStockMovementDto, UpdateStockItemDto } from './dto/stock.dto';
import { AuthGuard } from '@nestjs/passport';
// import { CurrentUser } from 'src/decorators/current-user.decorator';
//import { User } from 'src/user/entity/user.entity';
// import { Roles } from 'src/decorators/roles.decorator';
// import { UserRole } from 'src/user/enums/user-role.enum';
//import { AuthGuard } from '@nestjs/passport';

@Controller('stock')
 //@UseGuards(AuthGuard('jwt'))
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('add')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  createItem(@Body() createStockItemDto: CreateStockItemDto) {
    return this.stockService.createItem(createStockItemDto);
  }

  @Get()
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  findAllItems() {
    return this.stockService.findAllItems();
  }

  @Get('items/:id')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  findOneItem(@Param('id') id: number) {
    return this.stockService.findOneItem(id);
  }

  @Put('items/:id')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  updateItem(@Param('id') id: number, @Body() updateStockItemDto: UpdateStockItemDto) {
    return this.stockService.updateItem(id, updateStockItemDto);
  }

  @Delete('items/:id')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  removeItem(@Param('id') id: number) {
    return this.stockService.removeItem(id);
  }

  @Get('low-stock')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  checkLowStock() {
    return this.stockService.checkLowStock();
  }

  @Post('movements')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  createMovement(@Body() createStockMovementDto: CreateStockMovementDto) {
    return this.stockService.createMovement(createStockMovementDto);
  }

  @Get('movements/:itemId')
//   @Roles(UserRole.ADMIN, UserRole.CANTEEN_MANAGER)
  getItemHistory(@Param('itemId') itemId: number) {
    return this.stockService.getItemHistory(itemId);
  }
}
