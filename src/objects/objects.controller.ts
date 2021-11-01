import { Controller, Get, Param } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';

@Controller('objects')
export class ObjectsController {
  constructor(private s3Service: S3Service) {}

  @Get('/:bucket')
  async findAll(@Param('bucket') bucket: string) {
    return await this.s3Service.listObjects(bucket);
  }
}
