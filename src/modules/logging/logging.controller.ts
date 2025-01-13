// log.controller.ts
import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { Log } from '@shared/entities/log.entity';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';

@Controller('logs')
export class LoggingController {
  constructor(private readonly logService: LoggingService) {}

  @Post()
  createLog(@Body() log: Partial<Log>) {
    return this.logService.createLog(log);
  }

  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.logService.findAll(pageOptionsDto);
  }
}
