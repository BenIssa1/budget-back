import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, BadRequestException } from '@nestjs/common';
import { PaidPricingService } from './paid-pricing.service';
import { CreatePaidPricingDto } from './dto/create-paid-pricing.dto';
import { UpdatePaidPricingDto } from './dto/update-paid-pricing.dto';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prisma.service';

@UseGuards(AuthGuard('jwt'))
@Controller('pricing-paids')
export class PaidPricingController {
  constructor(private readonly paidPricingService: PaidPricingService, private readonly prisma: PrismaService) {}

  @Post()
  async create(@Body() dto: CreatePaidPricingDto) {
    const existing = await this.prisma.paidPricing.findUnique({ where: { ordernumber: dto.ordernumber } });
    if (existing) throw new BadRequestException('Numéro d\'ordre déjà existant');
    return this.paidPricingService.create(dto);
  }

  @Get()
  findAll() {
    return this.paidPricingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paidPricingService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePaidPricingDto) {
    // Vérifier si l'ordernumber a changé et s'il existe déjà
    if (dto.ordernumber) {
      const currentItem = await this.prisma.paidPricing.findUnique({ where: { id: +id } });
      if (currentItem && currentItem.ordernumber !== dto.ordernumber) {
        const existing = await this.prisma.paidPricing.findUnique({ where: { ordernumber: dto.ordernumber } });
        if (existing) throw new BadRequestException('Numéro d\'ordre déjà existant');
      }
    }
    return this.paidPricingService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paidPricingService.remove(+id);
  }
}
