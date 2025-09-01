import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItem, Unite } from './entities/stock-type.entity';


@Injectable()
export class StockItemService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
  ) {}

  async getAllItems(): Promise<StockItem[]> {
    return this.stockItemRepository.find();
  }

  async getItemById(id: number): Promise<StockItem> {
    const item = await this.stockItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Stock item with ID ${id} not found`);
    }
    return item;
  }

  async createItem(data: {
    name: string;
    quantity: number; // Supprimer cette ligne
    unite: Unite;
    alertThreshold: number;
  }): Promise<StockItem> {
    const item = this.stockItemRepository.create({
      name: data.name,
      quantity: data.quantity, // Toujours initialiser à 0
      unite: data.unite,
      alertThreshold: data.alertThreshold,
      createdAt: new Date(),
    });
    return this.stockItemRepository.save(item);
  }

  async updateItem(id: number, data: {
    name?: string;
    quantity?: number; 
    unite?: Unite;
    alertThreshold?: number;
  }): Promise<StockItem> {
    const item = await this.getItemById(id);
    Object.assign(item, {
      name: data.name ?? item.name,
      quantity: data.quantity?? item.quantity,
      unite: data.unite ?? item.unite,
      alertThreshold: data.alertThreshold ?? item.alertThreshold,
    });
    
    return this.stockItemRepository.save(item);
  }

  async deleteItem(id: number): Promise<void> {
    const item = await this.getItemById(id);
    await this.stockItemRepository.remove(item);
  }
  async checkLowStock(): Promise<StockItem[]> {
    return this.stockItemRepository
      .createQueryBuilder('item')
      .where('item.quantity <= item.alertThreshold')
      .orderBy('item.quantity', 'ASC')
      .getMany();
  }
}