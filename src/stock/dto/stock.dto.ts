import { IsEnum, IsNumber, IsString, Min, IsOptional } from 'class-validator';
import { Unite } from '../entities/stock-type.entity';
import { MovementType } from '../entities/stock-mouvement.entity';


export class CreateStockItemDto {
  @IsString()
  name: string;

  @IsEnum(Unite)
  unite: Unite;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  alertThreshold: number;
}

export class UpdateStockItemDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(Unite)
  @IsOptional()
  unite?: Unite;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  alertThreshold?: number;
}

export class CreateStockMovementDto {
  @IsNumber()
  itemId: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsEnum(MovementType)
  type: MovementType;

  @IsString()
  @IsOptional()
  reason?: string;
}