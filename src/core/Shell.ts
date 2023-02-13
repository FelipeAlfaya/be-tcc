import { injectable } from 'tsyringe';
import bcrypt from 'bcryptjs';
import { env } from '@config/env';
import jwt from 'jsonwebtoken';

@injectable()
export class Shell {
  async encrypt(password: string, saltRounds?: number): Promise<string> {
    return bcrypt.hash(password, saltRounds || 10);
  }

  async decrypt(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async tokenify(data: string | object | Buffer): Promise<string> {
    return new Promise((res, rej) => {
      jwt.sign(data, env.jwt.secret, env.jwt.options, (err, token) => {
        return err ? rej(err) : res(token || '');
      });
    });
  }

  async detokenify<T>(token: string): Promise<T | undefined> {
    return new Promise((res, rej) => {
      jwt.verify(token, env.jwt.secret, (err, decoded) => {
        return err ? rej(err) : res(decoded as T);
      });
    });
  }
}
