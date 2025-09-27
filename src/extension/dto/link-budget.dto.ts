import { IsNumber, IsPositive } from 'class-validator';

export class LinkBudgetDto {
  @IsNumber()
  @IsPositive()
  budgetId: number;
}
