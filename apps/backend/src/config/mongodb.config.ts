import { registerAs } from '@nestjs/config';

export interface MongooseOptions {
  uri: string;
  useNewUrlParser?: boolean;
  useUnifiedTopology?: boolean;
  maxPoolSize?: number;
  serverSelectionTimeoutMS?: number;
  socketTimeoutMS?: number;
  bufferCommands?: boolean;
  autoIndex?: boolean;
}

export interface MongoDbConfig {
  audit: MongooseOptions;
  analytics: MongooseOptions;
}

export default registerAs(
  'mongodb',
  (): MongoDbConfig => ({
    audit: {
      uri:
        process.env.MONGO_AUDIT_URI ||
        `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${
          process.env.MONGO_AUDIT_DB || 'nestcraft_audit'
        }`,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.MONGO_AUDIT_MAX_POOL_SIZE || '10', 10),
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT || '5000', 10),
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT || '45000', 10),
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV !== 'production',
    },
    analytics: {
      uri:
        process.env.MONGO_ANALYTICS_URI ||
        `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${
          process.env.MONGO_ANALYTICS_DB || 'nestcraft_analytics'
        }`,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.MONGO_ANALYTICS_MAX_POOL_SIZE || '20', 10),
      serverSelectionTimeoutMS: parseInt(process.env.MONGO_SERVER_SELECTION_TIMEOUT || '5000', 10),
      socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT || '45000', 10),
      bufferCommands: false,
      autoIndex: process.env.NODE_ENV !== 'production',
    },
  }),
);
