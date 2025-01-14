import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SuccessClass } from '@shared/classes/success.class';
import { LoginDto, RegisterDto } from './dto/index.dto';
import { AuthService } from './auth.service';
import { loginUserResponse, registerUserResponse } from '@shared/constants/users-examples.constant';

@ApiTags('auth')
@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' }) // Description of the endpoint
  @ApiResponse({
    status: 201,
    description: 'user is registered successfully',
    example: registerUserResponse,
  })
  @ApiBody({ type: RegisterDto }) // Specify the request body type
  @Post('signup')
  async signup(@Body() registerDto: RegisterDto): Promise<SuccessClass> {
    const data = await this.authService.register(registerDto);
    return new SuccessClass(data, 'user is registered successfully');
  }

  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({
    status: 201,
    description: 'user is logged in successfully',
    example: loginUserResponse,
  })
  @ApiBody({ type: LoginDto }) // Use the alias here
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<SuccessClass> {
    const data = await this.authService.login(loginDto);
    return new SuccessClass(data, 'user is logged in successfully');
  }
}
