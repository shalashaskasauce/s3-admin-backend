import { Test, TestingModule } from '@nestjs/testing';

import { S3Service } from '../s3/s3.service';
import { ObjectsController } from './objects.controller';

describe('ObjectsController', () => {
  let controller: ObjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ObjectsController],
      providers: [{ provide: S3Service, useValue: {} }],
    }).compile();

    controller = module.get<ObjectsController>(ObjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
