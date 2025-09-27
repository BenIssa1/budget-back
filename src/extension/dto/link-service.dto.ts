import { IsNumber, IsPositive } from 'class-validator';

export class LinkServiceDto {
  @IsNumber()
  @IsPositive()
  serviceId: number;
}
