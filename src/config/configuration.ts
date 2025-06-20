export default () => ({
  port: parseInt(process.env.PORT, 10) || 3003,
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || `mongodb+srv://user:${process.env.DB_PASSWORD || 'user'}@cluster0.90yplfi.mongodb.net/inskins-referral?retryWrites=true&w=majority&appName=Cluster0`,
    },
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID || 'referral-service',
    brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
    groupId: process.env.KAFKA_GROUP_ID || 'referral-group',
  },
      referral: {
      defaultCommissionRate: parseFloat(process.env.REFERRAL_COMMISSION_RATE) || 0.015,
      maxCommissionRate: parseFloat(process.env.REFERRAL_MAX_COMMISSION_RATE) || 0.1,
    minTransactionAmount: parseFloat(process.env.REFERRAL_MIN_TRANSACTION_AMOUNT) || 0,
    autoApproveCommissions: process.env.REFERRAL_AUTO_APPROVE === 'true' || true,
    linkCodeLength: parseInt(process.env.REFERRAL_CODE_LENGTH, 10) || 8,
  },
}); 