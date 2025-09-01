import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/presence.dto';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';

@Controller('presences')
@UseInterceptors(LoggingInterceptor)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Post('add')
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.presenceService.create(createAttendanceDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAttendanceDto: UpdateAttendanceDto) {
    return this.presenceService.update(id, updateAttendanceDto);
  }

  @Get('daily')
  getDailyAttendance(@Query('classId') classId: string, @Query('date') date: string) {
    return this.presenceService.getDailyAttendance(classId, new Date(date));
  }

  @Get('student/:studentId')
  getStudentAttendance(@Param('studentId') studentId: string) {
    return this.presenceService.getStudentAttendance(studentId);
  }

  @Get('summary')
  async getClassAttendanceSummary(@Query('date') date: string) {
  return this.presenceService.getClassAttendanceSummary(date);
}


  @Get()
  async getAll(@Query('date') date?: string) {
    return this.presenceService.getAll(date ? new Date(date) : undefined);
  }
}