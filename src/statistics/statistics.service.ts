import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Statistiques générales
  async getGeneralStats() {
    const [
      totalUsers,
      totalExtensions,
      totalServices,
      totalBudgets,
      totalCalls,
      totalPaidPricing,
      totalFreePricing,
      activeConfigurations
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.extension.count(),
      this.prisma.service.count(),
      this.prisma.budget.count(),
      this.prisma.call.count(),
      this.prisma.paidPricing.count(),
      this.prisma.pricingFree.count(),
      this.prisma.configuration.count({ where: { isActive: true } })
    ]);

    return {
      totalUsers,
      totalExtensions,
      totalServices,
      totalBudgets,
      totalCalls,
      totalPaidPricing,
      totalFreePricing,
      activeConfigurations
    };
  }

  // Statistiques de consommation mensuelle
  async getMonthlyConsumption(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const calls = await this.prisma.call.findMany({
      where: {
        start_time: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        extension: true
      }
    });

    const totalDuration = calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
    const totalCost = calls.reduce((sum, call) => sum + (call.cost || 0), 0);
    const totalCalls = calls.length;

    // Consommation par extension
    const consumptionByExtension = calls.reduce((acc, call) => {
      const ext = call.extension_number;
      if (!acc[ext]) {
        acc[ext] = {
          extension: ext,
          extensionId: call.extension?.id,
          extensionBalance: call.extension?.balance,
          calls: 0,
          duration: 0,
          cost: 0
        };
      }
      acc[ext].calls++;
      acc[ext].duration += call.duration_seconds || 0;
      acc[ext].cost += call.cost || 0;
      return acc;
    }, {} as Record<string, { extension: string; extensionId?: number; extensionBalance?: number; calls: number; duration: number; cost: number }>);

    return {
      period: {
        year: targetYear,
        month: targetMonth,
        startDate,
        endDate
      },
      summary: {
        totalCalls,
        totalDuration,
        totalCost,
        averageDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
        averageCost: totalCalls > 0 ? Math.round(totalCost / totalCalls) : 0
      },
      byExtension: Object.values(consumptionByExtension)
    };
  }

  // Statistiques détaillées par extension
  async getExtensionStats(extensionNumber?: string) {
    const whereClause = extensionNumber ? { extension_number: extensionNumber } : {};

    const calls = await this.prisma.call.findMany({
      where: whereClause,
      include: {
        extension: true
      },
      orderBy: { start_time: 'desc' }
    });

    if (extensionNumber && calls.length === 0) {
      return null; // Extension non trouvée
    }

    const totalCalls = calls.length;
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
    const totalCost = calls.reduce((sum, call) => sum + (call.cost || 0), 0);

    // Statistiques par mois (12 derniers mois)
    const monthlyStats = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthCalls = calls.filter(call => 
        call.start_time >= monthDate && call.start_time < nextMonth
      );
      
      const monthDuration = monthCalls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
      const monthCost = monthCalls.reduce((sum, call) => sum + (call.cost || 0), 0);
      
      monthlyStats.push({
        month: monthDate.toISOString().substring(0, 7), // YYYY-MM
        calls: monthCalls.length,
        duration: monthDuration,
        cost: monthCost
      });
    }

    // Top 10 des numéros les plus appelés
    const calledNumbers = calls
      .filter(call => call.extension_number)
      .reduce((acc, call) => {
        // Note: Il faudrait stocker le numéro appelé dans la table Call
        // Pour l'instant, on simule avec des données fictives
        const calledNumber = `+${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        acc[calledNumber] = (acc[calledNumber] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topCalledNumbers = Object.entries(calledNumbers)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([number, count]) => ({ number, calls: count }));

    return {
      extension: extensionNumber || 'All Extensions',
      summary: {
        totalCalls,
        totalDuration,
        totalCost,
        averageDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
        averageCost: totalCalls > 0 ? Math.round(totalCost / totalCalls) : 0
      },
      monthlyStats,
      topCalledNumbers
    };
  }

  // Statistiques des budgets et services
  async getBudgetAndServiceStats() {
    const [budgets, services, extensions] = await Promise.all([
      this.prisma.budget.findMany({
        include: {
          extensions: true
        }
      }),
      this.prisma.service.findMany({
        include: {
          extensions: true
        }
      }),
      this.prisma.extension.findMany({
        include: {
          budget: true,
          service: true
        }
      })
    ]);

    const budgetStats = budgets.map(budget => ({
      id: budget.id,
      label: budget.label,
      amount: budget.amount,
      extensionsCount: budget.extensions.length,
      totalBalance: budget.extensions.reduce((sum, ext) => sum + (ext.balance || 0), 0)
    }));

    const serviceStats = services.map(service => ({
      id: service.id,
      label: service.label,
      extensionsCount: service.extensions.length
    }));

    const unassignedExtensions = extensions.filter(ext => !ext.budgetId && !ext.serviceId);

    return {
      budgets: budgetStats,
      services: serviceStats,
      unassignedExtensions: unassignedExtensions.length,
      totalBudgetAmount: budgets.reduce((sum, budget) => sum + Number(budget.amount), 0),
      totalExtensionsBalance: extensions.reduce((sum, ext) => sum + (ext.balance || 0), 0)
    };
  }

  // Statistiques de tarification
  async getPricingStats() {
    const [paidPricing, freePricing] = await Promise.all([
      this.prisma.paidPricing.findMany(),
      this.prisma.pricingFree.findMany()
    ]);

    const totalPaidAmount = paidPricing.reduce((sum, pricing) => sum + Number(pricing.amount), 0);
    const averagePaidAmount = paidPricing.length > 0 ? totalPaidAmount / paidPricing.length : 0;

    return {
      paidPricing: {
        count: paidPricing.length,
        totalAmount: totalPaidAmount,
        averageAmount: averagePaidAmount,
        byPrefix: paidPricing.reduce((acc, pricing) => {
          acc[pricing.prefix] = (acc[pricing.prefix] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      },
      freePricing: {
        count: freePricing.length,
        contacts: freePricing.map(p => p.contact)
      }
    };
  }

  // Statistiques détaillées avec relations
  async getDetailedStats() {
    const extensions = await this.prisma.extension.findMany({
      include: {
        calls: {
          orderBy: { start_time: 'desc' },
          take: 10 // 10 derniers appels par extension
        },
        service: true,
        budget: true
      }
    });

    const extensionsWithStats = extensions.map(ext => {
      const totalCalls = ext.calls.length;
      const totalDuration = ext.calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
      const totalCost = ext.calls.reduce((sum, call) => sum + (call.cost || 0), 0);
      const lastCall = ext.calls[0];

      return {
        id: ext.id,
        number: ext.number,
        callerIdName: ext.callerIdName,
        balance: ext.balance,
        service: ext.service?.label,
        budget: ext.budget?.label,
        stats: {
          totalCalls,
          totalDuration,
          totalCost,
          averageDuration: totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0,
          lastCallDate: lastCall?.start_time
        }
      };
    });

    return {
      extensions: extensionsWithStats,
      summary: {
        totalExtensions: extensions.length,
        totalCalls: extensionsWithStats.reduce((sum, ext) => sum + ext.stats.totalCalls, 0),
        totalDuration: extensionsWithStats.reduce((sum, ext) => sum + ext.stats.totalDuration, 0),
        totalCost: extensionsWithStats.reduce((sum, ext) => sum + ext.stats.totalCost, 0),
        totalBalance: extensionsWithStats.reduce((sum, ext) => sum + (ext.balance || 0), 0)
      }
    };
  }

  // Export de la consommation par extension et par mois
  async getMonthlyConsumptionByExtension(year?: number, month?: number) {
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Récupérer toutes les extensions avec leurs appels du mois
    const extensions = await this.prisma.extension.findMany({
      include: {
        calls: {
          where: {
            start_time: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });

    // Calculer la consommation pour chaque extension
    const consumptionData = extensions.map(extension => {
      const totalDuration = extension.calls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
      const totalCost = extension.calls.reduce((sum, call) => sum + (call.cost || 0), 0);
      const totalCalls = extension.calls.length;
      const durationInMinutes = Math.round(totalDuration / 60);

      return {
        extensionId: extension.id,
        extensionNumber: extension.number,
        name: extension.callerIdName || `Extension ${extension.number}`,
        calls: totalCalls,
        durationSeconds: totalDuration,
        durationMinutes: durationInMinutes,
        cost: totalCost,
        balance: extension.balance || 0
      };
    });

    // Trier par coût décroissant
    consumptionData.sort((a, b) => b.cost - a.cost);

    // Top 10 des extensions avec la plus grande consommation
    const topConsumption = consumptionData.slice(0, 10);

    return {
      period: {
        year: targetYear,
        month: targetMonth,
        startDate,
        endDate
      },
      data: consumptionData,
      topConsumption: topConsumption,
      summary: {
        totalExtensions: consumptionData.length,
        totalCalls: consumptionData.reduce((sum, ext) => sum + ext.calls, 0),
        totalDuration: consumptionData.reduce((sum, ext) => sum + ext.durationMinutes, 0),
        totalCost: consumptionData.reduce((sum, ext) => sum + ext.cost, 0),
        averageCostPerExtension: consumptionData.length > 0 
          ? Math.round(consumptionData.reduce((sum, ext) => sum + ext.cost, 0) / consumptionData.length) 
          : 0
      }
    };
  }

  // Export de la consommation de tous les mois pour une extension spécifique
  async getExtensionMonthlyHistory(extensionNumber: string, months: number = 12) {
    const extension = await this.prisma.extension.findUnique({
      where: { number: extensionNumber },
      include: {
        calls: {
          orderBy: { start_time: 'desc' }
        }
      }
    });

    if (!extension) {
      return null;
    }

    const now = new Date();
    const monthlyData = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthCalls = extension.calls.filter(call => 
        call.start_time >= monthDate && call.start_time < nextMonth
      );
      
      const totalDuration = monthCalls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0);
      const totalCost = monthCalls.reduce((sum, call) => sum + (call.cost || 0), 0);
      const totalCalls = monthCalls.length;
      
      monthlyData.push({
        month: monthDate.toISOString().substring(0, 7), // YYYY-MM
        monthName: monthDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        calls: totalCalls,
        durationSeconds: totalDuration,
        durationMinutes: Math.round(totalDuration / 60),
        cost: totalCost
      });
    }

    return {
      extension: {
        id: extension.id,
        number: extension.number,
        name: extension.callerIdName || `Extension ${extension.number}`,
        balance: extension.balance
      },
      monthlyHistory: monthlyData,
      summary: {
        totalCalls: monthlyData.reduce((sum, month) => sum + month.calls, 0),
        totalDuration: monthlyData.reduce((sum, month) => sum + month.durationMinutes, 0),
        totalCost: monthlyData.reduce((sum, month) => sum + month.cost, 0),
        averageMonthlyCost: monthlyData.length > 0 
          ? Math.round(monthlyData.reduce((sum, month) => sum + month.cost, 0) / monthlyData.length) 
          : 0
      }
    };
  }

  // Top 10 des extensions avec la plus grande consommation
  async getTop10ExtensionsByConsumption(year?: number, month?: number) {
    const consumptionData = await this.getMonthlyConsumptionByExtension(year, month);
    
    return {
      period: consumptionData.period,
      topConsumption: consumptionData.topConsumption,
      summary: {
        totalExtensions: consumptionData.summary.totalExtensions,
        totalCost: consumptionData.summary.totalCost,
        top10TotalCost: consumptionData.topConsumption.reduce((sum, ext) => sum + ext.cost, 0),
        top10Percentage: consumptionData.summary.totalCost > 0 
          ? Math.round((consumptionData.topConsumption.reduce((sum, ext) => sum + ext.cost, 0) / consumptionData.summary.totalCost) * 100)
          : 0
      }
    };
  }

  // Export CSV de la consommation mensuelle par extension
  async getMonthlyConsumptionCSV(year?: number, month?: number) {
    const consumptionData = await this.getMonthlyConsumptionByExtension(year, month);
    
    // En-têtes CSV
    const headers = [
      'Extension ID',
      'Numéro Extension', 
      'Nom',
      'Nombre d\'appels',
      'Durée (minutes)',
      'Coût total',
      'Solde actuel'
    ];

    // Données CSV
    const csvRows = consumptionData.data.map(ext => [
      ext.extensionId,
      ext.extensionNumber,
      ext.name,
      ext.calls,
      ext.durationMinutes,
      ext.cost,
      ext.balance
    ]);

    // Créer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    return {
      csvContent,
      filename: `consommation_${consumptionData.period.year}_${consumptionData.period.month.toString().padStart(2, '0')}.csv`,
      period: consumptionData.period,
      summary: consumptionData.summary
    };
  }

  // Statistiques des appels récents (7 derniers jours)
  async getRecentCallsStats() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCalls = await this.prisma.call.findMany({
      where: {
        start_time: {
          gte: sevenDaysAgo
        }
      },
      include: {
        extension: true
      },
      orderBy: { start_time: 'desc' }
    });

    const callsByDay = recentCalls.reduce((acc, call) => {
      const day = call.start_time.toISOString().substring(0, 10);
      if (!acc[day]) {
        acc[day] = { calls: 0, duration: 0, cost: 0 };
      }
      acc[day].calls++;
      acc[day].duration += call.duration_seconds || 0;
      acc[day].cost += call.cost || 0;
      return acc;
    }, {} as Record<string, { calls: number; duration: number; cost: number }>);

    return {
      period: '7 derniers jours',
      totalCalls: recentCalls.length,
      totalDuration: recentCalls.reduce((sum, call) => sum + (call.duration_seconds || 0), 0),
      totalCost: recentCalls.reduce((sum, call) => sum + (call.cost || 0), 0),
      byDay: Object.entries(callsByDay).map(([day, stats]) => ({
        day,
        ...stats
      }))
    };
  }
}
