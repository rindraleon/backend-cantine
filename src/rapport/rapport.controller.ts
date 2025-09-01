import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { RapportService } from './rapport.service';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';

@Controller('rapport')
@UseInterceptors(LoggingInterceptor)
export class RapportController {
   constructor(private readonly reportService: RapportService) {}

  @Get('attendance')
  async getAttendanceReport(
    @Query('classId') classId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.reportService.getAttendanceReport(
      parseInt(classId),
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get('meals')
  async getMealsReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('mealType') mealType?: string
  ) {
    return this.reportService.getMealsReport(
      new Date(startDate),
      new Date(endDate),
      mealType
    );
  }

  @Get('stock')
  async getStockReport(
    @Query('movementType') movementType: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.reportService.getStockReport(
      movementType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }
}
