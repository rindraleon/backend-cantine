import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardMetrics() {
    return this.dashboardService.getMetrics();
  }

  @Get('presence')
  async getPresenceData() {
    return await this.dashboardService.getPresenceData();
  }
}

// import { Controller, Get } from '@nestjs/common';
// import { DashboardService } from './dashboard.service';

// @Controller('dashboard')
// export class DashboardController {
//   constructor(private readonly dashboardService: DashboardService) {}

//   @Get()
//   async getDashboardMetrics() {
//     const metrics = await this.dashboardService.getMetrics();
//   return {
//     users: 0,
//         students: 0,
//         classes: 0,
//         stockItems: 0,
//         stockQuantity: 0,
//     presenceRate: metrics.last7Days.presenceRate,
//     rateChange: 0, // À calculer selon vos besoins
//     inscrit: metrics.last7Days.total,
//     present: metrics.last7Days.present,
//     absent: metrics.last7Days.absent,
//     inscritChange: 0, // À calculer selon vos besoins
//     presentChange: 0, // À calculer selon vos besoins
//     absentChange: 0  // À calculer selon vos besoins
//   };
//   }
// }