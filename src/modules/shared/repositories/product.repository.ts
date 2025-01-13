import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';
import { Product } from '@shared/entities/product.entity';
import { ProductRepositoryInterface } from './interfaces/product.repository.interface';

@Injectable()
export class ProductRepository
  extends BaseRepository<Product>
  implements ProductRepositoryInterface
{
  constructor(
    @InjectRepository(Product) productRepository: Repository<Product>,
  ) {
    super(productRepository);
  }
}
