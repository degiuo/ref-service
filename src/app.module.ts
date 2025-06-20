import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { ReferralModule } from './referral/referral.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.mongodb.uri') || 
             process.env.MONGODB_URI || 
             'mongodb://localhost:27017/ref-service',
      }),
      inject: [ConfigService],
    }),
    HealthModule,
    ReferralModule,
  ],
})
export class AppModule {} 