import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from './prisma.service';
import { Product } from '../../generated/prisma';

describe('ProductService (Real Database Integration)', () => {
  let service: ProductService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, PrismaService],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);

    // Verify database connection
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await prisma.product.deleteMany({});
  });

  afterAll(async () => {
    // Clean up after all tests
    await prisma.product.deleteMany({});
    await prisma.$disconnect();
  });

  describe('product', () => {
    it('should return a product when it exists', async () => {
      // Arrange
      const productData = {
        name: 'Test Product',
        price: 99.99,
        productType: 'Electronics',
        productCategory: 'Gadgets',
        descriptionShort: 'A great test product',
        descriptionLong:
          'This is a comprehensive description of our test product with all its features.',
      };

      const createdProduct = await prisma.product.create({
        data: productData,
      });

      // Act
      const result = await service.product({ id: createdProduct.id });

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdProduct.id);
      expect(result?.name).toBe(productData.name);
      expect(result?.price).toEqual(productData.price);
      expect(result?.productType).toBe(productData.productType);
      expect(result?.productCategory).toBe(productData.productCategory);
      expect(result?.descriptionShort).toBe(productData.descriptionShort);
      expect(result?.descriptionLong).toBe(productData.descriptionLong);
    });

    it('should return null when product does not exist', async () => {
      // Act
      const result = await service.product({
        id: '00000000-0000-0000-0000-000000000000',
      });

      // Assert
      expect(result).toBeNull();
    });

    it('should find product by unique id', async () => {
      // Arrange
      const productData = {
        name: 'Unique Product',
        price: 149.99,
        productType: 'Books',
        productCategory: 'Fiction',
        descriptionShort: 'An interesting book',
      };

      const createdProduct = await prisma.product.create({
        data: productData,
      });

      // Act
      const result = await service.product({ id: createdProduct.id });

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(createdProduct.id);
      expect(result?.name).toBe(productData.name);
    });
  });

  describe('createProduct', () => {
    it('should create a new product successfully with all fields', async () => {
      // Arrange
      const productData = {
        name: 'New Product',
        price: 199.99,
        productType: 'Clothing',
        productCategory: 'Apparel',
        descriptionShort: 'Stylish new clothing item',
        descriptionLong:
          'This is a detailed description of our new clothing product with material information and care instructions.',
      };

      // Act
      const result = await service.createProduct(productData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(productData.name);
      expect(result.price).toEqual(productData.price);
      expect(result.productType).toBe(productData.productType);
      expect(result.productCategory).toBe(productData.productCategory);
      expect(result.descriptionShort).toBe(productData.descriptionShort);
      expect(result.descriptionLong).toBe(productData.descriptionLong);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);

      // Verify it was actually saved in the database
      const savedProduct = await prisma.product.findUnique({
        where: { id: result.id },
      });
      expect(savedProduct).toBeDefined();
      expect(savedProduct?.name).toBe(productData.name);
    });

    it('should create product with minimal required fields', async () => {
      // Arrange
      const minimalProductData = {
        name: 'Minimal Product',
        price: 9.99,
        productType: 'Other',
        productCategory: 'Miscellaneous',
      };

      // Act
      const result = await service.createProduct(minimalProductData);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(minimalProductData.name);
      expect(result.price).toEqual(minimalProductData.price);
      expect(result.productType).toBe(minimalProductData.productType);
      expect(result.productCategory).toBe(minimalProductData.productCategory);
      expect(result.descriptionShort).toBeNull();
      expect(result.descriptionLong).toBeNull();
    });

    it('should create multiple products with different data', async () => {
      // Arrange
      const products = [
        {
          name: 'Product 1',
          price: 10.0,
          productType: 'Electronics',
          productCategory: 'Accessories',
          descriptionShort: 'Electronic accessory',
        },
        {
          name: 'Product 2',
          price: 20.0,
          productType: 'Books',
          productCategory: 'Educational',
          descriptionShort: 'Educational book',
        },
        {
          name: 'Product 3',
          price: 30.0,
          productType: 'Toys',
          productCategory: 'Children',
          descriptionShort: 'Fun toy for kids',
        },
      ];

      // Act
      const results: Product[] = [];
      for (const productData of products) {
        const created = await service.createProduct(productData);
        results.push(created);
      }

      // Assert
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.name).toBe(products[index].name);
        expect(result.price).toEqual(products[index].price);
        expect(result.productType).toBe(products[index].productType);
        expect(result.productCategory).toBe(products[index].productCategory);
      });

      // Verify all products are in database
      const count = await prisma.product.count();
      expect(count).toBe(3);
    });

    it('should handle products with very long descriptions', async () => {
      // Arrange
      const longDescription = 'Lorem ipsum dolor sit amet, '.repeat(100);
      const productData = {
        name: 'Product with Long Description',
        price: 49.99,
        productType: 'Books',
        productCategory: 'Literature',
        descriptionShort: 'A book with extensive content',
        descriptionLong: longDescription,
      };

      // Act
      const result = await service.createProduct(productData);

      // Assert
      expect(result).toBeDefined();
      expect(result.descriptionLong).toBe(longDescription);
    });

    it('should handle decimal prices correctly', async () => {
      // Arrange
      const productData = {
        name: 'Precise Price Product',
        price: 19.97,
        productType: 'Electronics',
        productCategory: 'Components',
      };

      // Act
      const result = await service.createProduct(productData);

      // Assert
      expect(result.price).toEqual(19.97);

      // Verify from database
      const saved = await prisma.product.findUnique({
        where: { id: result.id },
      });
      expect(saved?.price).toEqual(19.97);
    });
  });

  describe('deleteProduct', () => {
    it('should delete an existing product by id', async () => {
      // Arrange
      const productData = {
        name: 'Product to Delete',
        price: 59.99,
        productType: 'Electronics',
        productCategory: 'Gadgets',
        descriptionShort: 'This will be deleted',
      };

      const createdProduct = await prisma.product.create({
        data: productData,
      });

      // Act
      const result = await service.deleteProduct({ id: createdProduct.id });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(createdProduct.id);
      expect(result.name).toBe(productData.name);

      // Verify it was actually deleted from database
      const deletedProduct = await prisma.product.findUnique({
        where: { id: createdProduct.id },
      });
      expect(deletedProduct).toBeNull();
    });

    it('should throw error when trying to delete non-existent product', async () => {
      // Act & Assert
      await expect(
        service.deleteProduct({ id: '00000000-0000-0000-0000-000000000000' }),
      ).rejects.toThrow();
    });

    it('should only delete the specified product', async () => {
      // Arrange
      const products = [
        {
          name: 'Keep Product 1',
          price: 10.0,
          productType: 'Type1',
          productCategory: 'Category1',
        },
        {
          name: 'Delete This',
          price: 20.0,
          productType: 'Type2',
          productCategory: 'Category2',
        },
        {
          name: 'Keep Product 2',
          price: 30.0,
          productType: 'Type3',
          productCategory: 'Category3',
        },
      ];

      const createdProducts: Product[] = [];
      for (const productData of products) {
        const created = await prisma.product.create({ data: productData });
        createdProducts.push(created);
      }

      // Act
      await service.deleteProduct({ id: createdProducts[1].id });

      // Assert
      const remainingProducts = await prisma.product.findMany({
        orderBy: { name: 'asc' },
      });

      expect(remainingProducts).toHaveLength(2);
      expect(remainingProducts[0].name).toBe('Keep Product 1');
      expect(remainingProducts[1].name).toBe('Keep Product 2');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete CRUD cycle', async () => {
      // Create
      const createData = {
        name: 'CRUD Test Product',
        price: 99.99,
        productType: 'Test',
        productCategory: 'Testing',
        descriptionShort: 'Testing complete CRUD cycle',
        descriptionLong:
          'This product is used to test the complete Create, Read, Update, Delete cycle',
      };

      const created = await service.createProduct(createData);
      expect(created.id).toBeDefined();

      // Read
      const found = await service.product({ id: created.id });
      expect(found).toBeDefined();
      expect(found?.name).toBe(createData.name);
      expect(found?.productType).toBe(createData.productType);

      // Delete
      const deleted = await service.deleteProduct({ id: created.id });
      expect(deleted.id).toBe(created.id);

      // Verify deletion
      const notFound = await service.product({ id: created.id });
      expect(notFound).toBeNull();
    });

    it('should handle concurrent operations correctly', async () => {
      // Arrange
      const operations = Array.from({ length: 5 }, (_, i) => ({
        name: `Concurrent Product ${i}`,
        price: (i + 1) * 10,
        productType: `Type${i}`,
        productCategory: `Category${i}`,
        descriptionShort: `Concurrent test product number ${i}`,
      }));

      // Act - Create products concurrently
      const createPromises = operations.map((data) =>
        service.createProduct(data),
      );
      const createdProducts = await Promise.all(createPromises);

      // Assert
      expect(createdProducts).toHaveLength(5);

      const allProducts = await prisma.product.findMany({
        orderBy: { name: 'asc' },
      });
      expect(allProducts).toHaveLength(5);

      // Act - Delete products concurrently
      const deletePromises = createdProducts.map((product) =>
        service.deleteProduct({ id: product.id }),
      );
      await Promise.all(deletePromises);

      // Assert - All should be deleted
      const remainingProducts = await prisma.product.count();
      expect(remainingProducts).toBe(0);
    });

    it('should maintain data integrity with timestamps', async () => {
      // Arrange
      const productData = {
        name: 'Timestamp Test Product',
        price: 75.0,
        productType: 'Electronics',
        productCategory: 'Testing',
      };

      // Act
      const created = await service.createProduct(productData);

      // Small delay to ensure updatedAt would be different if it changes
      await new Promise((resolve) => setTimeout(resolve, 100));

      const retrieved = await service.product({ id: created.id });

      // Assert
      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
      expect(retrieved?.createdAt).toEqual(created.createdAt);
      expect(retrieved?.updatedAt).toEqual(created.updatedAt);
    });
  });
});