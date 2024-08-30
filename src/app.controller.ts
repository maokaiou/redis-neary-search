import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(RedisService) private readonly redisService: RedisService,
  ) {}
  @Get('addPos')
  async addPos(
    @Query('name') posName: string,
    @Query('longitude') longitude: number,
    @Query('latitude') latitude: number,
  ) {
    if (!posName || !longitude || !latitude) {
      throw new BadRequestException('位置信息不全');
    }
    try {
      await this.redisService.geoAdd('positions', posName, [
        longitude,
        latitude,
      ]);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
    return {
      message: '添加成功',
      statusCode: 200,
    };
  }
  @Get('getPos')
  async getPos(@Query('name') pos: string) {
    return await this.redisService.getPos('positions', pos);
  }
  @Get('getList')
  async getList() {
    return await this.redisService.getList('positions');
  }
  @Get('getNeary')
  async getNeary(
    @Query('longitude') longitude: string,
    @Query('latitude') latitude: string,
    @Query('radius') radius: number,
  ) {
    if (!longitude || !latitude || !radius) {
      throw new BadRequestException('位置信息不全');
    }
    try {
      return await this.redisService.getNeary(
        'positions',
        [longitude, latitude],
        radius,
        'km',
      );
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }
  }
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
