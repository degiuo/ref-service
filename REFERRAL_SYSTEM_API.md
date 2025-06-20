# Реферальная система - API документация

## Структура реферальной системы

Реферальная система интегрирована в объект пользователя и работает по следующим принципам:

### Механика работы

1. **Условия участия**: Программа доступна только для пользователей, которые ранее не были авторизованы на сайте
2. **Комиссионная структура**: 
   - Общая комиссия сервиса: 5%
   - Реферальная комиссия: 1.5% (настраиваемая)
   - Комиссия платформы: 3.5%
3. **Ограничения**: Нет рефералов второго порядка
4. **Начисления**: В момент успешного завершения сделки

## API Endpoints

### 1. Регистрация пользователя в реферальной системе

```http
POST /user-referral/register
```

**Body:**
```json
{
  "steamId": "76561198000000000",
  "referralCode": "ABC123", // опционально
  "steamNickname": "PlayerName", // опционально
  "steamAvatarUrl": "https://..." // опционально
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "steamId": "76561198000000000",
    "wasRegisteredBefore": false,
    "isEligibleForReferrals": true,
    "referrerSteamId": "76561198000000001",
    "commissionConfig": {
      "totalServiceRate": 0.05,
      "referralRate": 0.015,
      "platformRate": 0.035
    }
  },
  "message": "Пользователь успешно зарегистрирован в реферальной системе"
}
```

### 2. Проверка права участия в реферальной программе

```http
POST /user-referral/check-eligibility/{steamId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "steamId": "76561198000000000",
    "isEligibleForReferrals": true,
    "reason": "Пользователь может участвовать в реферальной программе"
  },
  "message": "Проверка права участия в реферальной программе"
}
```

### 3. Обработка успешной транзакции

```http
POST /user-referral/process-transaction
```

**Body:**
```json
{
  "steamId": "76561198000000000",
  "transactionAmount": 100.00,
  "transactionId": "TXN_123456789",
  "transactionType": "game_purchase" // опционально
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasReferrer": true,
    "referrerSteamId": "76561198000000001",
    "referralCommission": 1.50,
    "platformCommission": 3.50,
    "totalServiceCommission": 5.00
  },
  "message": "Реферальная комиссия начислена успешно"
}
```

### 4. Получение информации о пользователе

```http
GET /user-referral/info/{steamId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "steamId": "76561198000000000",
    "hasReferrer": true,
    "referrerSteamId": "76561198000000001",
    "isEligibleForReferrals": true,
    "wasRegisteredBefore": false,
    "totalEarnings": 15.50,
    "totalReferrals": 5,
    "activeReferrals": 3,
    "referralStats": {
      "totalTransactions": 25,
      "totalCommissionsPaid": 15.50,
      "averageTransactionValue": 50.00,
      "lastTransactionAt": "2025-06-20T18:00:00.000Z"
    },
    "commissionConfig": {
      "totalServiceRate": 0.05,
      "referralRate": 0.015,
      "platformRate": 0.035
    }
  },
  "message": "Информация получена"
}
```

### 5. Отметка пользователя как возвращающегося

```http
POST /user-referral/mark-returning/{steamId}
```

**Response:**
```json
{
  "success": true,
  "message": "Пользователь отмечен как возвращающийся"
}
```

## Существующие Steam Referral API

### Создание реферальной ссылки

```http
POST /referral/create
```

### Обработка клика по ссылке

```http
POST /referral/click/{code}
```

### Статистика реферальной программы

```http
GET /referral/stats/{steamId}
```

## База данных

### UserReferral Schema

```javascript
{
  steamId: String, // уникальный Steam ID
  steamNickname: String, // никнейм Steam
  steamAvatarUrl: String, // аватар Steam
  referrerSteamId: String, // Steam ID реферера
  referrerCode: String, // код реферальной ссылки
  wasRegisteredBefore: Boolean, // был ли авторизован ранее
  registeredAt: Date, // дата регистрации
  totalEarnings: Number, // общий доход с рефералов
  totalReferrals: Number, // общее количество рефералов
  activeReferrals: Number, // активные рефералы
  firstLoginAt: Date, // первый вход
  lastCommissionAt: Date, // последнее начисление
  isEligibleForReferrals: Boolean, // право на участие
  referralStats: {
    totalTransactions: Number,
    totalCommissionsPaid: Number,
    averageTransactionValue: Number,
    lastTransactionAt: Date
  },
  serviceCommissionConfig: {
    totalServiceRate: Number, // 0.05 (5%)
    referralRate: Number, // 0.015 (1.5%)
    platformRate: Number // 0.035 (3.5%)
  }
}
```

## Логика работы

1. **Новый пользователь** переходит по реферальной ссылке
2. **Проверка**: был ли пользователь авторизован ранее
3. **Регистрация**: если нет - создается связь с реферером
4. **Транзакции**: при успешных сделках начисляется комиссия
5. **История**: все начисления сохраняются в транзакциях

## Ключевые особенности

- ✅ Реферальная система в объекте пользователя
- ✅ Только для новых пользователей
- ✅ Комиссия 1.5% (настраиваемая)
- ✅ Платформа получает 3.5%
- ✅ Нет многоуровневой системы
- ✅ История всех начислений
- ✅ Мгновенное начисление при сделке 