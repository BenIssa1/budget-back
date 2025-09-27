import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConfigurationService {
  constructor(private prisma: PrismaService) {}

  create(createConfigurationDto: CreateConfigurationDto) {
    return this.prisma.configuration.create({
      data: createConfigurationDto,
    });
  }

  findAll() {
    return this.prisma.configuration.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async findOne(id: number) {
    const configuration = await this.prisma.configuration.findUnique({
      where: { id },
    });
    
    if (!configuration) {
      throw new NotFoundException('Configuration not found');
    }
    
    return configuration;
  }

  async update(id: number, updateConfigurationDto: UpdateConfigurationDto) {
    // Vérifier que la configuration existe
    await this.findOne(id);
    
    return this.prisma.configuration.update({
      where: { id },
      data: updateConfigurationDto,
    });
  }

  async remove(id: number) {
    // Vérifier que la configuration existe
    await this.findOne(id);
    
    return this.prisma.configuration.delete({
      where: { id },
    });
  }

  async findActive() {
    return this.prisma.configuration.findFirst({
      where: { isActive: true },
    });
  }

  async setActive(id: number) {
    // Désactiver toutes les configurations
    await this.prisma.configuration.updateMany({
      data: { isActive: false },
    });
    
    // Activer la configuration spécifiée
    return this.prisma.configuration.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
