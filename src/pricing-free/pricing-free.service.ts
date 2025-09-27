import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePricingFreeDto } from './dto/create-pricing-free.dto';
import { UpdatePricingFreeDto } from './dto/update-pricing-free.dto';

@Injectable()
export class PricingFreeService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePricingFreeDto) {
    const existing = await this.prisma.pricingFree.findUnique({ where: { contact: dto.contact } });
    if (existing) throw new BadRequestException('Contact déjà existant');
    return this.prisma.pricingFree.create({ data: dto });
  }

  findAll() {
    return this.prisma.pricingFree.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const item = await this.prisma.pricingFree.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('PricingFree not found');
    return item;
  }

  async update(id: number, dto: UpdatePricingFreeDto) {
    await this.findOne(id);
    const existing = await this.prisma.pricingFree.findUnique({ where: { contact: dto.contact } });
    if (existing) throw new BadRequestException('Contact déjà existant');
    return this.prisma.pricingFree.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pricingFree.delete({ where: { id } });
  }

  /**
   * Vérifie si un numéro est dans la liste des numéros gratuits
   * @param contact - Le numéro à vérifier
   * @returns true si le numéro est gratuit, false sinon
   */
  async isFreeNumber(contact: string): Promise<boolean> {
    const freeNumber = await this.prisma.pricingFree.findUnique({
      where: { contact }
    });
    return !!freeNumber;
  }
}
