import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from '../../generated/prisma';
import { truncateDescription } from './product.helper';

type InputData = {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  productCategory: string;
  productType: string;
};

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<Product> {
    const product = await this.productService.product({ id });

    if (!product) {
      throw new NotFoundException(`Products with ID ${id} not found`);
    }

    return product;
  }

  @Post()
  async createProduct(@Body() data: InputData): Promise<Product> {
    const shortDescription = truncateDescription(data.description);
    return this.productService.createProduct({
      name: data.name,
      descriptionLong: data.description,
      descriptionShort: shortDescription,
      price: data.price,
      productCategory: data.productCategory,
      productType: data.productType,
    });
  }

  @Put('product/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() data: Partial<InputData>,
  ): Promise<Product> {
    return this.productService.updateProduct({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string): Promise<Product> {
    return this.productService.deleteProduct({ id });
  }
}
