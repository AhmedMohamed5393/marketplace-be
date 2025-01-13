import { DatabaseExceptionService } from '@shared/services/index.service';
import {
  InsertResult,
  Repository,
  UpdateResult,
  FindOptionsWhere,
  FindOptionsSelect,
  FindOptionsRelations,
  DeleteResult,
  FindOptionsOrder,
  EntityManager,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';
import { BaseRepositoryInterface } from './interfaces/base.repository.interface';

export abstract class BaseRepository<T> implements BaseRepositoryInterface<T> {
  constructor(private readonly repository: Repository<T>) {}

  async findAndCount(params: {
    select?: FindOptionsSelect<T>;
    where?: FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    withDeleted?: boolean;
    take?: number;
    skip?: number;
    relationLoadStrategy?: 'join' | 'query';
    order?: FindOptionsOrder<T>;
  }): Promise<[T[], number]> {
    try {
      return await this.repository.findAndCount(params);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async find(params: {
    select: FindOptionsSelect<T>;
    where?: FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    withDeleted?: boolean;
    take?: number;
    skip?: number;
    relationLoadStrategy?: 'join' | 'query';
    order?: FindOptionsOrder<T>;
  }): Promise<Array<T>> {
    try {
      return await this.repository.find(params);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async create(
    data: QueryDeepPartialEntity<T>,
    foreignKey?: string,
  ): Promise<InsertResult> {
    try {
      return await this.repository.insert(data);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message, foreignKey);
    }
  }

  async update({
    where,
    data,
    foreignKey,
  }: {
    where: FindOptionsWhere<T>;
    data: QueryDeepPartialEntity<T>;
    foreignKey?: string;
  }): Promise<UpdateResult> {
    try {
      return await this.repository.update(where, data);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message, foreignKey);
    }
  }

  async findOne(params: {
    select?: FindOptionsSelect<T>;
    where: FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    relationLoadStrategy?: 'join' | 'query';
    order?: FindOptionsOrder<T>;
    withDeleted?: boolean;
  }): Promise<T> {
    try {
      const {
        select,
        where,
        relations,
        relationLoadStrategy,
        order,
        withDeleted,
      } = params;
      return await this.repository.findOne({
        where,
        select,
        relations,
        relationLoadStrategy,
        order,
        withDeleted,
      });
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async delete(where: FindOptionsWhere<T>): Promise<DeleteResult> {
    try {
      return await this.repository.delete(where);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async softDelete(ids: number | number[]) {
    try {
      return await this.repository.softDelete(ids);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async restore(id: string) {
    try {
      return await this.repository.restore(id);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async upsert(params: {
    upsertData: QueryDeepPartialEntity<T>;
    upsertOptions: UpsertOptions<T>;
  }): Promise<InsertResult> {
    try {
      const { upsertData, upsertOptions } = params;
      return await this.repository.upsert(upsertData, {
        ...upsertOptions,
        skipUpdateIfNoValuesChanged: true,
      });
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async isExist(where: FindOptionsWhere<T> | FindOptionsWhere<T>[]): Promise<boolean> {
    try {
      return await this.repository.existsBy(where);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }

  async save(data: T, foreignKey?: string): Promise<T> {
    try {
      return await this.repository.save(data);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message, foreignKey);
    }
  }

  async transaction(
    callback: (entityManager: EntityManager) => Promise<any>,
  ): Promise<void> {
    try {
      await this.repository.manager.transaction(callback);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message);
    }
  }
  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async createMany(data: T[], foreignKey?: string): Promise<T[]> {
    try {
      const items = this.repository.create(data);
      return await this.repository.save(items);
    } catch (err) {
      throw new DatabaseExceptionService(err.code, err.message, foreignKey);
    }
  }
}
