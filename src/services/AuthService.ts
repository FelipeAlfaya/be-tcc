import { Server } from '@core/Server';
import RouteHandleError from '@declarations/classes/RouteHandleError';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Service } from '@interfaces/Service';
import { User } from '@models/User';
import { inject, injectable } from 'tsyringe';

@injectable()
export class AuthService implements Service {
  server: Server;

  constructor(@inject('server') server: Server) {
    this.server = server;
  }

  public async login(
    email: string,
    password: string
  ): Promise<{ token: string }> {
    if (!email) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Email is required'
      );
    }

    if (!password) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Password is required'
      );
    }

    const userRepository = await this.server.storage.provide().then(_ds => {
      return _ds.getRepository(User);
    });

    const user = await userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'Email not found');
    }

    const isPasswordValid = await this.server.shell.decrypt(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'Invalid password'
      );
    }

    const token = await this.server.shell.tokenify({
      id: user.id,
    });

    user.token = token;

    return userRepository.save(user).then(user => {
      return {
        token: user.token,
      };
    });
  }
}
