import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { PricingFreeService } from './pricing-free.service';
import { CreatePricingFreeDto } from './dto/create-pricing-free.dto';
import { UpdatePricingFreeDto } from './dto/update-pricing-free.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('pricing-frees')
export class PricingFreeController {
  constructor(private readonly pricingFreeService: PricingFreeService) {}

  @Post()
  create(@Body() dto: CreatePricingFreeDto) {
    return this.pricingFreeService.create(dto);
  }

  @Get()
  findAll() {
    return this.pricingFreeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingFreeService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePricingFreeDto) {
    return this.pricingFreeService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingFreeService.remove(+id);
  }
}
