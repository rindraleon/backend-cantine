import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Class } from './entities/classe.entity';
import { CreateClassDto, UpdateClassDto } from './dto/classe.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentService } from 'src/student/student.service';

@Injectable()
export class ClasseService {
    constructor(
     @InjectRepository(Class)
     private classesRepository: Repository<Class>,
    private studentService: StudentService,
   ) {}

   async create(createClassDto: CreateClassDto): Promise<Class> {
     const cls = this.classesRepository.create(createClassDto);
     return await this.classesRepository.save(cls);
   }

   async findAll(): Promise<Class[]> {
     return this.classesRepository.find({ relations: ['students'] });
   }

   async findOne(id: number): Promise<Class> {
     const cls = await this.classesRepository.findOne({
       where: { id: Number(id) },
       relations: ['students'],
     });
     if (!cls) {
       throw new NotFoundException('Class not found');
     }
     return cls;
   }

   async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
     const cls = await this.findOne(id);
     Object.assign(cls, updateClassDto);
     return this.classesRepository.save(cls);
   }

    async remove(id: number): Promise<void> {
      const cls = await this.findOne(id);
      const students = await this.studentService.findByClass(id);
      if (students.length > 0) {
        throw new ForbiddenException('Cannot delete class with active students');
      }
    
      await this.classesRepository.remove(cls);
    }
}
