import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import crypto from 'crypto';
import { Log } from './Log';
import { User } from './User';

@Entity()
export class Team {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: false, select: false })
  masterPassword: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @OneToOne(() => User, user => user.team, {
    cascade: true,
  })
  @JoinColumn()
  master: User;

  @OneToMany(() => Log, log => log.team)
  logs: Log[];

  @OneToMany(() => User, user => user.team, {
    cascade: true,
  })
  members: User[];

  constructor() {
    this.id = crypto.randomBytes(16).toString('hex');
  }
}
