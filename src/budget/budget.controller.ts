import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('budgets')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() dto: CreateBudgetDto) {
    return this.budgetService.create(dto);
  }

  @Get()
  findAll() {
    return this.budgetService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBudgetDto) {
    return this.budgetService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetService.remove(+id);
  }
}
