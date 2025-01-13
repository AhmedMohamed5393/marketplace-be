// log.entity.ts
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'logs' })
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  action: string;

  @Column()
  entity: string;

  @Column()
  user_id: string;

  @Column({ type: 'enum', enum: AuthTypeEnum, nullable: true })
  user_type: AuthTypeEnum;

  @CreateDateColumn()
  created_at: Date;
}
