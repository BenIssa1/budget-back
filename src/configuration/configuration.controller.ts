import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { ConfigurationService } from './configuration.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('configurations')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Post()
  create(@Body() createConfigurationDto: CreateConfigurationDto) {
    return this.configurationService.create(createConfigurationDto);
  }

  @Get()
  findAll() {
    return this.configurationService.findAll();
  }

  @Get('active')
  findActive() {
    return this.configurationService.findActive();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configurationService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateConfigurationDto: UpdateConfigurationDto) {
    return this.configurationService.update(+id, updateConfigurationDto);
  }

  @Patch(':id/activate')
  setActive(@Param('id') id: string) {
    return this.configurationService.setActive(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.configurationService.remove(+id);
  }
}
