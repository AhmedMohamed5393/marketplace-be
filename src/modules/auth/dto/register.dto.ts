import { ApiProperty } from '@nestjs/swagger';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: AuthTypeEnum.USER,
    description: 'The role of the user',
    required: true,
    enum: AuthTypeEnum,
    default: AuthTypeEnum.USER,
  })
  @IsOptional()
  @IsEnum(AuthTypeEnum)
  role: string;

  @ApiProperty({
    example: 'ahmedmohamedalex93@gmail.com',
    description: 'The email of the user',
    required: true,
  })
  @IsNotEmpty({ message: 'email_IS_REQUIRED' })
  @IsEmail({}, { message: 'email_IS_INVALID' })
  email: string;

  @ApiProperty({
    example: 'Hamada_5393',
    description: 'The password of the user',
    required: true,
  })
  @IsNotEmpty({ message: 'password_IS_REQUIRED' })
  @Matches(/^[\w!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,16}$/, { message: 'password_IS_INVALID' })
  password: string;
}
