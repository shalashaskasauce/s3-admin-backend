import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import { FileAccess } from '../interfaces/file-access';
import { FileAccessMap } from '../interfaces/file-access-map';
import { S3Service } from '../s3/s3.service';
import { base64UrlDecode, base64UrlEncode } from '../util/base64url';
import { streamToString } from '../util/stream-to-string';

// TODO - implement auth

@Controller('admin')
export class AdminController {
  private readonly accessPrefix = 'access';
  private readonly now = new Date().toISOString();

  // TODO: create util or service for loadJSONFile (duped in access controller)
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
      return;
    }
  }

  constructor(private s3Service: S3Service) {}

  /**
   * Create or append JSON file add new FileAccess object for key (if not present).
   */
  @Get('/:bucket/')
  async getAccessFile(
    @Param('bucket') bucket: string,
    @Query('email') email: string,
    @Query('key') key: string,
  ): Promise<FileAccess> {
    const encodedEmail = base64UrlEncode(email);
    const existingFile = await this.loadJSONFile(bucket, encodedEmail);

    if (!existingFile || !existingFile[key]) {
      throw Error('File or key not found.');
    }

    return existingFile[key];
  }

  /**
   * Modify downloads and max_downloads params for an access file.
   */
  @Put('/:bucket/')
  async modifyAccessfile(
    @Res() res: Response,
    @Param('bucket') bucket: string,
    @Body('email') email: string,
    @Body('key') key: string,
    @Body('downloads') downloads?: number,
    @Body('max_downloads') max_downloads?: number
  ) {
    const encodedEmail = base64UrlEncode(email);
    const existingFile = await this.loadJSONFile(bucket, encodedEmail);

    if (!existingFile || !existingFile[key]) {
      return res.send({ message: 'Expected access file does not exist.' });
    }

    // Number() looks unnecessary, but it prevents stringifying the numbers
    const downloadsObject =
      downloads !== undefined ? { downloads: Number(downloads) } : undefined;
    const maxDownloadsObject =
      max_downloads !== undefined
        ? { max_downloads: Number(max_downloads) }
        : undefined;
    const fileAccess = existingFile[key];

    // copy new params into existing file key
    const modifiedFileAccess = {
      ...fileAccess,
      ...downloadsObject,
      ...maxDownloadsObject,
    };

    // copy modified file into file access map
    const uploadFile: FileAccessMap = {
      ...existingFile,
      [key]: modifiedFileAccess,
    };

    const uploadFileJson = JSON.stringify(uploadFile);

    if (uploadFileJson === JSON.stringify(existingFile)) {
      return res.send({ message: 'No changes to access file.' });
    }

    await this.s3Service.uploadObject(
      bucket,
      `${this.accessPrefix}/${encodedEmail}`,
      uploadFileJson,
      'application/json; charset=utf-8',
    );


    return res.send({ message: 'Modification successful' });
  }

  /**
   * Create or append JSON file add new FileAccess object for key (if not present).
   */
  @Post('/:bucket/')
  async createAccessfile(
    @Res() res: Response,
    @Param('bucket') bucket: string,
    @Body('email') email: string,
    @Body('key') key: string,
    @Body('max_downloads') max_downloads = 1
  ) {
    const encodedEmail = base64UrlEncode(email);
    // link returned in response
    const link = `/access/${bucket}?key=${base64UrlEncode(
      key,
    )}&e=${encodedEmail}`;
    const newFile: FileAccessMap = {
      [key]: {
        created_at: this.now,
        downloaded_at: '',
        downloads: 0,
        max_downloads: max_downloads,
      },
    };

    const existingFile = await this.loadJSONFile(bucket, encodedEmail);

    if (!existingFile || !existingFile[key]) {
      const uploadFile = {
        ...existingFile,
        ...newFile,
      };

      await this.s3Service.uploadObject(
        bucket,
        `${this.accessPrefix}/${encodedEmail}`,
        JSON.stringify(uploadFile),
        'application/json; charset=utf-8',
      );

      // TODO: use template if SES allows??
      this.s3Service.sendEmail(
        email,
        `Important: this can only be downloaded ${max_downloads} times. Access link: ${email}.`,
        'Your product link is available'
      );

      return res.send({
        link: link,
        message: !existingFile
          ? `Created access file for: "${email}".`
          : `Added key: "${key}" for "${email}".`,
      });
    }

    return res.send({
      message: `No changes to existing file (${encodedEmail}).`,
      link: link,
    });
  }
}
