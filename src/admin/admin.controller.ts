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

import { FileAccess } from 'src/interfaces/file-access';
import { FileAccessMap } from 'src/interfaces/file-access-map';
import { S3Service } from 'src/s3/s3.service';
import { base64UrlDecode, base64UrlEncode } from 'src/util/base64url';
import { streamToString } from 'src/util/stream-to-string';

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
    @Param('bucket') bucket: string,
    @Body('email') email: string,
    @Body('key') key: string,
    @Body('downloads') downloads?: number,
    @Body('max_downloads') max_downloads?: number,
  ) {
    const encodedEmail = base64UrlEncode(email);
    const existingFile = await this.loadJSONFile(bucket, encodedEmail);

    if (!existingFile || !existingFile[key]) {
      return { message: 'Expected access file does not exist.' };
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
      return { message: 'No changes to access file.' };
    }

    await this.s3Service.uploadObject(
      bucket,
      `${this.accessPrefix}/${encodedEmail}`,
      uploadFileJson,
      'application/json; charset=utf-8',
    );

    return { message: 'Modification successful' };
  }

  /**
   * Create or append JSON file add new FileAccess object for key (if not present).
   */
  @Post('/:bucket/')
  async createAccessfile(
    @Param('bucket') bucket: string,
    @Body('email') email: string,
    @Body('key') key: string,
    @Body('max_downloads') max_downloads = 1,
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
      return {
        link: link,
        message: !existingFile
          ? `Created access file for: "${email}".`
          : `Added key: "${key}" for "${email}".`,
      };
    }

    return {
      message: `No changes to existing file (${encodedEmail}).`,
      link: link,
    };
  }
}
