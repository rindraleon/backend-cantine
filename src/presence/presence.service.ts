import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { StudentService } from 'src/student/student.service';
import { Presence, PresenceStatus } from './entities/presence.entity';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/presence.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ClasseService } from 'src/classe/classe.service';

@Injectable()
export class PresenceService {
  constructor(
    @InjectRepository(Presence)
    private readonly presenceRepository: Repository<Presence>,
    private readonly studentService: StudentService,
    private readonly classService: ClasseService,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Presence> {
    const student = await this.studentService.findOne(createAttendanceDto.studentId);
    const classEntity = await this.classService.findOne(createAttendanceDto.classId);
    if (!student || !classEntity) {
      throw new NotFoundException('Student or Class not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await this.presenceRepository.findOne({
      where: {
        student: { id: Number(student.id) },
        class: { id: Number(classEntity.id) },
        date: today,
      },
      relations: ['student', 'class'],
    });

    if (existingAttendance) {
      throw new ForbiddenException('Attendance already marked for this student in this class today');
    }

    const attendance = this.presenceRepository.create({
      student,
      class: classEntity,
      date: today,
      status: createAttendanceDto.status || PresenceStatus.PRESENT,
      justification: createAttendanceDto.justification,
    });

    return this.presenceRepository.save(attendance);
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Presence> {
    const attendance = await this.presenceRepository.findOne({
      where: { id: Number(id) },
      relations: ['student', 'class'],
    });
    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }
    Object.assign(attendance, updateAttendanceDto);
    return this.presenceRepository.save(attendance);
  }

  async getDailyAttendance(classId: string, date: Date): Promise<Presence[]> {
    return this.presenceRepository.find({
      where: {
        class: { id: Number(classId) },
        date,
      },
      relations: ['student', 'class'],
      order: { date: 'DESC' },
    });
  }

  async getStudentAttendance(studentId: string): Promise<Presence[]> {
    return this.presenceRepository.find({
      where: { student: { id: Number(studentId) } },
      relations: ['student', 'class'],
      order: { date: 'DESC' },
    });
  }

  async getClassAttendanceSummary(date: string) {
  const summaries = await this.presenceRepository
    .createQueryBuilder('presence')
    .leftJoinAndSelect('presence.class', 'class')
    .select([
      'presence.classId',
      'class.name',
      'presence.date',
      `SUM(CASE WHEN presence.status = 'present' THEN 1 ELSE 0 END) as presentCount`,
      `SUM(CASE WHEN presence.status = 'absent' THEN 1 ELSE 0 END) as absentCount`,
    ])
    .where('presence.date = :date', { date })
    .groupBy('presence.classId, class.name, presence.date')
    .getRawMany();

  return summaries.map((s) => ({
    classId: s.presence_classId,
    className: s.class_name,
    date: s.presence_date,
    presentCount: Number(s.presentCount),
    absentCount: Number(s.absentCount),
  }));
}


  async getAll(date?: Date): Promise<Presence[]> {
    const where = date ? { date } : {};
    return this.presenceRepository.find({
      where,
      relations: ['student', 'class'],
      order: { date: 'DESC' },
    });
  }
}