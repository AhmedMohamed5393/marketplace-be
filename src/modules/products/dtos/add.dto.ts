import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class AddDto {
  @ApiProperty({
    example: 'Samsung Galaxy Note 10',
    description: 'The name of the product',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Product Description',
    description: 'The description of the product',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 750,
    description: 'The price of the product',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    example: 20,
    description: 'The stock (quantity) of the product',
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  stock: number;
}
