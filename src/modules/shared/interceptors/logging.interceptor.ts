import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
  } from '@nestjs/common';
  import { Observable } from 'rxjs';
  import { tap } from 'rxjs/operators';
  import * as chalk from 'chalk';
  
  @Injectable()
  export class LoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const request = context.switchToHttp().getRequest();
      const { method, url, body, headers } = request;
      const now = Date.now();
  
      console.log(chalk.blue(`[Request]`) + 
        chalk.green(` ${method} ${url}`) + 
        ` - Body: ${chalk.cyan(JSON.stringify(body))}`
      );
  
      return next
        .handle()
        .pipe(
          tap(() =>
            console.log(
              chalk.yellow(`[Response]`) +
              chalk.green(` ${method} ${url}`) +
              ` - Duration: ${chalk.red(`${Date.now() - now}ms`)}`
            )
          )
        );
    }
  }
  