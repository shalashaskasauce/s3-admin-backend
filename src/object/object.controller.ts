import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { Response } from 'express';

import { S3Service } from 'src/s3/s3.service';

@Controller('object')
export class ObjectController {
  constructor(private s3Service: S3Service) {}

  @Get('/:bucket/')
  async findOne(
    @Param('bucket') bucket: string,
    @Query('key') key: string,
    @Res() res: Response,
  ) {
    const response = await this.s3Service.getObject(bucket, key);
    const file = response.Body as Readable;

    res.attachment(key);
    file.pipe(res);
  }

  // TODO: lock "prefix" -- this is a probably security hole.
  // I'm thinking API should solely handle "product" vs "access".
  @Post('/:bucket/')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: any,
    @Param('bucket') bucket: string,
    @Query('prefix') prefix = 'products',
  ) {
    return await this.s3Service.uploadObject(
      bucket,
      `${prefix}/${file.originalname}`,
      file.buffer,
    );
  }
}
