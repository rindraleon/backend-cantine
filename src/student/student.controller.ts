import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { StudentService } from './student.service';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';

@Controller('student')
@UseInterceptors(LoggingInterceptor)
export class StudentController {
    constructor(private readonly studentService: StudentService) {}

   @Post('add')
//    @Roles(UserRole.ADMIN)
   create(@Body() createStudentDto: CreateStudentDto) {
      return this.studentService.create(createStudentDto);
    }

   @Get()
//    @Roles(UserRole.ADMIN, UserRole.TEACHER)
   findAll() {
     return this.studentService.findAll();
   }

   @Get(':id')
//    @Roles(UserRole.ADMIN, UserRole.TEACHER)
   findOne(@Param('id') id: number) {
     return this.studentService.findOne(id);
   }

   @Put(':id')
//    @Roles(UserRole.ADMIN)
   update(@Param('id') id: number, @Body() updateStudentDto: UpdateStudentDto) {
     return this.studentService.update(id, updateStudentDto);
   }

   @Delete(':id')
//    @Roles(UserRole.ADMIN)
   remove(@Param('id') id: number) {
     return this.studentService.remove(id);
   }

  @Get('class/:classId')
  async findByClass(@Param('classId') classId: number) {
    const students = await this.studentService.findByClass(classId);
    if (!students.length) {
      throw new NotFoundException(`No students found for class ID ${classId}`);
    }
    return students;
  }

  @Get(':id/attendance')
  // @Roles(UserRole.ADMIN, UserRole.TEACHER)
  findAttendance(@Param('id') id: number) {
    return this.studentService.findAttendanceByStudent(id);
  }

}
