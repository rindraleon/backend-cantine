// src/user/user.controller.ts
import { Controller, Get, Post, Body, Param, Delete, Put, HttpException, HttpStatus, NotFoundException, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entity/user.entity';
import { LoggingInterceptor } from 'src/logs/loggin.interceptor';


@Controller('users')
// @UseInterceptors(LoggingInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('ajouter')
  async create(@Body() data: Partial<User>) {
    try {
      return await this.userService.create(data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.userService.findOne(+id);
    } catch (error) {
      throw new HttpException(error.message || 'User not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('username/:username')
  async findByUsername(@Param('username') username: string) {
    try {
      const user = await this.userService.findByUsername(username);
      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }
      return user;
    } catch (error) {
      throw new HttpException(error.message || 'User not found', HttpStatus.NOT_FOUND);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<User>) {
    try {
      return await this.userService.update(+id, data);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to update user', HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.userService.remove(+id);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to delete user', HttpStatus.BAD_REQUEST);
    }
  }

}
