import { PartialType } from '@nestjs/mapped-types';
import { CreatePricingFreeDto } from './create-pricing-free.dto';

export class UpdatePricingFreeDto extends PartialType(CreatePricingFreeDto) {}
