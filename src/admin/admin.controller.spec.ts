import { Test, TestingModule } from '@nestjs/testing';

import { S3Service } from '../s3/s3.service';
import { AdminController } from './admin.controller';

describe('AccessController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [{ provide: S3Service, useValue: {} }],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
