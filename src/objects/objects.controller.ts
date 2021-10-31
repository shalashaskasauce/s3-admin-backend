import { Controller, Get, Param } from '@nestjs/common';

import { ObjectsService } from './objects.service';

@Controller('objects')
export class ObjectsController {
  constructor(private objectsService: ObjectsService) {}

  @Get('/:bucket')
  async findAll(@Param('bucket') bucket: string) {
    return await this.objectsService.findAll(bucket);
  }
}
