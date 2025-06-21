import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('create/order')
  createOrder(): string {
    return 'Order created successfully!';
  }

  @Get('view/orders')
  getOrders(): string {
    return 'List of orders';
  }

  @Get('view/order/:id')
  getOrderById(): string {
    return 'Order details for the given ID';
  }

  @Get('view/products')
  getProducts(): string {
    return 'List of products';
  }

  @Get('view/product/:id')
  getProductById(): string {
    return 'Product details for the given ID';
  }

  @Get('view/clients')
  getClients(): string {
    return 'List of clients';
  }

  @Get('view/client/:id')
  getClientById(): string {
    return 'Client details for the given ID';
  }

  @Get('view/orders_history')
  getOrdersHistory(): string {
    return 'Order history';
  }

}