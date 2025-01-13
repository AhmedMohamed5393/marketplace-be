import { SetMetadata } from '@nestjs/common';
import { AuthTypeEnum } from '@shared/enums/auth-type.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AuthTypeEnum[]) =>
  SetMetadata(ROLES_KEY, roles);
