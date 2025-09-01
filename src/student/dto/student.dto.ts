import { IsString, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  @IsNotEmpty()
  dateNaiss: string;

  @IsString()
  @IsNotEmpty()
  dietaryRegime: string;

  @IsString()
  @IsNotEmpty()
  classId: string;
}



export class UpdateStudentDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  dietaryRegime?: string;

  @IsString()
  @IsOptional()
  classId?: string;
}