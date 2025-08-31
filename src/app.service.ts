import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppStatus() {
    return {
      up: true,
      ready: false,
      message: 'Application is running',
    };
  }
}
