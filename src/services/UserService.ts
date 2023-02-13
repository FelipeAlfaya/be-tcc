import { Server } from '@core/Server';
import RouteHandleError from '@declarations/classes/RouteHandleError';
import HttpStatusCodes from '@declarations/enums/HttpStatusCode';
import { Service } from '@interfaces/Service';
import { User } from '@models/User';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UserService implements Service {
  public server: Server;

  constructor(@inject('server') server: Server) {
    this.server = server;
  }

  public async getUserInfo(userId: string): Promise<User> {
    const userRepository = await this.server.storage.provide().then(storage => {
      return storage.getRepository(User);
    });

    const user = await userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        team: true,
      },
    });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    return user;
  }

  public async createUser(user: User): Promise<User> {
    if (!user) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User data is required'
      );
    }

    if (!user.name) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User name is required'
      );
    }

    if (!user.password) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User password is required'
      );
    }

    if (!user.email) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User email is required'
      );
    }

    if (!user.cpf) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User CPF is required'
      );
    }

    const userRepository = await this.server.storage.provide().then(storage => {
      return storage.getRepository(User);
    });

    const userExists = await userRepository.findOne({
      where: {
        email: user.email,
      },
      relations: {
        team: true,
      },
    });

    if (userExists) {
      throw new RouteHandleError(
        HttpStatusCodes.CONFLICT,
        'User already exists'
      );
    }

    const _user = userRepository.create(user);

    _user.password = await this.server.shell.encrypt(user.password, 12);
    _user.token = await this.server.shell.tokenify({
      id: user.id,
    });

    return userRepository
      .save(_user)
      .then(user => {
        this.server.logger.log(
          'imp',
          `user with email ${user.email} created with success`
        );

        return user;
      })
      .catch(e => {
        this.server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          'An error occurred while attempting to create a new user'
        );
      });
  }

  async deleteUser(userId: string): Promise<User> {
    if (!userId) {
      throw new RouteHandleError(
        HttpStatusCodes.BAD_REQUEST,
        'User id is required'
      );
    }

    const userRepository = await this.server.storage.provide().then(storage => {
      return storage.getRepository(User);
    });

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    return userRepository
      .remove(user)
      .then(user => {
        this.server.logger.log('imp', 'user has been removed successfully');

        return user;
      })
      .catch(e => {
        this.server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          'An error occurred while attempting to delete an user'
        );
      });
  }

  async updateUser(userId: string): Promise<User> {
    const userRepository = await this.server.storage.provide().then(storage => {
      return storage.getRepository(User);
    });

    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new RouteHandleError(HttpStatusCodes.NOT_FOUND, 'User not found');
    }

    return userRepository
      .save(user)
      .then(user => {
        this.server.logger.log('imp', 'user has been updated successfully');

        return user;
      })
      .catch(e => {
        this.server.logger.log('err', e.message);
        throw new RouteHandleError(
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
          'An error occurred while attempting to update an user'
        );
      });
  }
}
