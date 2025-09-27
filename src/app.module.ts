import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { SmsModule } from './sms/sms.module';
import { ServiceModule } from './service/service.module';
import { BudgetModule } from './budget/budget.module';
import { PricingFreeModule } from './pricing-free/pricing-free.module';
import { PaidPricingModule } from './paid-pricing/paid-pricing.module';
import { YeastarModule } from './yeastar/yeastar.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ExtensionModule } from './extension/extension.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { StatisticsModule } from './statistics/statistics.module';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: 'localhost',
      port: 6379,
      ttl: 0,
    }),
    AuthModule,
    PrismaModule, SmsModule,
    ServiceModule, BudgetModule,
    PricingFreeModule, PaidPricingModule,
    YeastarModule,
    ExtensionModule,
    ConfigurationModule,
    StatisticsModule
  ],
  exports: [CacheModule]
})
export class AppModule { }
