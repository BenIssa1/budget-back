import { IsString } from 'class-validator';

export class CreatePricingFreeDto {
  @IsString()
  contact: string;

  @IsString()
  description: string;
}
