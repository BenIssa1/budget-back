import { PartialType } from '@nestjs/mapped-types';
import { CreatePaidPricingDto } from './create-paid-pricing.dto';

export class UpdatePaidPricingDto extends PartialType(CreatePaidPricingDto) {}
