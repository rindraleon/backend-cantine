import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a new user
  async create(data: Partial<User>) {
    const user = this.userRepository.create({
      ...data,
      isActive: data.isActive ?? true, // Default to true if not provided
    });
    return this.userRepository.save(user);
  }

  // Get all users
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // Update a user
  async update(id: number, data: Partial<User>) {
    await this.userRepository.update(id, {
      ...data,
      isActive: data.isActive ?? true, // Preserve or set to true
    });
    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return updated;
  }

  // Find a user by ID
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  // Find a user by email
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  // Find a user by username (added for UserDropdown)
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  // Delete a user
  async remove(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }
}


