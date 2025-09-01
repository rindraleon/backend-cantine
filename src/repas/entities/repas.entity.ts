import { Student } from 'src/student/entities/student.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity('repas')
export class Repas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: Date;

  @ManyToOne(() => Student, (student) => student.meals)
  student: Student;

  // @ManyToOne(() => Student, {nullable: true})
  // student: Student;
  @Column()
  mealType: string; // Correspond au régime alimentaire de l'élève

  @Column()
  menuName: string; // e.g., Chicken Rice, Veggie Stir-Fry

  @Column('json')
  ingredients: { stockItemId: number; quantity: number }[]; // Ingredients used from stock
}
