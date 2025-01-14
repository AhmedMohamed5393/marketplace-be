import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserRepository } from '@shared/repositories/user.repository';
import { PasswordService } from '@shared/services/password.service';
import { JWTAuthService } from '@shared/services/jwt-auth.service';
import { User } from '@shared/entities/user.entity';
import { RegisterDto, LoginDto } from '../dto/index.dto';

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: UserRepository;
    let passwordService: PasswordService;
    let jwtAuthService: JWTAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [
            AuthService,
            {
            provide: UserRepository,
            useValue: {
                isExist: jest.fn(),
                save: jest.fn(),
                findOne: jest.fn(),
            },
            },
            {
            provide: PasswordService,
            useValue: {
                hashPassword: jest.fn(),
                compareHash: jest.fn(),
            },
            },
            {
            provide: JWTAuthService,
            useValue: {
                generateToken: jest.fn(),
            },
            },
        ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userRepository = module.get<UserRepository>(UserRepository);
        passwordService = module.get<PasswordService>(PasswordService);
        jwtAuthService = module.get<JWTAuthService>(JWTAuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const registerDto: RegisterDto = {
                email: 'test@example.com',
                password: 'Password123!',
                role: 'user',
            };
            
            const hashedPassword = 'hashedPassword123';
            const newUser = {
              id: 1,
              email: registerDto.email,
              role: registerDto.role,
              password: hashedPassword,
            } as User;

            const userToCreate = {
              email: registerDto.email,
              role: registerDto.role,
              password: hashedPassword,
            } as User;
            
            const token = 'generatedToken';
            
            jest.spyOn(userRepository, 'isExist').mockResolvedValue(false);
            jest.spyOn(passwordService, 'hashPassword').mockResolvedValue(hashedPassword);
            jest.spyOn(userRepository, 'save').mockResolvedValue(newUser);
            jest.spyOn(jwtAuthService, 'generateToken').mockResolvedValue(token);
            
            const result = await authService.register(registerDto);
            
            expect(userRepository.isExist).toHaveBeenCalledWith({ email: registerDto.email });
            expect(passwordService.hashPassword).toHaveBeenCalledWith(registerDto.password);
            expect(userRepository.save).toHaveBeenCalledWith(userToCreate);

            expect(jwtAuthService.generateToken).toHaveBeenCalledWith({
                email: newUser.email,
                role: newUser.role,
                id: newUser.id.toString(),
            });
            expect(result).toEqual({
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
                token,
            });
        });

        it('should throw UnprocessableEntityException if email already exists', async () => {
            const registerDto: RegisterDto = {
              email: 'test@example.com',
              password: 'Password123!',
              role: 'user',
            };
          
            jest.spyOn(userRepository, 'isExist').mockResolvedValue(true);
          
            await expect(authService.register(registerDto)).rejects.toThrow(UnprocessableEntityException);
        });
    });

    describe('login', () => {
        it('should login a user successfully', async () => {
            const loginDto: LoginDto = {
              email: 'test@example.com',
              password: 'Password123!',
            };
          
            const user = {
              id: 1,
              email: loginDto.email,
              password: 'hashedPassword123',
              role: 'user',
            } as User;
          
            const token = 'generatedToken';
          
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(passwordService, 'compareHash').mockResolvedValue(true);
            jest.spyOn(jwtAuthService, 'generateToken').mockResolvedValue(token);
          
            const result = await authService.login(loginDto);
          
            expect(userRepository.findOne).toHaveBeenCalledWith({
              where: { email: loginDto.email },
              select: { id: true, email: true, password: true, role: true },
            });
            expect(passwordService.compareHash).toHaveBeenCalledWith(loginDto.password, user.password);
            expect(jwtAuthService.generateToken).toHaveBeenCalledWith({
              email: user.email,
              role: user.role,
              id: user.id.toString(),
            });
            expect(result).toEqual({
              id: user.id,
              email: user.email,
              role: user.role,
              token,
            });
        });

        it('should throw UnauthorizedException if user is not found', async () => {
            const loginDto: LoginDto = {
              email: 'test@example.com',
              password: 'Password123!',
            };
          
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
          
            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if password is incorrect', async () => {
            const loginDto: LoginDto = {
              email: 'test@example.com',
              password: 'WrongPassword123!',
            };
          
            const user = {
              id: 1,
              email: loginDto.email,
              password: 'hashedPassword123',
              role: 'user',
            } as User;
          
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
            jest.spyOn(passwordService, 'compareHash').mockResolvedValue(false);
          
            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
