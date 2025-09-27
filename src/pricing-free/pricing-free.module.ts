import { Module } from '@nestjs/common';
import { PricingFreeService } from './pricing-free.service';
import { PricingFreeController } from './pricing-free.controller';

@Module({
  controllers: [PricingFreeController],
  providers: [PricingFreeService],
  exports: [PricingFreeService],
})
export class PricingFreeModule {}
