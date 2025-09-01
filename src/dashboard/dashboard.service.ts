import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { StudentService } from 'src/student/student.service';
import { Presence } from 'src/presence/entities/presence.entity';
import { ClasseService } from 'src/classe/classe.service';
import { StockItemService } from 'src/stock/stock-item.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly userService: UserService,
    private readonly studentService: StudentService,
    private readonly classService: ClasseService,
    private readonly stockService: StockItemService,
    @InjectRepository(Presence)
    private readonly presenceRepository: Repository<Presence>,
  ) {}

  async getMetrics() {
    try {
      const users = await this.userService.findAll();
      const numUsers = users.length;
      console.log ('Users',numUsers)

      const students = await this.studentService.findAll();
      const numStudents = students.length;
      console.log ('Students',numStudents)

      const classes = await this.classService.findAll();
      const numClasses = classes.length;
      console.log ('Classes',numClasses)

      // Récupération des données de stock
      const stockItems = await this.stockService.getAllItems();
      const stockQuantity = stockItems.reduce((total, item) => total + item.quantity, 0);

      // Calculs de présence pour les 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const last7DaysPresences = await this.presenceRepository.find({
        where: { 
          date: Between(sevenDaysAgo, today) 
        },
      });

      const presentCount = last7DaysPresences.filter(p => p.status === 'present').length;
      const absentCount = last7DaysPresences.filter(p => p.status === 'absent').length;
      const totalPresences = presentCount + absentCount;
      const presenceRate = totalPresences > 0 ? Math.round((presentCount / totalPresences) * 100) : 0;

      return {
        users: numUsers,
        students: numStudents,
        classes: numClasses,
        stockItems: stockItems.length,
        stockQuantity: stockQuantity,
        last7Days: {
          present: presentCount,
          absent: absentCount,
          total: totalPresences,
          presenceRate: presenceRate
        }
      };
   } catch (error) {
      console.error('Error in DashboardService:', error);
      throw new Error('Impossible de récupérer les statistiques du tableau de bord');
    }
  }

  async getPresenceData() {
    try {
      // Calculs de présence pour les 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const last7DaysPresences = await this.presenceRepository.find({
        where: { 
          date: Between(sevenDaysAgo, today) 
        },
      });

      const presentCount = last7DaysPresences.filter(p => p.status === 'present').length;
      const absentCount = last7DaysPresences.filter(p => p.status === 'absent').length;
      const totalPresences = presentCount + absentCount;
      const presenceRate = totalPresences > 0 ? Math.round((presentCount / totalPresences) * 100) : 0;

      // Pour les données de changement, vous devrez comparer avec la période précédente
      // Pour l'instant, je vais mettre des valeurs fixes ou calculées différemment
      const previousSevenDaysAgo = new Date();
      previousSevenDaysAgo.setDate(previousSevenDaysAgo.getDate() - 14);
      previousSevenDaysAgo.setHours(0, 0, 0, 0);
      
      const previousSevenDaysEnd = new Date(sevenDaysAgo);
      previousSevenDaysEnd.setMilliseconds(-1);

      const previousPeriodPresences = await this.presenceRepository.find({
        where: { 
          date: Between(previousSevenDaysAgo, previousSevenDaysEnd) 
        },
      });

      const previousPresentCount = previousPeriodPresences.filter(p => p.status === 'present').length;
      const previousAbsentCount = previousPeriodPresences.filter(p => p.status === 'absent').length;
      const previousTotalPresences = previousPresentCount + previousAbsentCount;
      const previousPresenceRate = previousTotalPresences > 0 ? Math.round((previousPresentCount / previousTotalPresences) * 100) : 0;

      // Calcul des changements en pourcentage
      const rateChange = previousPresenceRate > 0 ? Math.round(((presenceRate - previousPresenceRate) / previousPresenceRate) * 100) : 0;
      const presentChange = previousPresentCount > 0 ? Math.round(((presentCount - previousPresentCount) / previousPresentCount) * 100) : 0;
      const absentChange = previousAbsentCount > 0 ? Math.round(((absentCount - previousAbsentCount) / previousAbsentCount) * 100) : 0;

      // Pour inscrit, vous devrez peut-être adapter selon votre logique métier
      // Ici, j'utilise le nombre total d'étudiants comme inscrit
      const students = await this.studentService.findAll();
      const numStudents = students.length;

      const previousStudents = []; // Vous devrez peut-être stocker l'historique
      const inscritChange = 0; // À adapter selon votre logique métier

      return {
        presenceRate,
        rateChange,
        inscrit: numStudents,
        present: presentCount,
        absent: absentCount,
        inscritChange,
        presentChange,
        absentChange
      };
    } catch (error) {
      console.error('Error in DashboardService.getPresenceData:', error);
      throw new Error('Impossible de récupérer les données de présence');
    }
  }
}