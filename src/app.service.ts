import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() {}
  
  public getHello() {
    return 'Hi, Welcome!';
  }
}
