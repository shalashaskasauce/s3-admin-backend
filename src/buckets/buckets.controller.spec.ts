import { Test, TestingModule } from '@nestjs/testing';
import { BucketsController } from './buckets.controller';

describe('BucketsController', () => {
  let controller: BucketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BucketsController],
    }).compile();

    controller = module.get<BucketsController>(BucketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
