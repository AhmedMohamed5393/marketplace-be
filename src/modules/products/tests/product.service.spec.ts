import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductRepository } from '@shared/repositories/product.repository';
import { Product } from '@shared/entities/product.entity';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import { AddDto, EditDto } from '../dtos/index.dto';
import { ProductService } from '../product.service';
import { LoggingService } from '../../logging/logging.service';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: ProductRepository;
  let loggingService: LoggingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useValue: {
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            isExist: jest.fn(),
          },
        },
        {
          provide: LoggingService,
          useValue: {
            createLog: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productRepository = module.get<ProductRepository>(ProductRepository);
    loggingService = module.get<LoggingService>(LoggingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(productService).toBeDefined();
  });

  describe('saveNewProduct', () => {
    it('should save a new product and create a log', async () => {
      const addDto: AddDto = {
        name: 'Samsung Galaxy Note 10',
        description: 'A great phone',
        price: 750,
        stock: 20,
      };

      const userId = 'user123';
      const savedProduct = {
        id: 1,
        ...addDto,
        created_at: new Date(),
      } as Product;

      jest.spyOn(productRepository, 'save').mockResolvedValue(savedProduct);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      const result = await productService.saveNewProduct(addDto, userId);

      expect(productRepository.save).toHaveBeenCalledWith(expect.any(Product));
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Added new product',
        action: `Added new product with title "${addDto.name}"`,
        entity: 'Product',
        user_id: userId,
        user_type: AuthTypeEnum.ADMIN,
      });
      expect(result).toEqual(savedProduct);
    });
  });

  describe('getProducts', () => {
    it('should return a paginated list of products', async () => {
      const pageOptionsDto = {
        page: 1,
        take: 10,
        search: 'Samsung',
      } as PageOptionsDto;

      const products = [
        {
          id: 1,
          name: 'Samsung Galaxy Note 10',
          price: 750,
          stock: 20,
          created_at: new Date(),
        },
      ] as Product[];

      const total = 1;
      const meta = new PageMetaDto({
        itemsPerPage: products.length,
        total,
        pageOptionsDto,
      });

      jest.spyOn(productRepository, 'findAndCount').mockResolvedValue([products, total]);

      const result = await productService.getProducts(pageOptionsDto);

      expect(productRepository.findAndCount).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          created_at: true,
        },
        take: pageOptionsDto.take,
        skip: 0,
        where: [
          { name: expect.any(Object) },
          { description: expect.any(Object) },
        ],
        order: { created_at: 'DESC' },
      });
      expect(result).toEqual({ meta, products });
    });
  });

  describe('getProductById', () => {
    it('should return a product by ID', async () => {
      const productId = 1;
      const product = {
        id: productId,
        name: 'Samsung Galaxy Note 10',
        description: 'A great phone',
        price: 750,
        stock: 20,
        created_at: new Date(),
      } as Product;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(product);

      const result = await productService.getProductById(productId);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
          created_at: true,
        },
        where: { id: productId },
      });
      expect(result).toEqual(product);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 1;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(productService.getProductById(productId)).rejects.toThrow(
        new NotFoundException({ message: 'Product is not found' }),
      );
    });
  });

  describe('editProduct', () => {
    it('should update a product and create a log', async () => {
      const productId = 1;
      const userId = 'user123';
      const editDto: EditDto = {
        name: 'Samsung Galaxy Note 20',
      };

      const originalProduct = {
        id: productId,
        name: 'Samsung Galaxy Note 10',
        description: 'A great phone',
        price: 750,
        stock: 20,
      } as Product;

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(originalProduct);
      jest.spyOn(productRepository, 'update').mockResolvedValue(undefined);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      await productService.editProduct(productId, editDto, userId);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          stock: true,
        },
      });
      expect(productRepository.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: {
          name: editDto.name || originalProduct.name,
          description: editDto.description || originalProduct.description,
          price: editDto.price || originalProduct.price,
          stock: editDto.stock || originalProduct.stock,
        },
      });
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Edited product',
        action: `Edited product with changes: name changed from "${originalProduct.name}" to "${editDto.name}"`,
        entity: 'Product',
        user_id: userId,
        user_type: AuthTypeEnum.ADMIN,
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 1;
      const userId = 'user123';
      const editDto: EditDto = {
        name: 'Samsung Galaxy Note 20',
      };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(productService.editProduct(productId, editDto, userId)).rejects.toThrow(
        new NotFoundException({ message: 'Product is not found' }),
      );
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product and create a log', async () => {
      const productId = 1;
      const userId = 'user123';

      jest.spyOn(productRepository, 'isExist').mockResolvedValue(true);
      jest.spyOn(productRepository, 'softDelete').mockResolvedValue(undefined);
      jest.spyOn(loggingService, 'createLog').mockResolvedValue(undefined);

      await productService.deleteProduct(productId, userId);

      expect(productRepository.isExist).toHaveBeenCalledWith({ id: productId });
      expect(productRepository.softDelete).toHaveBeenCalledWith(productId);
      expect(loggingService.createLog).toHaveBeenCalledWith({
        title: 'Deleted product',
        action: `Deleted product with ID: ${productId}`,
        entity: 'Product',
        user_id: userId,
        user_type: AuthTypeEnum.ADMIN,
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      const productId = 1;
      const userId = 'user123';

      jest.spyOn(productRepository, 'isExist').mockResolvedValue(false);

      await expect(productService.deleteProduct(productId, userId)).rejects.toThrow(
        new NotFoundException({ message: 'Product is not found' }),
      );
    });
  });
});
