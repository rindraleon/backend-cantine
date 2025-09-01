import { Class } from "src/classe/entities/classe.entity";
import { Student } from "src/student/entities/student.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export enum PresenceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  JUSTIFIED = 'justified',
}
@Entity('presences')

export class Presence {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'date' })
    date: Date;

    @ManyToOne(() => Student, (student) => student.presences)
    student: Student;

    
    @ManyToOne(() => Class, classe => classe.presences)
    class: Class; // Nom correct de la propriété

  

    @Column({
        type: 'enum',
        enum: PresenceStatus,
        default: PresenceStatus.ABSENT,
    })
    status: PresenceStatus;

    @Column({ nullable: true })
    justification?: string;
}