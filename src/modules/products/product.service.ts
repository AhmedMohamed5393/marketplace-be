import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@shared/repositories/product.repository';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { ILike } from 'typeorm';
import { Product } from '@shared/entities/product.entity';
import { AddDto, EditDto } from './dtos/index.dto';
import { LoggingService } from '../logging/logging.service';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly loggingService: LoggingService,
  ) {}

  async saveNewProduct(
    productDto: AddDto,
    user_id: string,
  ): Promise<Product> {
    const newProduct = new Product();
    newProduct.name = productDto.name;
    newProduct.description = productDto.description;
    newProduct.price = productDto.price;
    newProduct.stock = productDto.stock;

    const product = await this.productRepository.save(newProduct);

    await this.loggingService.createLog({
      title: 'Added new product',
      action: `Added new product with title "${product.name}"`,
      entity: 'Product',
      user_id: user_id,
      user_type: AuthTypeEnum.ADMIN,
    });

    return product;
  }

  async getProducts(pageOptionsDto: PageOptionsDto) {
    const { page, take, search } = pageOptionsDto;
    const skip = (page - 1) * take || 0;

    const where = search
      ? [
          { name: ILike(`%${pageOptionsDto.search}%`) },
          { description: ILike(`%${pageOptionsDto.search}%`) },
        ]
      : {};

    const [products, total] = await this.productRepository.findAndCount({
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        created_at: true,
      },
      take: take,
      skip: skip,
      where: where,
      order: { created_at: 'DESC' },
    });

    const meta = new PageMetaDto({
      itemsPerPage: products.length,
      total: total,
      pageOptionsDto,
    });

    return { meta, products };
  }

  async getProductById(id: number): Promise<Product> {
    const where = { id };

    const product = await this.productRepository.findOne({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        created_at: true,
      },
      where: where,
    });
    if (!product) {
      throw new NotFoundException({ message: 'Product is not found' });
    }

    return product;
  }

  async editProduct(id: number, productToEdit: EditDto, user_id: string): Promise<void> {
    const { name, description, price, stock } = productToEdit;
    const where = { id: id };
    const product = await this.productRepository.findOne({
      where: where,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
      },
    });
    if (!product) {
      throw new NotFoundException({ message: 'Product is not found' });
    }

    await this.productRepository.update({
      where: { id: id },
      data: {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        stock: stock || product.stock,
      },
    });

    const changes = this.getChanges(product, productToEdit);
    if (changes) {
      await this.loggingService.createLog({
        title: 'Edited product',
        action: `Edited product with changes: ${changes}`,
        entity: 'Product',
        user_id: user_id,
        user_type: AuthTypeEnum.ADMIN,
      });
    }
  }

  async deleteProduct(id: number, user_id: string): Promise<void> {
    const where = { id };

    const product = await this.productRepository.isExist(where);
    if (!product) {
      throw new NotFoundException({ message: 'Product is not found' });
    }

    await this.productRepository.softDelete(id);
    await this.loggingService.createLog({
      title: 'Deleted product',
      action: `Deleted product with ID: ${id}`,
      entity: 'Product',
      user_id: user_id,
      user_type: AuthTypeEnum.ADMIN,
    });
  }

  private getChanges(original: Product, updated: EditDto): string {
    const changes: string[] = [];

    if (updated.name && original.name !== updated.name) {
      changes.push(`name changed from "${original.name}" to "${updated.name}"`);
    }
    if (updated.description && original.description !== updated.description) {
      changes.push(`description changed from "${original.description}" to "${updated.description}"`);
    }
    if (updated.price && original.price !== updated.price) {
      changes.push(`price changed from "${original.price}" to "${updated.price}"`);
    }
    if (updated.stock && original.stock !== updated.stock) {
      changes.push(`stock changed from "${original.stock}" to "${updated.stock}"`);
    }

    return changes.join(', ');
  }
}
