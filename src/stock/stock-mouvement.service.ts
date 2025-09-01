import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockItemService } from './stock-item.service';
import { MovementType, StockMovement } from './entities/stock-mouvement.entity';
import { StockItem } from './entities/stock-type.entity';

@Injectable()
export class StockMovementService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
    private stockItemService: StockItemService,
  ) {}

  async getAllMovements(): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({ relations: ['item'] });
  }

  async createMovement(data: {
    itemId: number;
    quantity: number;
    type: MovementType;
    reason?: string;
  }): Promise<StockMovement> {
    const item = await this.stockItemService.getItemById(data.itemId);
    if (!item) {
      throw new NotFoundException(`Stock item with ID ${data.itemId} not found`);
    }

    // Calculer les quantités avant et après le mouvement
    const initialQuantity = item.quantity;
    let finalQuantity: number;

    if (data.type === MovementType.OUT) {
      // Vérifier si le stock est suffisant pour un retrait
      if (item.quantity < data.quantity) {
        throw new BadRequestException('Insufficient stock quantity for movement');
      }
      finalQuantity = initialQuantity - data.quantity;
    } else {
      // Pour un mouvement IN, ajouter la quantité
      finalQuantity = initialQuantity + data.quantity;
    }

    // Mettre à jour le stock avec la quantité finale
    item.quantity = finalQuantity;
    await this.stockItemService.updateItem(item.id, { quantity: finalQuantity });

    // Créer le mouvement avec les quantités initiale et finale
    const movement = this.stockMovementRepository.create({
      item,
      quantity: data.quantity,
      type: data.type,
      reason: data.reason,
      initialQuantity,
      finalQuantity,
      date: new Date(),
    });

    return this.stockMovementRepository.save(movement);
  }

  async getMovementsByItemId(itemId: number): Promise<StockMovement[]> {
    return this.stockMovementRepository.find({
      where: { item: { id: itemId } },
      relations: ['item'],
      order: { date: 'DESC' },
    });
  }

  async deleteMovement(id: number): Promise<void> {
    const movement = await this.stockMovementRepository.findOne({
      where: { id },
      relations: ['item'],
    });
    if (!movement) {
      throw new NotFoundException(`Stock movement with ID ${id} not found`);
    }

    // Inverser le mouvement
    const item = movement.item;
    item.quantity = movement.type === MovementType.IN
      ? item.quantity - movement.quantity
      : item.quantity + movement.quantity;

    await this.stockItemService.updateItem(item.id, { quantity: item.quantity });
    await this.stockMovementRepository.remove(movement);
  }
}