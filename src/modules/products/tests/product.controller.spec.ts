import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';
import { SuccessClass } from '@shared/classes/success.class';
import { AddDto, EditDto } from '../dtos/index.dto';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { AuthGuard, RolesGuard } from '@shared/guards/index.guard';
import { AuthTypeEnum } from '@shared/enums/index.enum';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Product } from '@shared/entities/product.entity';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  const mockAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 'user123', role: AuthTypeEnum.ADMIN }; // Simulate authenticated user
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: (context: ExecutionContext) => {
      const requiredRoles = [AuthTypeEnum.ADMIN]; // Simulate required roles
      const req = context.switchToHttp().getRequest();
      if (!requiredRoles.includes(req.user.role)) {
        throw new ForbiddenException('Forbidden resource');
      }
      return true;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            saveNewProduct: jest.fn(),
            getProducts: jest.fn(),
            getProductById: jest.fn(),
            editProduct: jest.fn(),
            deleteProduct: jest.fn(),
          },
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(productController).toBeDefined();
  });

  describe('addProduct', () => {
    it('should create a new product and return a success response', async () => {
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

      jest.spyOn(productService, 'saveNewProduct').mockResolvedValue(savedProduct);

      const result = await productController.addProduct(addDto, userId);

      expect(productService.saveNewProduct).toHaveBeenCalledWith(addDto, userId);
      expect(result).toEqual(
        new SuccessClass(savedProduct, 'product is created successfully'),
      );
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

      const meta = {
        itemsPerPage: products.length,
        total: 1,
        pageOptionsDto,
      } as unknown as PageMetaDto;

      jest.spyOn(productService, 'getProducts').mockResolvedValue({ meta, products });

      const result = await productController.getProducts(pageOptionsDto);

      expect(productService.getProducts).toHaveBeenCalledWith(pageOptionsDto);
      expect(result).toEqual(new SuccessClass({ meta, products }));
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

      jest.spyOn(productService, 'getProductById').mockResolvedValue(product);

      const result = await productController.getProductById(productId);

      expect(productService.getProductById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(new SuccessClass(product));
    });
  });

  describe('editProduct', () => {
    it('should update a product and return a success response', async () => {
      const productId = 1;
      const userId = 'user123';
      const editDto: EditDto = {
        name: 'Samsung Galaxy Note 20',
      };

      jest.spyOn(productService, 'editProduct').mockResolvedValue(undefined);

      const result = await productController.editProduct(productId, editDto, userId);

      expect(productService.editProduct).toHaveBeenCalledWith(productId, editDto, userId);
      expect(result).toEqual(
        new SuccessClass({ id: productId }, 'product is updated successfully'),
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return a success response', async () => {
      const productId = 1;
      const userId = 'user123';

      jest.spyOn(productService, 'deleteProduct').mockResolvedValue(undefined);

      const result = await productController.deleteProduct(productId, userId);

      expect(productService.deleteProduct).toHaveBeenCalledWith(productId, userId);
      expect(result).toEqual(new SuccessClass({}, 'product is deleted successfully'));
    });
  });
});
