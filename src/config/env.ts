/* eslint-disable node/no-process-env */
import NodeEnv from '@declarations/enums/NodeEnv';
import { LoggerModes } from 'jet-logger';
import path from 'path';

export const env = {
  app: {
    name: process.env.APP_NAME || 'node-ts-api',
    version: process.env.APP_VERSION || '1.0.0',
  },
  nodeEnv:
    process.env.NODE_ENV === 'development'
      ? NodeEnv.Development
      : process.env.NODE_ENV === 'production'
      ? NodeEnv.Production
      : NodeEnv.Staging,
  port: Number(process.env.PORT) || 0,
  cookieProps: {
    key: process.env.COOKIE_KEY || '',
    secret: process.env.COOKIE_SECRET || '',
    options: {
      httpOnly: true,
      signed: true,
      path: process.env.COOKIE_PATH || '',
      maxAge: Number(process.env.COOKIE_EXP) || 0,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || '',
    },
  },
  cors: {
    origins: [
      'http://localhost:4200',
      'http://localhost:8888',
      'app://*',
      'http://localhost:5500',
      'chrome-extension://popfojmfoabfkamolhnbolfombjcnekg',
      'chrome-extension://jjdmgbcnhgbnmfpicneelpflnahbfkik',
      'https://projudi.tjba.jus.br',
      'https://projudi.tjba.jus.br/projudi/',
    ],
    preflightMaxAge: 5,
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    options: {
      expiresIn: Number(process.env.COOKIE_EXP) || '',
    },
  },
  database: {
    type: process.env.DB_TYPE || '',
    host: process.env.DB_HOST || '',
    port: Number(process.env.DB_PORT) || 0,
    user: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging:
      process.env.NODE_ENV !== 'production' &&
      process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true',
    entities: [path.resolve(__dirname, '../models/**/*.{ts,js}')],
  },
  logger: {
    mode: LoggerModes[process.env.JET_LOGGER_MODE || 'CONSOLE'],
    filepath: process.env.JET_LOGGER_FILEPATH || '',
    filepathDateTime: process.env.JET_LOGGER_FILEPATH_DATETIME === 'true',
    format: process.env.JET_LOGGER_FORMAT || 'LINE',
    timestamp: process.env.JET_LOGGER_TIMESTAMP === 'true',
    colors:
      process.env.JET_LOGGER_MODE === 'CONSOLE'
        ? {
            white: '\x1b[37m',
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            magenta: '\x1b[35m',
            cyan: '\x1b[36m',
            gray: '\x1b[90m',
            reset: '\x1b[0m',
          }
        : {},
  },
};
