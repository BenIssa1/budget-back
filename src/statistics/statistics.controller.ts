import { Controller, Get, Query, Param, Res, Header, ParseIntPipe } from '@nestjs/common';
import { Response } from 'express';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('general')
  async getGeneralStats() {
    return this.statisticsService.getGeneralStats();
  }

  @Get('monthly-consumption')
  async getMonthlyConsumption(
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    return this.statisticsService.getMonthlyConsumption(year, month);
  }

  @Get('extension/:extensionNumber')
  async getExtensionStats(@Param('extensionNumber') extensionNumber: string) {
    return this.statisticsService.getExtensionStats(extensionNumber);
  }

  @Get('extension')
  async getAllExtensionsStats() {
    return this.statisticsService.getExtensionStats();
  }

  @Get('budget-service')
  async getBudgetAndServiceStats() {
    return this.statisticsService.getBudgetAndServiceStats();
  }

  @Get('pricing')
  async getPricingStats() {
    return this.statisticsService.getPricingStats();
  }

  @Get('recent-calls')
  async getRecentCallsStats() {
    return this.statisticsService.getRecentCallsStats();
  }

  @Get('detailed')
  async getDetailedStats() {
    return this.statisticsService.getDetailedStats();
  }

  @Get('monthly-consumption-by-extension')
  async getMonthlyConsumptionByExtension(
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    return this.statisticsService.getMonthlyConsumptionByExtension(year, month);
  }

  @Get('top10-extensions')
  async getTop10ExtensionsByConsumption(
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    return this.statisticsService.getTop10ExtensionsByConsumption(year, month);
  }

  @Get('extension/:extensionNumber/monthly-history')
  async getExtensionMonthlyHistory(
    @Param('extensionNumber') extensionNumber: string,
    @Query('months') months?: number
  ) {
    return this.statisticsService.getExtensionMonthlyHistory(extensionNumber, months);
  }

  @Get('monthly-consumption-csv')
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="consommation_mensuelle.csv"')
  async getMonthlyConsumptionCSV(
    @Res() res: Response,
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    const csvData = await this.statisticsService.getMonthlyConsumptionCSV(year, month);
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${csvData.filename}"`);
    res.send(csvData.csvContent);
  }

  @Get('dashboard')
  async getDashboardStats() {
    const [
      generalStats,
      monthlyConsumption,
      budgetServiceStats,
      recentCallsStats
    ] = await Promise.all([
      this.statisticsService.getGeneralStats(),
      this.statisticsService.getMonthlyConsumption(),
      this.statisticsService.getBudgetAndServiceStats(),
      this.statisticsService.getRecentCallsStats()
    ]);

    return {
      general: generalStats,
      monthly: monthlyConsumption,
      budgetService: budgetServiceStats,
      recentCalls: recentCallsStats
    };
  }
}
