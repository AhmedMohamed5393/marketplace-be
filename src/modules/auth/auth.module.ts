import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from '@shared/repositories/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository]), LoggingModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
