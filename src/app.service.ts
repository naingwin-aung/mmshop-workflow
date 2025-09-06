import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAppStatus() {
    return {
      up: true,
      ready: true,
      message: 'Application is running',
    };
  }
}
