import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repas } from './entities/repas.entity';
import { StudentService } from 'src/student/student.service';
import { PresenceService } from 'src/presence/presence.service';
import { MovementType } from 'src/stock/entities/stock-mouvement.entity';
import { StockMovementService } from 'src/stock/stock-mouvement.service';
import { StockItemService } from 'src/stock/stock-item.service';
import { StockItem, Unite } from 'src/stock/entities/stock-type.entity';

@Injectable()
export class RepasService {
  private menus = {
    Standard: [
      {
        name: 'Riz au poulet',
        ingredients: [
          { name: 'Riz', quantity: 250, unit: 'g' },
          { name: 'Poulet', quantity: 150, unit: 'g' },
          { name: 'Carottes', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Pâtes au bœuf',
        ingredients: [
          { name: 'Pâtes', quantity: 200, unit: 'g' },
          { name: 'Bœuf', quantity: 150, unit: 'g' },
          { name: 'Sauce tomate', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Poisson et pommes de terre',
        ingredients: [
          { name: 'Poisson', quantity: 150, unit: 'g' },
          { name: 'Pommes de terre', quantity: 200, unit: 'g' },
          { name: 'Petits pois', quantity: 100, unit: 'g' },
        ],
      },
    ],
    Vegetarian: [
      {
        name: 'Sauté de légumes',
        ingredients: [
          { name: 'Riz', quantity: 250, unit: 'g' },
          { name: 'Tofu', quantity: 150, unit: 'g' },
          { name: 'Brocoli', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Curry de lentilles',
        ingredients: [
          { name: 'Lentilles', quantity: 200, unit: 'g' },
          { name: 'Riz', quantity: 250, unit: 'g' },
          { name: 'Épinards', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Pâtes aux légumes',
        ingredients: [
          { name: 'Pâtes', quantity: 200, unit: 'g' },
          { name: 'Sauce tomate', quantity: 100, unit: 'g' },
          { name: 'Courgettes', quantity: 100, unit: 'g' },
        ],
      },
    ],
    Halal: [
      {
        name: 'Riz au poulet halal',
        ingredients: [
          { name: 'Riz', quantity: 250, unit: 'g' },
          { name: 'Poulet halal', quantity: 150, unit: 'g' },
          { name: 'Carottes', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Kebab d’agneau',
        ingredients: [
          { name: 'Agneau', quantity: 150, unit: 'g' },
          { name: 'Riz', quantity: 250, unit: 'g' },
          { name: 'Concombre', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Ragoût de pois chiches',
        ingredients: [
          { name: 'Pois chiches', quantity: 200, unit: 'g' },
          { name: 'Riz', quantity: 250, unit: 'g' },
          { name: 'Sauce tomate', quantity: 100, unit: 'g' },
        ],
      },
    ],
    Others: [
      {
        name: 'Bol de quinoa végan',
        ingredients: [
          { name: 'Quinoa', quantity: 200, unit: 'g' },
          { name: 'Avocat', quantity: 100, unit: 'g' },
          { name: 'Chou kale', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Pâtes sans gluten',
        ingredients: [
          { name: 'Pâtes sans gluten', quantity: 200, unit: 'g' },
          { name: 'Sauce tomate', quantity: 100, unit: 'g' },
          { name: 'Épinards', quantity: 100, unit: 'g' },
        ],
      },
      {
        name: 'Salade de haricots mélangés',
        ingredients: [
          { name: 'Haricots mélangés', quantity: 200, unit: 'g' },
          { name: 'Maïs', quantity: 100, unit: 'g' },
          { name: 'Poivrons', quantity: 100, unit: 'g' },
        ],
      },
    ],
  };

  private unitConversionFactors: Record<string, number> = {
    'kg-g': 1000,
    'g-kg': 0.001,
    'l-ml': 1000,
    'ml-l': 0.001,
    'kg-mg': 1000000,
    'mg-kg': 0.000001,
    'g-mg': 1000,
    'mg-g': 0.001,
  };

  constructor(
    @InjectRepository(Repas)
    private mealsRepository: Repository<Repas>,
    private studentsService: StudentService,
    private attendanceService: PresenceService,
    private stockItemService: StockItemService,
    private stockMovementService: StockMovementService,
  ) {}

  private convertUnits(quantity: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return quantity;
    
    // Normaliser les unités
    const normalize = (unit: string) => unit.toLowerCase().replace('é', 'e');
    const nFrom = normalize(fromUnit);
    const nTo = normalize(toUnit);
    
    if (nFrom === nTo) return quantity;
    
    const key = `${nFrom}-${nTo}`;
    const factor = this.unitConversionFactors[key];
    
    if (!factor) {
      throw new BadRequestException(
        `Conversion d'unité non supportée: ${fromUnit} vers ${toUnit}`,
      );
    }
    
    return quantity * factor;
  }

  async generateDailyMeals(date: string): Promise<{ meals: Repas[]; alerts: string[] }> {
    const parsedDate = new Date(date);
    const students = await this.studentsService.findAll();
    const stockItems = await this.stockItemService.getAllItems();
    const requiredQuantities: Record<string, { quantity: number; unit: string }> = {};
    const studentMeals: { student: any; menu: any }[] = [];
    const alerts: string[] = [];
    let totalPresence = 0;

    // Calculer la présence et les quantités requises
    for (const student of students) {
      const attendance = await this.attendanceService.getDailyAttendance(
        String(student.class.id),
        parsedDate,
      );
      
      const studentAttendance = attendance.find((a) => a.student.id === student.id);
      
      if (studentAttendance?.status === 'present') {
        totalPresence++;
        const dietaryRegime = student.dietaryRegime || 'Standard';
        const menu =
          this.menus[dietaryRegime][
            Math.floor(Math.random() * this.menus[dietaryRegime].length)
          ];
        
        studentMeals.push({ student, menu });
        
        for (const ingredient of menu.ingredients) {
          const key = `${ingredient.name}-${ingredient.unit}`;
          if (!requiredQuantities[key]) {
            requiredQuantities[key] = { quantity: 0, unit: ingredient.unit };
          }
          requiredQuantities[key].quantity += ingredient.quantity;
        }
      }
    }

    // Vérifier le stock
    for (const [key, { quantity, unit }] of Object.entries(requiredQuantities)) {
      const [itemName] = key.split('-');
      const stockItem = stockItems.find((item) => item.name === itemName);
      
      if (!stockItem) {
        alerts.push(`Article non trouvé: ${itemName} (${unit})`);
        continue;
      }
      
      try {
        const stockQuantity = this.convertUnits(
          stockItem.quantity,
          stockItem.unite,
          unit,
        );
        
        if (stockQuantity < quantity) {
          const shortage = quantity - stockQuantity;
          alerts.push(
            `Stock insuffisant pour ${itemName}: ${quantity}${unit} requis, ${stockQuantity.toFixed(2)}${unit} disponible`,
          );
          
          await this.stockMovementService.createMovement({
            itemId: stockItem.id,
            quantity: this.convertUnits(shortage, unit, stockItem.unite),
            type: MovementType.IN,
            reason: `Réapprovisionnement pour ${itemName} le ${date}`,
          });
        }
      } catch (error) {
        alerts.push(error.message);
      }
    }

    if (alerts.length > 0) {
      return { meals: [], alerts };
    }

    // Créer les repas et mettre à jour le stock
    const meals: Repas[] = [];
    for (const { student, menu } of studentMeals) {
      const ingredients = [];
      
      for (const ing of menu.ingredients) {
        const stockItem = stockItems.find(
          (item) => item.name === ing.name && item.unite === ing.unit,
        );
        
        if (stockItem) {
          await this.stockMovementService.createMovement({
            itemId: stockItem.id,
            quantity: -ing.quantity,
            type: MovementType.OUT,
            reason: `Repas pour ${student.firstName} le ${date}`,
          });
          
          // ingredients.push({
          //   stockItemId: stockItem.id,
          //   name: ing.name,
          //   quantity: ing.quantity,
          //   unit: ing.unit,
          // });
        }
      }

      const meal = this.mealsRepository.create({
        date: parsedDate,
        student,
        mealType: student.dietaryRegime,
        menuName: menu.name,
        ingredients,
      });
      
      meals.push(meal);
    }

    await this.mealsRepository.save(meals);
    return { meals, alerts };
  }

  async createManualMeal(data: { date: string; menuName: string; totalPresence: number }): Promise<any> {
    const meals: Repas[] = [];
    const alerts: string[] = [];
    const parsedDate = new Date(data.date);
    const stockItems = await this.stockItemService.getAllItems();
    
  
  // PARSER LE NOM DU MENU
  const menuParts = data.menuName.split(' - ');
  if (menuParts.length !== 2) {
    throw new BadRequestException('Format de nom de menu invalide');
  }
  
  const [category, actualMenuName] = menuParts;
  const menuCategory = this.menus[category];
  
  if (!menuCategory) {
    throw new BadRequestException(`Catégorie de menu invalide: ${category}`);
  }
  
  const menu = menuCategory.find((m) => m.name === actualMenuName);
  if (!menu) throw new BadRequestException('Nom de menu invalide');
    // Calculate required quantities based on total presence
    const requiredQuantities: { [key: string]: { quantity: number; unit: string } } = {};
    for (const ingredient of menu.ingredients) {
      const key = `${ingredient.name}-${ingredient.unit}`;
      requiredQuantities[key] = requiredQuantities[key] || { quantity: 0, unit: ingredient.unit };
      requiredQuantities[key].quantity += ingredient.quantity * data.totalPresence;
    }

    // Check stock availability
    for (const [key, { quantity, unit }] of Object.entries(requiredQuantities)) {
      const [itemName] = key.split('-');
      const stockItem = stockItems.find((item) => item.name === itemName);
      if (!stockItem) {
        alerts.push(`Stock item ${itemName} (${unit}) not found. Please add to stock.`);
        continue;
      }
      const stockQuantity = this.convertUnits(stockItem.quantity, stockItem.unite, unit);
      if (stockQuantity < quantity) {
        const shortage = quantity - stockQuantity;
        alerts.push(
          `Insufficient stock for ${itemName} (${unit}): ${quantity} required, ${stockQuantity} available. Please add ${shortage} ${unit}.`
        );
        await this.stockMovementService.createMovement({
          itemId: stockItem.id,
          quantity: this.convertUnits(shortage, unit, stockItem.unite),
          type: MovementType.IN,
          reason: `Restock request for ${itemName} due to manual meal creation on ${data.date}`,
        });
      }
    }

    if (alerts.length > 0) {
      return { meal: null, alerts };
    }

    // Create a single meal entry for manual creation
    const ingredients = await Promise.all(
      menu.ingredients.map(async (ing: any) => {
        const stockItem = stockItems.find((item) => item.name === ing.name && item.unite === ing.unit);
        if (stockItem) {
          await this.stockMovementService.createMovement({
            itemId: stockItem.id,
            quantity: ing.quantity * data.totalPresence,
            type: MovementType.OUT,
            reason: `Manual meal creation for ${data.totalPresence} students on ${data.date}`,
          });
          return { stockItemId: stockItem.id, name: ing.name, quantity: ing.quantity * data.totalPresence, unit: ing.unit };
        }
        return null;
      })
    );

    const meal = this.mealsRepository.create({
      date: parsedDate,
      //student: null, // No specific student for manual creation
      mealType: data.menuName.split(' - ')[0],
      menuName: data.menuName,
      ingredients: ingredients.filter((i) => i !== null),
    });
    meals.push(meal);
    await this.mealsRepository.save(meals);
    return { meal, alerts };
  }

  async create(data: { 
  studentId?: number; 
  date: string; 
  menuName: string; 
  totalPresence?: number }, 
  isManual: boolean = false): Promise<Repas | { meal: Repas; alerts: string[] }> {
  
  if (isManual) {
    if (data.totalPresence === undefined) {
      throw new BadRequestException('totalPresence est requis pour les repas manuels');
    }
    return this.createManualMeal({
      date: data.date,
      menuName: data.menuName,
      totalPresence: data.totalPresence
    });
  }

  if (!data.studentId) {
    throw new BadRequestException("L'ID de l'étudiant est requis pour les repas non manuels");
  }

  // PARSER LE NOM DU MENU
  const menuParts = data.menuName.split(' - ');
  if (menuParts.length !== 2) {
    throw new BadRequestException('Format de nom de menu invalide');
  }
  
  const [category, actualMenuName] = menuParts;
  const menuCategory = this.menus[category];
  
  if (!menuCategory) {
    throw new BadRequestException(`Catégorie de menu invalide: ${category}`);
  }
  
  const menu = menuCategory.find(m => m.name === actualMenuName);
  if (!menu) {
    throw new BadRequestException(`Nom de menu invalide: ${actualMenuName} dans la catégorie ${category}`);
  }

  const student = await this.studentsService.findOne(data.studentId);
  if (!student) throw new BadRequestException('Étudiant non trouvé');

  const stockItems = await this.stockItemService.getAllItems();
  const ingredients = await Promise.all(
    menu.ingredients.map(async (ing: any) => {
      const stockItem = stockItems.find((item) => item.name === ing.name && item.unite === ing.unit);
      if (!stockItem) throw new BadRequestException(`Article stock ${ing.name} (${ing.unit}) non trouvé`);
      const requiredQuantity = this.convertUnits(ing.quantity, ing.unit, stockItem.unite);
      if (stockItem.quantity < requiredQuantity) {
        throw new BadRequestException(
          `Stock insuffisant pour ${ing.name}: ${ing.quantity} ${ing.unit} requis, ${stockItem.quantity} ${stockItem.unite} disponible`
        );
      }
      await this.stockMovementService.createMovement({
        itemId: stockItem.id,
        quantity: requiredQuantity,
        type: MovementType.OUT,
        reason: `Création manuelle de repas pour ${student.firstName}`,
      });
      return { stockItemId: stockItem.id, name: ing.name, quantity: ing.quantity, unit: ing.unit };
    })
  );

  const meal = this.mealsRepository.create({
    date: new Date(data.date),
    student,
    mealType: category, // Utiliser la catégorie comme type de repas
    menuName: data.menuName, // Garder le nom complet pour l'affichage
    ingredients,
  });
  return this.mealsRepository.save(meal);
}

  async update(id: number, data: { mealType?: string; menuName?: string; date?: string }): Promise<Repas> {
  const meal = await this.mealsRepository.findOne({ where: { id }, relations: ['student'] });
  if (!meal) throw new BadRequestException('Repas non trouvé');

  // Reverse previous stock movements
  for (const ing of meal.ingredients) {
    await this.stockMovementService.createMovement({
      itemId: ing.stockItemId,
      quantity: ing.quantity,
      type: MovementType.IN,
      reason: `Annulation de la modification de repas pour ${meal.student?.firstName || 'repas manuel'}`,
    });
  }

  // Apply new ingredients if menuName changes
  if (data.menuName && data.menuName !== meal.menuName) {
    // PARSER LE NOUVEAU NOM DE MENU
    const menuParts = data.menuName.split(' - ');
    if (menuParts.length !== 2) {
      throw new BadRequestException('Format de nom de menu invalide');
    }
    
    const [category, actualMenuName] = menuParts;
    const menuCategory = this.menus[category];
    
    if (!menuCategory) {
      throw new BadRequestException(`Catégorie de menu invalide: ${category}`);
    }
    
    const menu = menuCategory.find((m) => m.name === actualMenuName);
    if (!menu) throw new BadRequestException('Nom de menu invalide');

    const stockItems = await this.stockItemService.getAllItems();
    meal.ingredients = await Promise.all(
      menu.ingredients.map(async (ing: any) => {
        const stockItem = stockItems.find((item) => item.name === ing.name && item.unite === ing.unit);
        if (!stockItem) throw new BadRequestException(`Article stock ${ing.name} (${ing.unit}) non trouvé`);
        const requiredQuantity = this.convertUnits(ing.quantity, ing.unit, stockItem.unite);
        if (stockItem.quantity < requiredQuantity) {
          throw new BadRequestException(
            `Stock insuffisant pour ${ing.name}: ${ing.quantity} ${ing.unit} requis, ${stockItem.quantity} ${stockItem.unite} disponible`
          );
        }
        await this.stockMovementService.createMovement({
          itemId: stockItem.id,
          quantity: requiredQuantity,
          type: MovementType.OUT,
          reason: `Modification de repas pour ${meal.student?.firstName || 'repas manuel'}`,
        });
        return { stockItemId: stockItem.id, name: ing.name, quantity: ing.quantity, unit: ing.unit };
      })
    );
  }

  Object.assign(meal, {
    mealType: data.mealType ?? meal.mealType,
    menuName: data.menuName ?? meal.menuName,
    date: data.date ? new Date(data.date) : meal.date,
  });
  return this.mealsRepository.save(meal);
}

  async delete(id: number): Promise<void> {
    const meal = await this.mealsRepository.findOne({ where: { id }, relations: ['student'] });
    if (!meal) throw new BadRequestException('Meal not found');

    for (const ing of meal.ingredients) {
      await this.stockMovementService.createMovement({
        itemId: ing.stockItemId,
        quantity: ing.quantity,
        type: MovementType.IN,
        reason: `Reversing meal deletion for ${meal.student?.firstName || 'manual meal'}`,
      });
    }
    await this.mealsRepository.remove(meal);
  }

  async getDailyMeals(date: Date): Promise<Repas[]> {
    return this.mealsRepository.find({
      where: { date },
      relations: ['student'],
    });
  }

  async getAll(): Promise<any[]> {
    const meals = await this.mealsRepository.find({ relations: ['student'] });
    const stockItems = await this.stockItemService.getAllItems();
    return meals.map((meal) => ({
      id: meal.id,
      nom: meal.student ? meal.student.firstName : 'Manual Meal',
      ingredients: meal.ingredients.map((ing) => {
        const stockItem = stockItems.find((item) => item.id === ing.stockItemId);
        return {
          stockItemId: ing.stockItemId,
          name: stockItem?.name || 'Unknown',
          quantity: ing.quantity,
          unit: stockItem?.unite || 'Unknown',
        };
      }),
      date: new Date(meal.date).toLocaleDateString(),
      type: meal.menuName,
    }));
  }

  async getStudentMeals(studentId: string): Promise<Repas[]> {
    return this.mealsRepository.find({
      where: { student: { id: Number(studentId) } },
      order: { date: 'DESC' },
      relations: ['student'],
    });
  }

  async countMealsByType(date: Date): Promise<{ [key: string]: number }> {
    const meals = await this.getDailyMeals(date);
    const count: { [key: string]: number } = {};
    meals.forEach((meal) => {
      count[meal.mealType] = (count[meal.mealType] || 0) + 1;
    });
    return count;
  }
}

