import { Controller, Get, Param, Query } from '@nestjs/common';

import { S3Service } from '../s3/s3.service';

@Controller('objects')
export class ObjectsController {
  constructor(private s3Service: S3Service) {}

  @Get('/:bucket')
  async findAll(@Param('bucket') bucket: string, @Query('prefix') prefix = '') {
    return await this.s3Service.listObjects(bucket, prefix);
  }
}
