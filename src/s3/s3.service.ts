import { Injectable } from '@nestjs/common';
import { S3Client, ListBucketsCommand, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

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

  async listObjects(bucket: string) {
    return (
      await this._client.send(new ListObjectsV2Command({ Bucket: bucket }))
    ).Contents;
  }

  async getObject(bucket: string, key: string) {
    const response = await this._client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    return response;
  }
}
