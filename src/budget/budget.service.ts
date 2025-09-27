import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateBudgetDto) {
    return this.prisma.budget.create({ data: dto });
  }

  findAll() {
    return this.prisma.budget.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(id: number, dto: UpdateBudgetDto) {
    await this.findOne(id); // check existence
    return this.prisma.budget.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.budget.delete({ where: { id } });
  }
}
