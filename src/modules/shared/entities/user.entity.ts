import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { AuthTypeEnum } from '@shared/enums/index.enum';

@Entity({ name: 'users' })
export class User {
  @Index({ unique: true })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: AuthTypeEnum, default: AuthTypeEnum.USER })
  role: string;

  @Exclude()
  @Column({ type: 'varchar', length: 100, nullable: true })
  password: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
