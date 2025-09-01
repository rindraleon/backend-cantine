import { Presence } from 'src/presence/entities/presence.entity';
import { Student } from 'src/student/entities/student.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  place: number;

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];

  @OneToMany(() => Presence, presence => presence.class)
  presences: Presence[];
}
