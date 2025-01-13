import { Product } from '../../entities/product.entity';
import { BaseRepositoryInterface } from './base.repository.interface';

export type ProductRepositoryInterface = BaseRepositoryInterface<Product>;
