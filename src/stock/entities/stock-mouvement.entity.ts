// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// import { IsEnum, IsNumber, Min } from 'class-validator';
// import { StockItem } from './stock-type.entity';

// export enum MovementType {
//   IN = 'IN',
//   OUT = 'OUT',
// }

// @Entity('stock_movements')
// export class StockMovement {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   date: Date;

//   @ManyToOne(() => StockItem, { onDelete: 'CASCADE' })
//   item: StockItem;

//   @Column('decimal', { precision: 10, scale: 2 })
//   @IsNumber()
//   @Min(0)
//   quantity: number;

//   @Column('decimal', { precision: 10, scale: 2 })
//   newQuantity: number; // Quantité après mouvement

//   @Column({ type: 'enum', enum: MovementType })
//   @IsEnum(MovementType)
//   type: MovementType;

//   @Column({ nullable: true })
//   reason: string;
// }


import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IsEnum, IsNumber, Min } from 'class-validator';
import { StockItem } from './stock-type.entity';

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
}

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToOne(() => StockItem, { onDelete: 'CASCADE' })
  item: StockItem;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  initialQuantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalQuantity: number;

  @Column({ type: 'enum', enum: MovementType })
  @IsEnum(MovementType)
  type: MovementType;

  @Column({ nullable: true })
  reason: string;
}