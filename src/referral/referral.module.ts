import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ReferralController } from '@referral/referral.controller';
import { ReferralService } from '@referral/referral.service';
import { ReferralLink, ReferralLinkSchema } from '@schemas/referral-link.schema';
import { ReferralTransaction, ReferralTransactionSchema } from '@schemas/referral-transaction.schema';
import { ReferralSettings, ReferralSettingsSchema } from '@schemas/referral-settings.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: ReferralLink.name, schema: ReferralLinkSchema },
      { name: ReferralTransaction.name, schema: ReferralTransactionSchema },
      { name: ReferralSettings.name, schema: ReferralSettingsSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_CLIENT',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const kafkaBrokers = configService.get<string>('KAFKA_BROKERS', 'localhost:9092').split(',');
          const kafkaClientId = configService.get<string>('KAFKA_CLIENT_ID', 'referral-service');
          
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: kafkaClientId,
                brokers: kafkaBrokers,
              },
              producer: {
                retry: {
                  retries: configService.get<number>('KAFKA_RETRY_ATTEMPTS', 5),
                  initialRetryTime: configService.get<number>('KAFKA_RETRY_DELAY', 1000),
                },
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService, ClientsModule],
})
export class ReferralModule {} 