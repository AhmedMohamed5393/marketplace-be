import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common'; 
import { SharedModule } from './modules/shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingModule } from './modules/logging/logging.module';
import { ProductModule } from './modules/products/product.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LoggingModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
