import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Param,
  UseGuards,
  UseInterceptors,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SuccessClass } from '@shared/classes/success.class';
import { ProductService } from './product.service';
import { PageOptionsDto } from '@shared/pagination/pageOption.dto';
import { EditDto, AddDto } from './dtos/index.dto';
import { AuthenticatedUser } from '@shared/decorators/index.decorator';
import { Roles } from '@shared/decorators/index.decorator';
import { AuthGuard, RolesGuard } from '@shared/guards/index.guard';
import { AuthTypeEnum } from '@shared/enums/index.enum';

const { ADMIN } = AuthTypeEnum;

@ApiTags('products') // Group endpoints under 'products' in Swagger UI
@ApiBearerAuth('access-token') // Add Bearer Auth to all endpoints
@UseInterceptors(ClassSerializerInterceptor)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ADMIN)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiResponse({ status: 201, description: 'Product is created successfully' })
  @ApiBody({ type: AddDto })
  @Post('/')
  async addProduct(
    @Body() newProduct: AddDto,
    @AuthenticatedUser('id') user_id: string,
  ): Promise<SuccessClass> {
    const data = await this.productService.saveNewProduct(newProduct, user_id);
    return new SuccessClass(data, 'product is created successfully');
  }

  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of products retrieved successfully' })
  @ApiQuery({ type: PageOptionsDto })
  @Get('/')
  async getProducts(@Query() pageOptionsDto: PageOptionsDto): Promise<SuccessClass> {
    const products = await this.productService.getProducts(pageOptionsDto);
    return new SuccessClass(products);
  }

  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @Get('/:id')
  async getProductById(@Param('id', ParseIntPipe) id: number): Promise<SuccessClass> {
    const product = await this.productService.getProductById(id);
    return new SuccessClass(product);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ADMIN)
  @ApiOperation({ summary: 'Update a product by ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiResponse({ status: 200, description: 'Product is updated successfully' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiBody({ type: EditDto })
  @Put('/:id')
  async editProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() productToEdit: EditDto,
    @AuthenticatedUser('id') user_id: string,
  ): Promise<SuccessClass> {
    await this.productService.editProduct(id, productToEdit, user_id);
    return new SuccessClass({ id }, 'product is updated successfully');
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(ADMIN)
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden resource' })
  @ApiResponse({ status: 200, description: 'Product is deleted successfully' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @Delete('/:id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @AuthenticatedUser('id') user_id: string,
  ): Promise<SuccessClass> {
    await this.productService.deleteProduct(id, user_id);
    return new SuccessClass({}, 'product is deleted successfully');
  }
}
