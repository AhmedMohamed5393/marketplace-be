import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/index.dto';
import { PasswordService } from '@shared/services/password.service';
import { JWTAuthService } from '@shared/services/jwt-auth.service';
import { UserRepository } from '@shared/repositories/user.repository';
import { User } from '@shared/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtAuthService: JWTAuthService,
  ) {}

  public async register(registerDto: RegisterDto): Promise<any> {
    // check the existence of another user with this email
    const is_exist = await this.userRepository.isExist({ email: registerDto.email });
    if (is_exist) {
      throw new UnprocessableEntityException('already exists');
    }

    // if not exists then hash the user password during the registration
    const password = await this.passwordService.hashPassword(registerDto.password);

    // create the user
    const newUser = new User();
    newUser.email = registerDto.email;
    newUser.role = registerDto.role;
    newUser.password = password;
    const user = await this.userRepository.save(newUser);

    // generate jwt for registered user
    return await this.getEssentialResponse(user);
  }

  public async login(loginDto: LoginDto): Promise<any> {
    // check existence of user by given email and password
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      select: { id: true, email: true, password: true, role: true },
    });
    
    const unauthorizedExceptionInstance = new UnauthorizedException('wrong credentials');
    if (!user) {
      throw unauthorizedExceptionInstance;
    }
    const isMatched = await this.passwordService.compareHash(loginDto.password, user.password);
    if (!isMatched) {
      throw unauthorizedExceptionInstance;
    }

    // generate jwt for logging in
    return await this.getEssentialResponse(user);
  }

  private async getEssentialResponse(user: Partial<User>) {
    const { id, role, email } = user;
    const token = await this.jwtAuthService.generateToken({
      email: email,
      role: role,
      id: id?.toString(),
    });

    return { id, email, role, token };
  }
} 
