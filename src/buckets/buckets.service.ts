import { Injectable } from '@nestjs/common';
// import { Bucket } from '@aws-sdk/client-s3';

import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class BucketsService {
  constructor(private s3: S3Service) {}

  async findAll() {
    return await this.s3.listBuckets();
  }
}
