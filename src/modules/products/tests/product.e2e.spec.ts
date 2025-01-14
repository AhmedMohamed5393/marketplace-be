import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, INestApplication, NotFoundException } from '@nestjs/common';
import * as request from 'supertest';
import { ProductController } from '../product.controller';
import { ProductService } from '../product.service';
import { AddDto, EditDto } from '../dtos/index.dto';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { AuthGuard, RolesGuard } from '@shared/guards/index.guard';
import { AuthTypeEnum } from '@shared/enums/index.enum';
import { Reflector } from '@nestjs/core';
import { SuccessClass } from '@shared/classes/success.class';
import { Product } from '@shared/entities/product.entity';
import { PageMetaDto } from '@shared/pagination/page-meta.dto';

describe('ProductController (e2e)', () => {
  let app: INestApplication;
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

    app = module.createNestApplication();
    await app.init();

    productService = module.get<ProductService>(ProductService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /products', () => {
    it('should create a new product and return a success response', async () => {
      const addDto: AddDto = {
        name: 'Samsung Galaxy Note 10',
        description: 'A great phone',
        price: 750,
        stock: 20,
      };

      const savedProduct = {
        id: 1,
        ...addDto,
        created_at: new Date().toISOString(),
      } as any;

      jest.spyOn(productService, 'saveNewProduct').mockResolvedValue(savedProduct);

      const response = await request(app.getHttpServer())
        .post('/products')
        .send(addDto)
        .expect(201);

      expect(response.body).toEqual(
        new SuccessClass(savedProduct, 'product is created successfully'),
      );
    });
  });

  describe('GET /products', () => {
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
          created_at: new Date().toISOString(),
        },
      ] as any[];

      const meta = {
        itemsPerPage: products.length,
        total: 1,
        pageOptionsDto,
      } as unknown as PageMetaDto;

      jest.spyOn(productService, 'getProducts').mockResolvedValue({ meta, products });

      const response = await request(app.getHttpServer())
        .get('/products')
        .query(pageOptionsDto)
        .expect(200);

      expect(response.body).toEqual(new SuccessClass({ meta, products }));
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by ID', async () => {
      const productId = 1;
      const product = {
        id: productId,
        name: 'Samsung Galaxy Note 10',
        description: 'A great phone',
        price: 750,
        stock: 20,
        created_at: new Date().toISOString(),
      } as any;

      jest.spyOn(productService, 'getProductById').mockResolvedValue(product);

      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(response.body).toEqual(new SuccessClass(product));
    });

    it('should return 404 if product is not found', async () => {
      const productId = 1;

      jest.spyOn(productService, 'getProductById').mockImplementationOnce(() => {
        throw new NotFoundException('Product is not found');
      });

      const response = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(404);

      expect(response.body.message).toBe('Product is not found');
    });
  });

  describe('PUT /products/:id', () => {
    it('should update a product and return a success response', async () => {
      const productId = 1;
      const editDto: EditDto = {
        name: 'Samsung Galaxy Note 20',
      };

      jest.spyOn(productService, 'editProduct').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .send(editDto)
        .expect(200);

      expect(response.body).toEqual(
        new SuccessClass({ id: productId }, 'product is updated successfully'),
      );
    });

    it('should return 404 if product is not found', async () => {
      const productId = 1;
      const editDto: EditDto = {
        name: 'Samsung Galaxy Note 20',
      };

      jest.spyOn(productService, 'editProduct').mockRejectedValue(new NotFoundException('Product is not found'));

      const response = await request(app.getHttpServer())
        .put(`/products/${productId}`)
        .send(editDto)
        .expect(404);

      expect(response.body.message).toBe('Product is not found');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete a product and return a success response', async () => {
      const productId = 1;

      jest.spyOn(productService, 'deleteProduct').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(200);

      expect(response.body).toEqual(
        new SuccessClass({}, 'product is deleted successfully'),
      );
    });

    it('should return 404 if product is not found', async () => {
      const productId = 1;

      jest.spyOn(productService, 'deleteProduct').mockRejectedValue(new NotFoundException('Product is not found'));

      const response = await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .expect(404);

      expect(response.body.message).toBe('Product is not found');
    });
  });
});
