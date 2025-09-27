import { Module } from '@nestjs/common';
import { ExtensionService } from './extension.service';
import { ExtensionController } from './extension.controller';
import { ExtensionCronService } from './extension-cron.service';

@Module({
  controllers: [ExtensionController],
  providers: [ExtensionService, ExtensionCronService],
})
export class ExtensionModule {}
