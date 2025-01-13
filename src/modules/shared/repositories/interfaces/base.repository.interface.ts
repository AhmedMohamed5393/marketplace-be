import {
  InsertResult,
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

export interface BaseRepositoryInterface<T> {
  create(
    data: QueryDeepPartialEntity<T>,
    foreignKey?: string,
  ): Promise<InsertResult>;
  update({
    where,
    data,
    foreignKey,
  }: {
    where: FindOptionsWhere<T>;
    data: QueryDeepPartialEntity<T>;
    foreignKey?: string;
  }): Promise<UpdateResult>;
  findOne(params: {
    select: FindOptionsSelect<T>;
    where: FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    relationLoadStrategy?: 'join' | 'query';
    order?: FindOptionsOrder<T>;
  }): Promise<T>;
  delete(where: FindOptionsWhere<T>): Promise<DeleteResult>;
  upsert(params: {
    upsertData: QueryDeepPartialEntity<T>;
    upsertOptions: UpsertOptions<T>;
  }): Promise<InsertResult>;
  find(params: {
    select: FindOptionsSelect<T>;
    where?: FindOptionsWhere<T>;
    relations?: FindOptionsRelations<T>;
    take?: number;
    skip?: number;
    relationLoadStrategy?: 'join' | 'query';
    order?: FindOptionsOrder<T>;
  }): Promise<Array<T>>;
  save(data: T, foreignKey?: string): Promise<T>;
  transaction(
    callback: (entityManager: EntityManager) => Promise<any>,
  ): Promise<void>;
}
