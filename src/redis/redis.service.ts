import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  public readonly redisClient: RedisClientType;
  async geoAdd(key: string, posName: string, posLoc: [number, number]) {
    return await this.redisClient.geoAdd(key, {
      longitude: posLoc[0],
      latitude: posLoc[1],
      member: posName,
    });
  }
  async getPos(key: string, posName: string) {
    const res = await this.redisClient.geoPos(key, posName);
    return {
      name: posName,
      longitude: res[0].longitude,
      latitude: res[0].latitude,
    };
  }
  async getList(key: string) {
    // geo 信息底层使用 zset 存储的，所以查询所有的 key 使用 zrange
    const positions = await this.redisClient.zRange(key, 0, -1);
    const posList = [];
    for (const pos of positions) {
      const posInfo = await this.getPos(key, pos);
      posList.push(posInfo);
    }
    return posList;
  }
  async getNeary(
    key: string,
    pos: [number | string, number | string],
    radius: number,
    unit: 'm' | 'km' | 'mi' | 'ft' = 'km',
  ) {
    const posList = [];
    const prototypeArry = await this.redisClient.GEORADIUS(
      key,
      {
        longitude: pos[0],
        latitude: pos[1],
      },
      radius,
      unit,
    );
    for (const item of prototypeArry) {
      const posInfo = await this.getPos(key, item);
      posList.push(posInfo);
    }
    return posList;
  }
}
