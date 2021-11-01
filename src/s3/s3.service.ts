import { Injectable, UploadedFile } from '@nestjs/common';
import { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, PutObjectCommandInput } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  // TODO: configure via env vars?
  private region = 'ca-central-1';
  private _client: S3Client;

  constructor() {
    this._client = new S3Client({ region: this.region });
  }

  async listBuckets() {
    return (
      await this._client.send(new ListBucketsCommand({}))
    ).Buckets;
  }

  async listObjects(bucket: string, prefix = '') {
    return (
      await this._client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }))
    ).Contents;
  }

  async getObject(bucket: string, key: string) {
    console.log('key', key);
    const response = await this._client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response;
  }

  async uploadObject(bucket: string, key: string, body: string) {
    const input = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body
    });

    const response = await this._client.send(input)
    return response;
  }
}
