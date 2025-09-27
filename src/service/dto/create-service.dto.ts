import { IsString, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(225)
  label: string;

  @IsString()
  description: string;
}