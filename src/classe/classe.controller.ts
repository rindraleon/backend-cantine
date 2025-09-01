import { Body, Controller, Delete, Get, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { ClasseService } from './classe.service';
import { CreateClassDto, UpdateClassDto } from './dto/classe.dto';
import { UserRole } from 'src/user/entity/user.entity';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';


@Controller('classes')
@UseInterceptors(LoggingInterceptor)
export class ClasseController {
    constructor(private readonly classesService: ClasseService) {}
  
   @Post('add')
   //@Roles(UserRole.ADMIN)
   create(@Body() createClassDto: CreateClassDto) {
     return this.classesService.create(createClassDto);
   }

   @Get()
   //@Roles(UserRole.ADMIN, UserRole.TEACHER)
   findAll() {
     return this.classesService.findAll();
   }

   @Get(':id')
   //@Roles(UserRole.ADMIN, UserRole.TEACHER)
   findOne(@Param('id') id: number) {
     return this.classesService.findOne(id);
   }
  
   @Put(':id')
   //@Roles(UserRole.ADMIN)
   update(@Param('id') id: number, @Body() updateClassDto: UpdateClassDto) {
     return this.classesService.update(id, updateClassDto);
   }
   
    @Delete(':id')
  //  @Roles(UserRole.ADMIN)
    remove(@Param('id') id: number) {
      return this.classesService.remove(id);
    }
}
