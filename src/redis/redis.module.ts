import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const client = await createClient()
          .on('error', (err) => console.log('Redis Client Error', err))
          .connect();
        return client;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
