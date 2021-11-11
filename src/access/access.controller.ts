import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { FileAccess } from '../interfaces/file-access';
import { FileAccessMap } from '../interfaces/file-access-map';
import { S3Service } from '../s3/s3.service';
import { base64UrlDecode } from '../util/base64url';
import { streamToString } from '../util/stream-to-string';
import { Readable } from 'stream';

@Controller('access')
export class AccessController {
  private readonly accessPrefix = 'access';
  private readonly now = new Date().toISOString();

  // TODO: create util or service for loadJSONFile
  private async loadJSONFile(
    bucket: string,
    key: string,
  ): Promise<FileAccessMap> {
    try {
      const response = await this.s3Service.getObject(
        bucket,
        `${this.accessPrefix}/${key}`,
      );
      const file = response.Body as ReadableStream<string>;
      const json = JSON.parse(await streamToString(file));
      return json;
    } catch (error) {
      console.log('error', error);
      return;
    }
  }

  constructor(private s3Service: S3Service) {}

  /**
   * (PUBLIC - no auth to be implemented for this endpoint)
   * Loads FileAccess for key. If downloads < max_downloads, retrieves the requested file
   * and increments downloads.
   *
   * @param bucket
   * @param e - base64url encoded email
   * @param key
   * @returns
   */
  @Get('/:bucket/')
  async downloadFile(
    @Param('bucket') bucket: string,
    @Query('e') encodedEmail: string,
    @Query('key') encodedKey: string,
    @Res() res: Response
  ) {
    const key = base64UrlDecode(encodedKey);
    const existingFile = await this.loadJSONFile(bucket, encodedEmail);

    if (!existingFile || !existingFile[key]) {
      // probably should be 404
      return res.send({
        message: 'The requested file is not available for this email address.',
      });
    }

    const fileAccess: FileAccess = existingFile[key];

    if (Number(fileAccess.downloads) >= Number(fileAccess.max_downloads)) {
      return res.send({
        message: `This user has reached the download limit for this file (${fileAccess.max_downloads}).`,
      });
    }

    const uploadFile: FileAccessMap = {
      ...existingFile,
      [key]: {
        ...fileAccess,
        downloads: Number(fileAccess.downloads) + 1,
        downloaded_at: this.now,
      },
    };

    await this.s3Service.uploadObject(
      bucket,
      `${this.accessPrefix}/${encodedEmail}`,
      JSON.stringify(uploadFile),
      'application/json; charset=utf-8',
    );

    console.log('key', key);
    const response = await this.s3Service.getObject(bucket, key);
    const file = response.Body as Readable;

    res.attachment(key);
    file.pipe(res);
  }

  // TODO: update file and restrict access
}
