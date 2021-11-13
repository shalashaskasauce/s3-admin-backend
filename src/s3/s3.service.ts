import { Injectable, UploadedFile } from '@nestjs/common';
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import  { SendEmailCommand, SendEmailCommandOutput, SESClient }  from  "@aws-sdk/client-ses";
import { env } from 'process';

@Injectable()
export class S3Service {
  // TODO: configure via env vars?
  // private senderEmail = '';
  private region = 'ca-central-1';
  private _client: S3Client;
  private _emailClient: SESClient; // TODO: consider if worth having own service

  constructor() {
    this._client = new S3Client({ region: this.region });
    this._emailClient = new SESClient( { region: this.region });
  }

  async listBuckets() {
    return (await this._client.send(new ListBucketsCommand({}))).Buckets;
  }

  async listObjects(bucket: string, prefix = '') {
    return (
      await this._client.send(
        new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix }),
      )
    ).Contents;
  }

  async getObject(bucket: string, key: string) {
    const response = await this._client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    return response;
  }

  // TODO: find proper interface for File
  async uploadObject(
    bucket: string,
    key: string,
    body: any,
    contentType?: string,
  ) {
    const input = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    const response = await this._client.send(input);
    return response;
  }

  async sendEmail(toAddress: string, body: string, subject: string): Promise<SendEmailCommandOutput | Error> {
    // Set the parameters
    const params = {
      Destination: {
        /* required */
        CcAddresses: [
          /* more items */
        ],
        ToAddresses: [
          toAddress,
        ],
      },
      Message: {
        /* required */
        Body: {
          /* required */
          Html: {
            Charset: "UTF-8",
            Data: body,
          },
          Text: {
            Charset: "UTF-8",
            Data: body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: subject,
        },
      },
      Source: process.env.SES_SENDER_EMAIL, // SENDER_ADDRESS
      ReplyToAddresses: [
        /* more items */
      ],
    };
    try {
      if (process.env.DEBUG) {
        console.log('email', process.env.SES_SENDER_EMAIL);
      }
      return await this._emailClient.send(new SendEmailCommand(params));
    } catch (error) {
      if (process.env.DEBUG) {
        console.log('Email error:' , error);
      }
      return new Error(`Error occured: ${error}`);
    }
  }


}
