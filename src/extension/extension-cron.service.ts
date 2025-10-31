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
      // Récupérer l'année et le mois pour l'historique
      const currentYear = startTime.getFullYear();
      const currentMonth = startTime.getMonth() + 1; // 1-12
      
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
        let budgetLabel: string | null = null;
        
        if (extension.budget && extension.budget.amount) {
          // Utiliser la balance du budget lié
          newBalance = parseFloat(extension.budget.amount.toString());
          budgetLabel = extension.budget.label;
          this.logger.log(`💰 [CRON] Extension ${extension.id}: Balance mise à jour depuis le budget ${extension.budget.label} (${newBalance})`);
        } else {
          // Pas de budget lié, utiliser la balance par défaut
          newBalance = defaultBalance;
          budgetLabel = 'Budget par défaut';
          this.logger.log(`💰 [CRON] Extension ${extension.id}: Pas de budget lié, balance par défaut (${newBalance})`);
        }
        
        // Mettre à jour la balance actuelle de l'extension
        await this.prisma.extension.update({
          where: { id: extension.id },
          data: { balance: newBalance }
        });
        
        // Enregistrer l'historique du budget mensuel (avec upsert pour éviter les doublons)
        await this.prisma.extensionBudgetHistory.upsert({
          where: {
            extensionId_year_month: {
              extensionId: extension.id,
              year: currentYear,
              month: currentMonth
            }
          },
          update: {
            budgetAmount: newBalance,
            budgetLabel: budgetLabel
          },
          create: {
            extensionId: extension.id,
            year: currentYear,
            month: currentMonth,
            budgetAmount: newBalance,
            budgetLabel: budgetLabel
          }
        });
        
        this.logger.log(`📝 [CRON] Historique enregistré pour l'extension ${extension.id} - ${currentYear}/${currentMonth}: ${newBalance}`);
        
        updatedCount++;
      }
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      this.logger.log(`✅ [CRON MONTHLY] Mise à jour mensuelle terminée en ${duration}ms: ${updatedCount} extensions mises à jour avec historique`);
      
    } catch (error) {
      this.logger.error('❌ [CRON] Erreur lors de la mise à jour des balances des extensions:', error);
    }
  }
}
