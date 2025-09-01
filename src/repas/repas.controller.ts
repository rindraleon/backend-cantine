import { Body, Controller, Delete, Get, Param, Post, Put, Query,ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { RepasService } from './repas.service';
import { Repas } from './entities/repas.entity';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';

@UseInterceptors(LoggingInterceptor)
@Controller('repas')
export class RepasController {
  constructor(private readonly repasService: RepasService) {}

  @Get('daily')
  async getDailyMeals(@Query('date') date: string): Promise<Repas[]> {
    return this.repasService.getDailyMeals(new Date(date));
  }

  @Get('student/:studentId')
  async getStudentMeals(@Param('studentId') studentId: string): Promise<Repas[]> {
    return this.repasService.getStudentMeals(studentId);
  }
  
  @Get()
  async getAll(): Promise<Repas[]> {
    return this.repasService.getAll();
  }

  @Get('count')
  async countMealsByType(@Query('date') date: string): Promise<{ [key: string]: number }> {
    return this.repasService.countMealsByType(new Date(date));
  }

  @Post('generate')
  async generateDailyMeals(@Body('date') date: string) {
    // Utiliser la date directement sans conversion
    return this.repasService.generateDailyMeals(date);
  }

  // repas.controller.ts
@Post('add')
async create(@Body() data: any) {
  console.log("Données reçues:", data);
  
  // Extraire isManual du corps de la requête
  const isManual = data.isManual;
  //delete data.isManual; // Retirer isManual des données
  
  return this.repasService.create(data, isManual);
}

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: { mealType?: string; menuName?: string; date?: string }): Promise<Repas> {
    return this.repasService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.repasService.delete(id);
  }
}


