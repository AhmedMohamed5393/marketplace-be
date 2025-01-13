import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductRepository } from '@shared/repositories/product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ProductRepository]), LoggingModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
