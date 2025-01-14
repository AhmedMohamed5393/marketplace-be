import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../guards/index.guard';
import { Reflector } from '@nestjs/core';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import { ROLES_KEY } from '@shared/decorators/roles.decorator';

describe('RolesGuard', () => {
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    rolesGuard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(rolesGuard).toBeDefined();
  });

  describe('canActivate', () => {
    const mockRequest = {
      user: {
        role: AuthTypeEnum.USER, // Default user role
      },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest, // Return the same request object every time
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    it('should allow access if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should allow access if user has the required role', () => {
      const requiredRoles = [AuthTypeEnum.USER, AuthTypeEnum.ADMIN];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      const result = rolesGuard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });

    it('should throw ForbiddenException if user does not have the required role', () => {
      const requiredRoles = [AuthTypeEnum.ADMIN]; // User role is USER, which is not in the required roles
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

      expect(() => rolesGuard.canActivate(mockContext)).toThrow(
        new ForbiddenException('Forbidden resource'),
      );
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });
});
