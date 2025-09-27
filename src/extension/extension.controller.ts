import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExtensionService } from './extension.service';
import { CreateExtensionDto } from './dto/create-extension.dto';
import { UpdateExtensionDto } from './dto/update-extension.dto';
import { GiveBonusDto } from './dto/give-bonus.dto';
import { LinkBudgetDto } from './dto/link-budget.dto';
import { LinkServiceDto } from './dto/link-service.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('extensions')
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Post()
  create(@Body() createExtensionDto: CreateExtensionDto) {
    return this.extensionService.create(createExtensionDto);
  }

  @Get()
  findAll() {
    return this.extensionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.extensionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExtensionDto: UpdateExtensionDto) {
    return this.extensionService.update(+id, updateExtensionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.extensionService.remove(+id);
  }

  @Post(':id/bonus')
  giveBonus(@Param('id') id: string, @Body() giveBonusDto: GiveBonusDto) {
    return this.extensionService.giveBonus(+id, giveBonusDto.amount);
  }

  @Post('cron/update-balances')
  triggerUpdateBalances() {
    return this.extensionService.triggerUpdateBalances();
  }

  @Post(':id/link-budget')
  linkBudget(@Param('id') id: string, @Body() linkBudgetDto: LinkBudgetDto) {
    return this.extensionService.linkBudget(+id, linkBudgetDto.budgetId);
  }

  @Post(':id/link-service')
  linkService(@Param('id') id: string, @Body() linkServiceDto: LinkServiceDto) {
    return this.extensionService.linkService(+id, linkServiceDto.serviceId);
  }
}
