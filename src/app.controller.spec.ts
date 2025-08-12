import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('checkHealth', () => {
    it('should return health status', () => {
      const result = appController.checkHealth();
      expect(result).toEqual({ status: 'ok' });
    });
  });

  describe('restEndpoint', () => {
    it('should return service endpoint info', () => {
      mockConfigService.get
        .mockReturnValueOnce('localhost')
        .mockReturnValueOnce(3000);

      const result = appController.restEndpoint();

      expect(result).toEqual({
        message: 'Task Service is running on',
        baseUrl: 'http://localhost:3000',
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('HOST', 'localhost');
      expect(mockConfigService.get).toHaveBeenCalledWith('PORT', 3000);
    });
  });

  describe('v12_checkHealth', () => {
    it('should return v1.2 health status', () => {
      const result = appController.v12_checkHealth();
      expect(result).toEqual({ status: 'ok v1.2!' });
    });
  });
});
