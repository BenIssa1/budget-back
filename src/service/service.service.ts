import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  findAll() {
    return this.prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async update(id: number, dto: UpdateServiceDto) {
    await this.findOne(id); // vérifie existence
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id); // vérifie existence
    return this.prisma.service.delete({ where: { id } });
  }
}
