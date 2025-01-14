import { Test, TestingModule } from '@nestjs/testing';
import {
    ExecutionContext,
    ForbiddenException,
    INestApplication,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import * as request from 'supertest';
import { Reflector } from '@nestjs/core';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import { AuthGuard } from '@shared/guards/auth.guard';
import { RolesGuard } from '@shared/guards/roles.guard';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        Reflector,
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 1, role: AuthTypeEnum.USER, email: 'test@example.com' }; // Simulate authenticated user
          return true;
        },
      })
      .overrideGuard(RolesGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const requiredRoles = [AuthTypeEnum.USER]; // Simulate required roles
          const req = context.switchToHttp().getRequest();
          if (!requiredRoles.includes(req.user.role)) {
            throw new ForbiddenException('Forbidden resource');
          }
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should register a new user and return a success response', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        role: AuthTypeEnum.USER,
      };

      const mockResponse = {
        id: 1,
        email: registerDto.email,
        role: registerDto.role,
        token: 'generatedToken',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(registerDto)
        .expect(201);

      expect(response.body).toEqual({
        data: mockResponse,
        message: 'user is registered successfully',
        status: true,
      });
    });

    it('should return 422 if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        role: AuthTypeEnum.USER,
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new UnprocessableEntityException('already exists'));

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(registerDto)
        .expect(422);

      expect(response.body.message).toBe('already exists');
    });
  });

  describe('POST /auth/login', () => {
    it('should login a user and return a success response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockResponse = {
        id: 1,
        email: loginDto.email,
        role: AuthTypeEnum.USER,
        token: 'generatedToken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body).toEqual({
        data: mockResponse,
        message: 'user is logged in successfully',
        status: true,
      });
    });

    it('should return 401 if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('wrong credentials'));

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);

      expect(response.body.message).toBe('wrong credentials');
    });
  });
});
