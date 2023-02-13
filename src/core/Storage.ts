import { env } from '@config/env';
import { container, injectable } from 'tsyringe';
import { DataSource } from 'typeorm';
import { Server } from './Server';

@injectable()
export class Storage {
  private dataSource: DataSource;

  async provide(): Promise<DataSource> {
    if (this.dataSource) return this.dataSource;

    const dataSource = new DataSource({
      type: env.database.type as 'postgres',
      host: env.database.host,
      port: env.database.port,
      username: env.database.user,
      password: env.database.password,
      database: env.database.database,
      ssl: env.database.ssl,
      entities: env.database.entities as [],
      synchronize: env.database.synchronize,
      logging: env.database.logging,
    });

    return dataSource.initialize().then(dataSource => {
      const server: Server = container.resolve('server');
      server.logger.log(
        'imp',
        `Connection with database ${env.database.database} established`
      );
      this.dataSource = dataSource;
      return this.dataSource;
    });
  }

  async sync(): Promise<void> {
    await this.dataSource.synchronize().then(() => {
      const server: Server = container.resolve('server');
      server.logger.log('imp', 'Database synchronized');
    });
  }

  async restart(callback?: () => void): Promise<void> {
    await this.close(() => {
      this.provide().then(() => {
        this.sync().then(() => {
          if (callback) callback();
        });
      });
    });
  }

  async close(callback?: () => void): Promise<void> {
    await this.dataSource.destroy().then(() => {
      const server: Server = container.resolve('server');
      server.logger.log(
        'imp',
        `Connection
with database ${env.database.database} closed`
      );

      if (callback) callback();
    });
  }
}
