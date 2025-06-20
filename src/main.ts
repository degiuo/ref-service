import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const kafkaBrokers = process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'];
  const consumerGroup = process.env.KAFKA_GROUP_ID || 'referral-service-consumer';
  const kafkaClientId = process.env.KAFKA_CLIENT_ID || 'referral-service';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: kafkaClientId,
        brokers: kafkaBrokers,
      },
      consumer: {
        groupId: consumerGroup,
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen();

  logger.log(`📨 Referral Microservice started successfully`);
  logger.log(`🔧 Kafka brokers: ${kafkaBrokers.join(', ')}`);
  logger.log(`👥 Consumer group: ${consumerGroup}`);
  logger.log(`🎯 Listening to topics: referral.*, user.*, transaction.*`);
}

bootstrap(); 