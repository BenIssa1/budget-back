import { Global, Module } from '@nestjs/common';
import { YeastarController } from './yeastar.controller';
import { YeastarService } from './yeastar.service';
import { YeastarWebSocketService } from './yeastar-websocket.service';
import { CallSessionService } from './call-session.service';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { PaidPricingModule } from '../paid-pricing/paid-pricing.module';
import { PricingFreeModule } from '../pricing-free/pricing-free.module';
import { ConfigurationModule } from '../configuration/configuration.module';

@Module({
  imports: [HttpModule, CacheModule.register(), PaidPricingModule, PricingFreeModule, ConfigurationModule],
  providers: [YeastarService, YeastarWebSocketService, CallSessionService],
  controllers: [YeastarController],
  exports: [YeastarService, YeastarWebSocketService, CallSessionService]
})
export class YeastarModule {}
