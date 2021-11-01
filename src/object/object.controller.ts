import { Controller, Get, Param, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';

import { S3Service } from 'src/s3/s3.service';

@Controller('object')
export class ObjectController {
  constructor(private s3Service: S3Service){
  }

  @Get('/:bucket/')
  async findOne(
    @Param('bucket') bucket: string,
    @Query('key') key: string,
    @Res() res: any) {
    const response = await this.s3Service.getObject(bucket, key);
    const file = response.Body as Readable;

    res.attachment(key);
    file.pipe(res);
  }

  @Post('/:bucket/:key')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file,
    @Param('bucket') bucket: string,
    @Param('key') key: string
  ) {
      return await this.s3Service.uploadObject(bucket, key, file);
  }
}
