import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsEnum, IsNumber, Min } from 'class-validator';

export enum Unite {
  KILOGRAM = 'kg',
  GRAM = 'g',
  LITER = 'l',
  UNIT = 'unit',
}

@Entity('stock_items')
export class StockItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Unite })
  @IsEnum(Unite)
  unite: Unite;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  alertThreshold: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
