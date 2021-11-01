import { Controller, Get } from '@nestjs/common';

// import { Bucket } from './../interfaces/bucket.interface';
import { BucketsService } from './buckets.service';

@Controller('buckets')
export class BucketsController {
  constructor(private bucketsService: BucketsService) {}

  @Get()
  findAll() {
    return this.bucketsService.findAll();
  }
}
