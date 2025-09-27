import { IsString, IsBoolean, IsOptional, IsIP } from 'class-validator';

export class CreateConfigurationDto {
  @IsString()
  @IsIP()
  ip: string;

  @IsString()
  clientId: string;

  @IsString()
  secretId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
