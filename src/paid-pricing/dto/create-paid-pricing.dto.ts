import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaidPricingDto {
  @IsString()
  ordernumber: string;

  @IsString()
  prefix: string;

  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsString()
  description: string;
}
