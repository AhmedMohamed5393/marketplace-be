import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { extractTokenFromHeader } from '@shared/helpers/methods';
import { JWTAuthService } from '@shared/services/jwt-auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtAuthService: JWTAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization: string = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException({ message: 'UNAUTHENTICATED' });
    }

    if (!authorization.startsWith('Bearer')) {
      throw new UnauthorizedException({ message: 'UNAUTHENTICATED' });
    }

    try {
      const token = extractTokenFromHeader(authorization);

      const result = await this.jwtAuthService.verifyToken(token);

      request.user = { ...result, token, authorization };
      return true;
    } catch (err) {
      if (err.message === 'jwt expired') {
        throw new UnauthorizedException({ message: 'TOKEN_EXPIRED_ERROR' });
      }
      throw new UnauthorizedException({ message: 'UNAUTHENTICATED' });
    }
  }
}
