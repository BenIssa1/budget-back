import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExtensionCronService {
  private readonly logger = new Logger(ExtensionCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 0 1 * *') // Le 1er de chaque mois à 00:00
  //@Cron('*/5 * * * *') // Toutes les 5 minutes
  async updateExtensionsBalance() {
    const startTime = new Date();
    this.logger.log(`🔄 [CRON MONTHLY] Début de la mise à jour mensuelle des balances des extensions à ${startTime.toLocaleString()}`);
    
    try {
      // Récupérer toutes les extensions avec leurs budgets liés
      const extensions = await this.prisma.extension.findMany({
        include: {
          budget: true
        }
      });
      
      this.logger.log(`📊 [CRON] Trouvé ${extensions.length} extensions à mettre à jour`);
      
      if (extensions.length === 0) {
        this.logger.warn('⚠️ [CRON] Aucune extension trouvée dans la base de données');
        return;
      }
      
      let updatedCount = 0;
      const defaultBalance = 1000;
      
      // Mettre à jour chaque extension individuellement avec sa balance spécifique
      for (const extension of extensions) {
        let newBalance: number;
        
        if (extension.budget && extension.budget.amount) {
          // Utiliser la balance du budget lié
          newBalance = parseFloat(extension.budget.amount.toString());
          this.logger.log(`💰 [CRON] Extension ${extension.id}: Balance mise à jour depuis le budget ${extension.budget.label} (${newBalance})`);
        } else {
          // Pas de budget lié, utiliser la balance par défaut
          newBalance = defaultBalance;
          this.logger.log(`💰 [CRON] Extension ${extension.id}: Pas de budget lié, balance par défaut (${newBalance})`);
        }
        
        await this.prisma.extension.update({
          where: { id: extension.id },
          data: { balance: newBalance }
        });
        
        updatedCount++;
      }
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      this.logger.log(`✅ [CRON MONTHLY] Mise à jour mensuelle terminée en ${duration}ms: ${updatedCount} extensions mises à jour`);
      
    } catch (error) {
      this.logger.error('❌ [CRON] Erreur lors de la mise à jour des balances des extensions:', error);
    }
  }
}
