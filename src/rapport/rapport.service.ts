import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,  Between } from 'typeorm';
import { DailyReports, Rapport } from './entities/rapport.entity';
import { Repas } from 'src/repas/entities/repas.entity';
import { Presence } from 'src/presence/entities/presence.entity';
import { StockItem } from 'src/stock/entities/stock-type.entity';
import { StockMovement } from 'src/stock/entities/stock-mouvement.entity';

@Injectable()
export class RapportService {
attendanceService: any;
constructor(
    @InjectRepository(Presence)
    private presenceRepository: Repository<Presence>,
    
    @InjectRepository(Repas)
    private repasRepository: Repository<Repas>,
    
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    
    @InjectRepository(StockMovement)
    private stockMovementRepository: Repository<StockMovement>,
  ) {}

  async getAttendanceReport(classId: number, startDate: Date, endDate: Date) {
    const students = await this.presenceRepository
      .createQueryBuilder('presence')
      .select('presence.studentId', 'studentId')
      .addSelect('student.firstName || " " || student.lastName', 'student')
      .addSelect(`SUM(CASE WHEN presence.status = 'present' THEN 1 ELSE 0 END)`, 'presentCount')
      .addSelect(`SUM(CASE WHEN presence.status = 'absent' THEN 1 ELSE 0 END)`, 'absentCount')
      .addSelect(`SUM(CASE WHEN presence.status = 'justified' THEN 1 ELSE 0 END)`, 'justifiedCount')
      .addSelect(`(SUM(CASE WHEN presence.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*))`, 'attendanceRate')
      .leftJoin('presence.student', 'student')
      .where('presence.classId = :classId', { classId })
      .andWhere('presence.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('presence.studentId, student.firstName, student.lastName')
      .getRawMany();

    const className = await this.presenceRepository
      .createQueryBuilder('presence')
      .select('class.name', 'className')
      .leftJoin('presence.class', 'class')
      .where('presence.classId = :classId', { classId })
      .getRawOne();

    return {
      className: className?.className || `Classe ${classId}`,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      students,
    };
  }

  async getMealsReport(startDate: Date, endDate: Date, mealType?: string) {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    endDate = new Date(endDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    
    const dailyReports: DailyReports[] = [];
    for (const date of dates) {
      const meals = await this.repasRepository.find({ 
        where: { date },
        relations: ['student']
      });

      
      const countByType: Record<string, number> = {};
      meals.forEach(meal => {
        if (mealType && meal.mealType !== mealType) return;
        countByType[meal.mealType] = (countByType[meal.mealType] || 0) + 1;
      });

      dailyReports.push({
        date: date.toISOString().split('T')[0],
        totalMeals: meals.length,
        mealsByType: countByType,
      });
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dailyReports,
    };
  }

  async getStockReport(
    movementType: string = 'ALL',
    startDate?: Date,
    endDate?: Date
  ) {
    // Récupérer les articles de stock
    const items = await this.stockItemRepository.find();
    const lowStockItems = items.filter(item => 
      item.alertThreshold && item.quantity <= item.alertThreshold
    );

    // Récupérer les mouvements de stock filtrés
    const where: any = {};
    if (movementType !== 'ALL') {
      where.type = movementType;
    }
    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    }

    const movements = await this.stockMovementRepository.find({ 
      where,
      order: { date: 'DESC' },
      take: 100
    });

    return {
      totalItems: items.length,
      lowStockItems,
      items,
      movements,
    };
  }
}
