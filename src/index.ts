import '@scripts/pre-init';
import { Server } from '@core/Server';
import { container } from 'tsyringe';
import { env } from '@config/env';
import { TeamController } from '@controllers/TeamController';
import { UserController } from '@controllers/UserController';
import { AuthController } from '@controllers/AuthController';
import { LogController } from '@controllers/LogController';

const server = container.resolve(Server);

const onServerSync = () => {
  server.control(container.resolve(TeamController));
  server.control(container.resolve(UserController));
  server.control(container.resolve(AuthController));
  server.control(container.resolve(LogController));
};

const onServerStart = () => {
  try {
    server.storage.provide().then(() => {
      server.storage.sync().then(() => {
        onServerSync();
      });
    });
  } catch (e) {
    server.logger.log('err', e);
    server.close(() => {
      server.logger.log('info', 'Server closed due to an error');
    });
  }
};

server.start(() => {
  server.logger.log(
    'imp',
    `Server ${env.app.name} started on port ${env.port} in ${env.nodeEnv} mode`
  );
  onServerStart();
});

container.register('server', { useValue: server });
