import { User } from '../../entities/user.entity';
import { BaseRepositoryInterface } from './base.repository.interface';

export type UserRepositoryInterface = BaseRepositoryInterface<User>;
