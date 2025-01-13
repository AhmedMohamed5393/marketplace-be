import {
  BadRequestException,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';

export class DatabaseExceptionService {
  constructor(code: string, message: string, foreignKey?: string) {
    switch (code) {
      case '23505':
        return new UnprocessableEntityException({
          message: !foreignKey
            ? 'TRY_TO_ENTER_DUPLICATE_ENTRY'
            : `${foreignKey}_IS_INVALID`,
        });
      case '23503':
        return new BadRequestException({
          message: !foreignKey
            ? 'INVALID_PAYLOAD_FOR_FORIGEN_KEY'
            : `${foreignKey}_IS_INVALID`,
        });
      default:
        return new InternalServerErrorException({ message });
    }
  }
}
