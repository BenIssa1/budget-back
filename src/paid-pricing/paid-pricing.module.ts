import { Module } from '@nestjs/common';
import { PaidPricingService } from './paid-pricing.service';
import { PaidPricingController } from './paid-pricing.controller';

@Module({
  controllers: [PaidPricingController],
  providers: [PaidPricingService],
  exports: [PaidPricingService],
})
export class PaidPricingModule {}
