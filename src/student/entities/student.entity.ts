import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Class } from 'src/classe/entities/classe.entity';
import { Repas } from 'src/repas/entities/repas.entity';
import { Presence } from 'src/presence/entities/presence.entity';

@Entity('etudiants')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dateNaiss: Date;

  @Column()
  dietaryRegime: string;

  @ManyToOne(() => Class, (classEntity) => classEntity.students)
  class: Class;

  @OneToMany(() => Presence, (presence) => presence.student)
  presences: Presence[];

  @OneToMany(() => Repas, (meal) => meal.student)
  meals: Repas[];
}