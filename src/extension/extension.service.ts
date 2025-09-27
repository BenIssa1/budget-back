import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { UpdateExtensionDto } from './dto/update-extension.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExtensionService {
  constructor(private prisma: PrismaService) { }

  create(createExtensionDto: CreateExtensionDto) {
    return `This action returns create extension`;
  }

  findAll() {
    return this.prisma.extension.findMany({
      include: {
        budget: true,
        service: true
      }
    });
  }

  async findOne(id: number) {
    const extension = await this.prisma.extension.findUnique({ 
      where: { id },
      include: {
        budget: true,
        service: true
      }
    });
    if (!extension) throw new NotFoundException('Extension not found');
    return extension;   
  }

  update(id: number, updateExtensionDto: UpdateExtensionDto) {
    return `This action updates a #${id} extension`;
  }

  async giveBonus(id: number, amount: number) {
    // Vérifier que l'extension existe
    const extension = await this.findOne(id);
    
    // Calculer la nouvelle balance
    const currentBalance = extension.balance || 0;
    const newBalance = currentBalance + amount;
    
    // Mettre à jour la balance
    return this.prisma.extension.update({
      where: { id },
      data: { balance: newBalance },
      include: {
        budget: true,
        service: true
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.extension.delete({ 
      where: { id },
      include: {
        budget: true,
        service: true
      }
    });
  }

  async triggerUpdateBalances() {
    // Récupérer toutes les extensions avec leurs budgets liés
    const extensions = await this.prisma.extension.findMany({
      include: {
        budget: true,
        service: true
      }
    });
    
    let updatedCount = 0;
    const defaultBalance = 1000;
    
    // Mettre à jour chaque extension individuellement avec sa balance spécifique
    for (const extension of extensions) {
      let newBalance: number;
      
      if (extension.budget && extension.budget.amount) {
        // Utiliser la balance du budget lié
        newBalance = parseFloat(extension.budget.amount.toString());
      } else {
        // Pas de budget lié, utiliser la balance par défaut
        newBalance = defaultBalance;
      }
      
      await this.prisma.extension.update({
        where: { id: extension.id },
        data: { balance: newBalance }
      });
      
      updatedCount++;
    }
    
    return {
      message: `Mise à jour manuelle terminée: ${updatedCount} extensions mises à jour`,
      updatedCount: updatedCount
    };
  }

  async linkBudget(extensionId: number, budgetId: number) {
    // Vérifier que l'extension existe
    await this.findOne(extensionId);
    
    // Vérifier que le budget existe
    const budget = await this.prisma.budget.findUnique({ where: { id: budgetId } });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    
    // Mettre à jour l'extension avec le nouveau budget
    // Si l'extension avait déjà un budget, il sera automatiquement remplacé
    const updatedExtension = await this.prisma.extension.update({
      where: { id: extensionId },
      data: { budgetId },
      include: { 
        budget: true,
        service: true 
      }
    });
    
    return {
      message: 'Budget linked to extension successfully',
      extension: updatedExtension
    };
  }

  async linkService(extensionId: number, serviceId: number) {
    // Vérifier que l'extension existe
    await this.findOne(extensionId);
    
    // Vérifier que le service existe
    const service = await this.prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    
    // Mettre à jour l'extension avec le nouveau service
    // Si l'extension avait déjà un service, il sera automatiquement remplacé
    const updatedExtension = await this.prisma.extension.update({
      where: { id: extensionId },
      data: { serviceId },
      include: { 
        budget: true,
        service: true 
      }
    });
    
    return {
      message: 'Service linked to extension successfully',
      extension: updatedExtension
    };
  }
}
