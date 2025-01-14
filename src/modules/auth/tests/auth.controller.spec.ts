import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { RegisterDto, LoginDto } from '../dto/index.dto';
import { SuccessClass } from '@shared/classes/success.class';
import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should register a new user and return a success response', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'user',
      };

      const mockResponse = {
        id: 1,
        email: registerDto.email,
        role: registerDto.role,
        token: 'generatedToken',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockResponse);

      const result = await authController.signup(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toBeInstanceOf(SuccessClass);
      expect(result.message).toBe('user is registered successfully');
      expect(result.data).toEqual(mockResponse);
    });

    it('should throw UnprocessableEntityException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        role: 'user',
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new UnprocessableEntityException('already exists'));

      await expect(authController.signup(registerDto)).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('login', () => {
    it('should login a user and return a success response', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const mockResponse = {
        id: 1,
        email: loginDto.email,
        role: 'user',
        token: 'generatedToken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockResponse);

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toBeInstanceOf(SuccessClass);
      expect(result.message).toBe('user is logged in successfully');
      expect(result.data).toEqual(mockResponse);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new UnauthorizedException('wrong credentials'));

      await expect(authController.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
