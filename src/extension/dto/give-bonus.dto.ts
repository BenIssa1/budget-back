import { IsNumber, IsPositive } from 'class-validator';

export class GiveBonusDto {
  @IsNumber()
  @IsPositive()
  amount: number;
}
