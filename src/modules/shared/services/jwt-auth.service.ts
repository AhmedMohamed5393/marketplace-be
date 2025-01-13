import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserPayloadInterface } from 'src/modules/auth/interfaces/user-payload.interface';

@Injectable()
export class JWTAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: UserPayloadInterface): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRE_IN,
    });
  }

  async verifyToken(token: string): Promise<any> {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });
  }
}
