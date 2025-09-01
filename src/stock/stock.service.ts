import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StockItem } from './entities/stock-type.entity';
import { StockMovement, MovementType } from './entities/stock-mouvement.entity';
import { CreateStockItemDto, CreateStockMovementDto, UpdateStockItemDto } from './dto/stock.dto';
import { validate } from 'class-validator';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
  ) {}

  async createItem(createStockItemDto: CreateStockItemDto): Promise<StockItem> {
    const errors = await validate(createStockItemDto);
    if (errors.length > 0) {
      throw new ForbiddenException('Invalid stock item data');
    }
    const item = this.stockItemRepository.create(createStockItemDto);
    return this.stockItemRepository.save(item);
  }

  async findAllItems(): Promise<StockItem[]> {
    return this.stockItemRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOneItem(id: number): Promise<StockItem> {
    const item = await this.stockItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Stock item not found');
    }
    return item;
  }

  async updateItem(id: number, updateStockItemDto: UpdateStockItemDto): Promise<StockItem> {
    const errors = await validate(updateStockItemDto);
    if (errors.length > 0) {
      throw new ForbiddenException('Invalid stock item data');
    }
    const item = await this.findOneItem(id);
    Object.assign(item, updateStockItemDto);
    return this.stockItemRepository.save(item);
  }

  async removeItem(id: number): Promise<void> {
    const item = await this.findOneItem(id);
    await this.stockMovementRepository.delete({ item: { id } });
    await this.stockItemRepository.remove(item);
  }

  async checkLowStock(): Promise<StockItem[]> {
    return this.stockItemRepository
      .createQueryBuilder('item')
      .where('item.quantity <= item.alertThreshold')
      .orderBy('item.quantity', 'ASC')
      .getMany();
  }

  async createMovement(createStockMovementDto: CreateStockMovementDto): Promise<StockMovement> {
    const errors = await validate(createStockMovementDto);
    if (errors.length > 0) {
      throw new ForbiddenException('Invalid stock movement data');
    }

    const item = await this.findOneItem(createStockMovementDto.itemId);
    if (createStockMovementDto.type === MovementType.OUT) {
      if (item.quantity < createStockMovementDto.quantity) {
        throw new ForbiddenException('Insufficient stock quantity');
      }
      item.quantity -= createStockMovementDto.quantity;
    } else {
      item.quantity += createStockMovementDto.quantity;
    }

    await this.stockItemRepository.save(item);

    const movement = this.stockMovementRepository.create({
      ...createStockMovementDto,
      item,
      date: new Date(),
    });

    return this.stockMovementRepository.save(movement);
  }

  async getItemHistory(itemId: number): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: { item: { id: itemId } },
      relations: ['item'],
      order: { date: 'DESC' },
    });
  }
}
