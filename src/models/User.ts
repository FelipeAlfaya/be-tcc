import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import crypto from 'crypto';
import { Team } from './Team';
import { Log } from './Log';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column()
  cpf: string;

  @Column({ nullable: true })
  oab: string;

  @Column()
  token: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Team, team => team.members)
  @JoinColumn()
  team: Team;

  @OneToMany(() => Log, log => log.user)
  logs: Log[];

  constructor() {
    this.id = crypto.randomBytes(16).toString('hex');
  }
}
