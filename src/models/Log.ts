import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Team } from './Team';
import crypto from 'crypto';
import { User } from './User';

@Entity()
export class Log {
  @PrimaryColumn()
  id: string;

  @Column()
  entry: string;

  @Column({ default: new Date() })
  createdAt: Date;

  @Column({ default: new Date() })
  updatedAt: Date;

  @ManyToOne(() => Team, team => team.logs, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  team: Team;

  @ManyToOne(() => User, user => user.logs, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    cascade: true,
  })
  @JoinColumn()
  user: User;

  constructor() {
    this.id = crypto.randomBytes(16).toString('hex');
  }
}
