
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('rapports')
export class Rapport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column()
  type: 'attendance' | 'meals' | 'stock';

  @Column('json', { nullable: true })
  data: any; // Pour stocker des données structurées

  @CreateDateColumn()
  createdAt: Date;

//   @ManyToOne(() => User, user => user.rapports)
//   createdBy: User; // Qui a généré ce rapport
}

 export interface DailyReports{
        date: string;
        totalMeals: number;
        mealsByType:Record<string, number>;
      }
