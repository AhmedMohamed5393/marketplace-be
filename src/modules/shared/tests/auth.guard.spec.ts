import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '../guards/index.guard';
import { JWTAuthService } from '@shared/services/jwt-auth.service';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let jwtAuthService: JWTAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JWTAuthService,
          useValue: {
            verifyToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    jwtAuthService = module.get<JWTAuthService>(JWTAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockRequest = { headers: {} };

    const mockContext = { switchToHttp: () => ({ getRequest: () => mockRequest }) } as ExecutionContext;

    it('should throw UnauthorizedException if no authorization header is present', async () => {
      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException({ message: 'UNAUTHENTICATED' }),
      );
    });

    it('should throw UnauthorizedException if authorization header does not start with Bearer', async () => {
      mockRequest.headers['authorization'] = 'InvalidToken';

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException({ message: 'UNAUTHENTICATED' }),
      );
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluLmFwcEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpZCI6IjIiLCJpYXQiOjE3MzY4MTIzOTgsImV4cCI6MTAwMDAwMjg0NzkyMzUwOX0.YNXQgOYx_qIdonlkv0n_M3uhkmisq0R55aGZJmvBVyY";
      mockRequest.headers['authorization'] = `Bearer ${expiredToken}`;

      jest.spyOn(jwtAuthService, 'verifyToken').mockRejectedValue(new Error('jwt expired'));
      
      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException({ message: 'TOKEN_EXPIRED_ERROR' }),
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      mockRequest.headers['authorization'] = 'Bearer invalidToken';

      jest.spyOn(jwtAuthService, 'verifyToken').mockRejectedValue(new Error('invalid token'));

      await expect(authGuard.canActivate(mockContext)).rejects.toThrow(
        new UnauthorizedException({ message: 'UNAUTHENTICATED' }),
      );
    });

    it('should return true and attach user to request if token is valid', async () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluLmFwcEBnbWFpbC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpZCI6IjIiLCJpYXQiOjE3MzY4MTIzOTgsImV4cCI6MTAwMDAwMjg0NzkyMzUwOX0.YNXQgOYx_qIdonlkv0n_M3uhkmisq0R55aGZJmvBVyY';
      const mockUser = { id: 1, email: 'test@example.com', role: 'user' };

      mockRequest.headers['authorization'] = `Bearer ${validToken}`;

      jest.spyOn(jwtAuthService, 'verifyToken').mockResolvedValue(mockUser);

      const result = await authGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(mockRequest['user']).toEqual({
        ...mockUser,
        token: validToken,
        authorization: `Bearer ${validToken}`,
      });
    });
  });
});
