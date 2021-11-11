import { Test, TestingModule } from '@nestjs/testing';

import { S3Service } from '../s3/s3.service';
import { ObjectController } from './object.controller';

describe('ObjectController', () => {
  let controller: ObjectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectController],
      providers: [{ provide: S3Service, useValue: {} }],
    }).compile();

    controller = module.get<ObjectController>(ObjectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
