import { IsString, MaxLength, IsNumber } from 'class-validator';

export class CreateBudgetDto {
  @IsString()
  @MaxLength(225)
  label: string;

  @IsNumber()
  amount: number;

  @IsString()
  description: string;
}
