import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Class } from 'src/classe/entities/classe.entity';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';

@Injectable()
export class StudentService {
    constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Class)
    private readonly classRepository: Repository<Class>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const classEntity = await this.classRepository.findOne({
      where: { id: Number(dto.classId) },
    });
  
    if (!classEntity) {
      throw new NotFoundException('Classe non trouvée');
    }
  
    const student = this.studentRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      dateNaiss: new Date(dto.dateNaiss),
      dietaryRegime: dto.dietaryRegime,
      class: classEntity,
    });
  
    return this.studentRepository.save(student);
  }
  
  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({ relations: ['class'] });
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: Number(id) },
      relations: ['class', 'presences'],
    });

    if (!student) {
      throw new NotFoundException('Étudiant non trouvé');
    }

    return student;
  }

  async update(id: number, dto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    if (dto.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: Number(dto.classId) },
      });

      if (!classEntity) {
        throw new NotFoundException('Classe non trouvée');
      }

      student['class'] = classEntity;
    }

    Object.assign(student, dto);
    return this.studentRepository.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  // async findByClass(classId: number): Promise<Student[]> {
  //   return this.studentRepository.find({
  //     where: { class: { id: Number(classId) } },
  //     relations: ['class'],
  //   });
  // }
  async findByClass(classId: number): Promise<Student[]> {
    const students = await this.studentRepository.find({
      where: { class: { id: Number(classId) } },
    });
    if (!students.length) {
      throw new NotFoundException(`No students found for class ID ${classId}`);
    }
    return students;
  }

  async findAttendanceByStudent(id: number): Promise<any[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const student = await this.studentRepository.findOne({
    where: { id: Number(id) },
    relations: ['presences'],
  });

  if (!student) {
    throw new NotFoundException('Étudiant non trouvé');
  }

  return student.presences.filter((attendance) => new Date(attendance.date) >= sevenDaysAgo);
}


}
