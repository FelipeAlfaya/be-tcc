import { injectable } from 'tsyringe';
import { Formats, JetLogger, LoggerModes } from 'jet-logger';
import { env } from '@config/env';

@injectable()
export class Logger {
  public log(type: 'info' | 'warn' | 'err' | 'imp', args: string): void {
    const logger = JetLogger(
      env.logger.mode as LoggerModes,
      env.logger.filepath,
      env.logger.filepathDateTime,
      env.logger.timestamp,
      env.logger.format as Formats,
      undefined
    );

    logger[type](`${env.logger.colors.white}${args}${env.logger.colors.reset}`);
  }
}
