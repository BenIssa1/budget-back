import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaidPricingDto } from './dto/create-paid-pricing.dto';
import { UpdatePaidPricingDto } from './dto/update-paid-pricing.dto';

@Injectable()
export class PaidPricingService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePaidPricingDto) {
    return this.prisma.paidPricing.create({ data: dto });
  }

  findAll() {
    return this.prisma.paidPricing.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const item = await this.prisma.paidPricing.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('PaidPricing not found');
    return item;
  }

  async update(id: number, dto: UpdatePaidPricingDto) {
    await this.findOne(id);
    return this.prisma.paidPricing.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.paidPricing.delete({ where: { id } });
  }

  /**
   * Trouve le prix approprié pour un numéro appelé basé sur les préfixes de tarification
   * @param calledNumber - Le numéro appelé
   * @returns Le prix par minute ou 100 par défaut
   */
  async getPricingForNumber(calledNumber: string): Promise<number> {
    // Récupérer tous les tarifs triés par ordernumber (ordre croissant)
    const pricingRules = await this.prisma.paidPricing.findMany({
      orderBy: { ordernumber: 'asc' }
    });

    // Chercher le premier préfixe qui correspond au début du numéro appelé
    for (const rule of pricingRules) {
      if (calledNumber.startsWith(rule.prefix)) {
        return Number(rule.amount);
      }
    }

    // Si aucun préfixe ne correspond, retourner 100 par défaut
    return 100;
  }
}
