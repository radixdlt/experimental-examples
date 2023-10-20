import Pino from 'pino';
import { Logger } from 'tslog';

export type AppLogger = typeof appLogger;
export const appLogger =
  process.env.NODE_ENV === 'development' ? new Logger({ minLevel: 1 }) : Pino({ level: 'trace' });
