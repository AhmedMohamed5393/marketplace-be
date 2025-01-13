// logging.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingService } from './logging.service';
import { Log } from '@shared/entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
