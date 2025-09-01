import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { PresenceStatus } from '../entities/presence.entity';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsString()
  studentId: number;

  @IsNotEmpty()
  @IsBoolean()
  status: PresenceStatus; // true = présent, false = absent

  @IsOptional()
  @IsString()
  justification?: string; // Commentaires optionnels

  @IsNotEmpty()
  @IsString()
  classId: number;

  @IsOptional()
  @IsString()
  date?: string; // Date au format YYYY-MM-DD (optionnelle, par défaut date du jour)
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}