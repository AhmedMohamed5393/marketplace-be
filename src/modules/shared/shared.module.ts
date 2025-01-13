import { dataSourceOptions } from '../../../db/database.config';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JWTAuthService } from './services/jwt-auth.service';
import { PasswordService } from './services/password.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Product } from './entities/product.entity';
import { ProductRepository } from './repositories/product.repository';
import { Log } from "@shared/entities/log.entity";
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        const expiresIn = configService.get<string>('JWT_EXPIRE_IN');
        return {
          secret: jwtSecret,
          signOptions: { expiresIn },
        };
      },
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([Product, User, Log]),
  ],
  exports: [
    JWTAuthService,
    PasswordService,
    ProductRepository,
    UserRepository,
  ],
  providers: [
    JWTAuthService,
    JwtService,
    PasswordService,
    ProductRepository,
    UserRepository,
  ],
})
export class SharedModule {}
