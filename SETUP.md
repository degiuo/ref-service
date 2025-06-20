# Настройка ref-service

## Подключение к MongoDB Atlas

1. Создайте файл `.env` в корне проекта ref-service
2. Скопируйте содержимое файла `environment.example`
3. Замените `YOUR_PASSWORD_HERE` на реальный пароль от MongoDB Atlas

### Пример .env файла:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://user:REAL_PASSWORD@cluster0.90yplfi.mongodb.net/inskins-referral?retryWrites=true&w=majority&appName=Cluster0
DB_PASSWORD=REAL_PASSWORD

# Server Configuration
PORT=3003

# Kafka Configuration (опционально)
KAFKA_CLIENT_ID=inskins-referral-service
KAFKA_BROKERS=localhost:9092
KAFKA_GROUP_ID=inskins-referral-group

# Настройки реферальной системы
REFERRAL_COMMISSION_RATE=0.015
REFERRAL_MAX_COMMISSION_RATE=0.1
REFERRAL_AUTO_APPROVE=true
```

## Запуск сервиса

1. Установите зависимости:
```bash
npm install
```

2. Скомпилируйте проект:
```bash
npm run build
```

3. Запустите в режиме разработки:
```bash
npm run start:dev
```

4. Или запустите в продакшн режиме:
```bash
npm run start:prod
```

## API Endpoints

Сервис будет доступен по адресу: `http://localhost:3003`

Основные endpoints:
- `POST /steam-referral/links` - Создание реферальной ссылки
- `POST /steam-referral/click/:code` - Обработка клика по ссылке
- `POST /steam-referral/commission` - Обработка комиссии
- `GET /steam-referral/stats/:steamId` - Статистика пользователя

## Проверка работы

После запуска сервис будет пытаться подключиться к MongoDB Atlas. Если подключение успешно, вы увидите сообщения о загрузке модулей. 