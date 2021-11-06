import { Test, TestingModule } from '@nestjs/testing';

import { S3Service } from 'src/s3/s3.service';
import { AccessController } from './access.controller';

describe('AccessController', () => {
  let controller: AccessController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessController],
      providers: [{ provide: S3Service, useValue: {} }],
    }).compile();

    controller = module.get<AccessController>(AccessController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
