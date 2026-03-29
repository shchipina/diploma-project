import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PublicationsController } from './publications.controller';
import { ModerationController } from './moderation.controller';
import { PublicationsService } from './publications.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [PublicationsController, ModerationController],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}
