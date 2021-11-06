import { Test, TestingModule } from '@nestjs/testing';

import { S3Service } from 'src/s3/s3.service';
import { BucketsService } from './buckets.service';

describe('BucketsService', () => {
  let service: BucketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BucketsService, { provide: S3Service, useValue: {} }],
    }).compile();

    service = module.get<BucketsService>(BucketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
