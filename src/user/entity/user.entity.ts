// src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  CANTEEN_MANAGER = 'canteen_manager',
  TEACHER = 'teacher',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false, type: 'varchar', length: 255 })
  email: string;

  @Column({ nullable: false, type: 'varchar', length: 255 })
  password: string;

  @Column({ nullable: true, type: 'varchar', length: 50 })
  firstName?: string;

  @Column({ nullable: true, type: 'varchar', length: 50 })
  lastName?: string;

  @Column({ nullable: true, type: 'varchar', length: 20 })
  contact?: string;

  @Column({ default: true, type: 'boolean' })
  statut: boolean;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  tokenForgotPass?: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  username: string; // Added for UserDropdown


}
