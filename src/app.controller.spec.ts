import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root controller #1', () => {
    it('should return json', () => {
      expect(appController.getHello()).toStrictEqual({
        up: true,
        ready: true,
        message: 'Application v0.0.1 is running!',
      });
    });
  });
});
