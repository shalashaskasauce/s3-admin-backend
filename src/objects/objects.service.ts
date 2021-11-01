import { Injectable } from '@nestjs/common';

import { S3Service } from 'src/s3/s3.service';

@Injectable()
export class ObjectsService {
  constructor(private s3: S3Service) {}

  async findAll(bucket: string) {
    return await this.s3.listObjects(bucket);
  }

  async getObject(bucket: string, key: string) {
    return await this.s3.getObject(bucket, key);
  }
}
