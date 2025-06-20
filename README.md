# 🚀 Inskins Referral Service (Kafka Microservice)

**Event-driven реферальная система для платформы Inskins**

## 📋 Описание

Микросервис реферальной системы, построенный на event-driven архитектуре с использованием Apache Kafka. Обрабатывает события пользователей и транзакций для автоматического начисления реферальных комиссий.

## 🏗️ Архитектура

### Event-Driven Design
- **Входящие события**: `user.registered`, `transaction.completed`, `user.banned`, `user.profile.updated`
- **Исходящие события**: `referral.commission.earned`, `referral.link.created`, `referral.user.registered`, `referral.status.updated`
- **Consumer Group**: `referral-service-consumer`

### Технологический стек
- **Runtime**: Node.js + TypeScript
- **Framework**: NestJS Microservices
- **Message Broker**: Apache Kafka (NestJS Kafka Transport)
- **Database**: MongoDB + Mongoose
- **Validation**: class-validator + class-transformer

## ⚡ Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка окружения
```bash
cp environment.example .env
# Настройте переменные окружения
```

### 3. Запуск локальной инфраструктуры
```bash
# Запуск Kafka, MongoDB, Kafka UI
docker-compose up -d

# Проверка статуса
docker-compose ps
```

### 4. Запуск микросервиса
```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## 🔧 Конфигурация

### Kafka Topics
| Topic | Direction | Description |
|-------|-----------|-------------|
| `user.registered` | IN | Регистрация пользователей |
| `transaction.completed` | IN | Завершенные транзакции |
| `user.banned` | IN | Блокировка пользователей |
| `referral.commission.earned` | OUT | Начисленные комиссии |
| `referral.link.created` | OUT | Созданные реферальные ссылки |
| `referral.user.registered` | OUT | Регистрации через реферал |

### Environment Variables
```bash
# Kafka Configuration
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=referral-service
KAFKA_GROUP_ID=referral-service-consumer
KAFKA_RETRY_ATTEMPTS=5
KAFKA_RETRY_DELAY=1000

# MongoDB  
MONGODB_URI=mongodb://localhost:27017/ref-service

# App
PORT=3004
FRONTEND_URL=https://inskins.gg
```

## 📊 Monitoring

### Kafka UI
- **URL**: http://localhost:8080
- **Описание**: Веб-интерфейс для мониторинга Kafka topics, consumers, messages

### Health Check
```bash
curl http://localhost:3004/health
```

## 🎯 Message Patterns

### Request-Reply Patterns (MessagePattern)

#### Создание реферальной ссылки
```javascript
// Topic: referral.link.create
{
  "userId": "user-123"
}

// Response:
{
  "success": true,
  "data": {
    "referralCode": "ABC12345",
    "referralLink": "https://inskins.gg/register?ref=ABC12345"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Получение статистики
```javascript
// Topic: referral.stats.get
{
  "userId": "user-123"
}
```

#### Обработка комиссии
```javascript
// Topic: referral.commission.process
{
  "userId": "user-456",
  "transactionId": "tx-789",
  "amount": 100.00,
  "currency": "USD"
}
```

### Event Patterns (EventPattern)

#### Обработка регистрации пользователя
```javascript
// Topic: user.registered
{
  "userId": "user-456",
  "referralCode": "ABC12345",
  "email": "user@example.com",
  "registeredAt": "2024-01-01T00:00:00.000Z"
}
```

#### Обработка завершенной транзакции
```javascript
// Topic: transaction.completed
{
  "userId": "user-456",
  "transactionId": "tx-789",
  "amount": 100.00,
  "currency": "USD"
}
```

## 🔄 Event Flow

### 1. Регистрация пользователя с реферальным кодом
```
Gateway → user.registered → Referral Service → referral.user.registered
```

### 2. Обработка транзакции и начисление комиссии
```
Payment Service → transaction.completed → Referral Service → referral.commission.earned
```

### 3. Создание новой реферальной ссылки
```
Gateway → referral.link.create → Referral Service → referral.link.created
```

## 🧪 Тестирование

### Unit тесты
```bash
npm run test
```

### E2E тесты
```bash
npm run test:e2e
```

### Тестирование событий через Kafka UI
1. Откройте http://localhost:8080
2. Выберите topic `user.registered`
3. Отправьте тестовое сообщение:
```json
{
  "userId": "test-user-123",
  "referralCode": "TEST1234",
  "email": "test@example.com",
  "registeredAt": "2024-01-01T00:00:00.000Z"
}
```

## 📈 Производительность

### Пропускная способность
- **Events/sec**: 1000+ событий в секунду
- **Latency**: < 100ms на обработку события
- **Availability**: 99.9%

### Scaling
- Горизонтальное масштабирование через Kafka partitions
- Вертикальное масштабирование MongoDB

## 🔒 Безопасность

### Event Validation
- Валидация схемы событий через class-validator
- Проверка источника событий
- Дедупликация сообщений по transactionId

### Database Security
- Аутентификация MongoDB
- Шифрование соединений
- Индексы для производительности

## 🚀 Deployment

### Docker
```bash
# Сборка образа
docker build -t inskins/ref-service .

# Запуск контейнера
docker run -p 3004:3004 inskins/ref-service
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ref-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ref-service
  template:
    metadata:
      labels:
        app: ref-service
    spec:
      containers:
      - name: ref-service
        image: inskins/ref-service:latest
        env:
        - name: KAFKA_BROKERS
          value: "kafka-cluster:9092"
        - name: MONGODB_URI
          value: "mongodb://mongo-cluster:27017/ref-service"
```

## 📞 Поддержка

- **Команда**: Inskins Development Team
- **Email**: dev@inskins.gg
- **Slack**: #referral-service

## 📝 Changelog

### v2.0.0 (Kafka Microservice)
- ✅ Полный переход на Kafka микросервис
- ✅ Event-driven обработка событий
- ✅ MessagePattern для request-reply
- ✅ EventPattern для fire-and-forget
- ✅ Автоматическое начисление комиссий 1.5%
- ✅ Kafka UI для мониторинга
- ✅ Docker Compose для локальной разработки

### v1.0.0 (Legacy REST API)
- ✅ REST API endpoints
- ✅ MongoDB integration
- ✅ Basic referral functionality 