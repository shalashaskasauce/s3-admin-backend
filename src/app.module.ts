import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BucketsController } from './buckets/buckets.controller';
import { BucketsService } from './buckets/buckets.service';
import { S3Service } from './s3/s3.service';
import { ObjectsService } from './objects/objects.service';
import { ObjectsController } from './objects/objects.controller';
import { ObjectController } from './object/object.controller';

@Module({
  imports: [],
  controllers: [AppController, BucketsController, ObjectsController, ObjectController],
  providers: [AppService, BucketsService, S3Service, ObjectsService],
})
export class AppModule {}
