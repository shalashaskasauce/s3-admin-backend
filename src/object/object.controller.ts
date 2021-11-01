import { Controller, Get, Param, Res } from '@nestjs/common';
import { Readable } from 'stream';

import { ObjectsService } from 'src/objects/objects.service';

@Controller('object')
export class ObjectController {
  constructor(private objectsService: ObjectsService){
  }

  @Get('/:bucket/:key')
  async findOne(
    @Param('bucket') bucket: string,
    @Param('key') key: string,
    @Res() res: any) {
    const response = await this.objectsService.getObject(bucket, key);
    const file = response.Body as Readable;

    res.attachment(key);
    file.pipe(res);
  }
}
