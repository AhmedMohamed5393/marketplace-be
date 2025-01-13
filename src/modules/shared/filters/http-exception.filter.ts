import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus, Logger,
} from '@nestjs/common';
import { LanguagesEnums } from '../enums/languages.enum';
import { MessagesArEnums } from '../enums/message-ar.enum';
import { MessagesEnEnums } from '../enums/message-en.enum';
import { ErrorClass } from '../classes/error.class';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
   
    const lang = request.headers.lang || LanguagesEnums.EN;
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const errMessage: string | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: exception };
    const errorType: string = errMessage['error'];
    let errors = [];
    let isCredentials = false;
    this.logger.error(
        `Exception caught: ${JSON.stringify({
          status,
          errorType,
          message: errMessage,
          url: request.url,
          lang,
        })}`,
    );
    if (Array.isArray(errMessage['message'])) {
      if (lang && lang === LanguagesEnums.AR) {
        for (const row of errMessage['message']) {
          // if first char in second part of the string is Capital then the key will be first two parts of the string
          // else the key will be first part of the string
          if (
            typeof row.split('_')[1] !== 'undefined' &&
            row.split('_')[1][0] === row.split('_')[1][0].toLowerCase()
          ) {
            let key = row.split('_')[0] + '_' + row.split('_')[1];
            const value = MessagesArEnums[row] ?? row;
            key =
              key != 'passwordConfirm'
                ? key.replace(/[A-Z]/g, (letter) => `${letter.toLowerCase()}`)
                : key;
            const KeyWithValue = {};
            KeyWithValue[key] = value;
            errors.push(KeyWithValue);
            continue;
          }
          let key = row.split('_')[0];

          const value = MessagesArEnums[row] ?? row;

          key =
            key != 'passwordConfirm'
              ? key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
              : key;

          const KeyWithValue = {};
          KeyWithValue[key] = value;

          errors.push(KeyWithValue);
        }
      } else {
        for (const row of errMessage['message']) {
          if (
            typeof row.split('_')[1] !== 'undefined' &&
            row.split('_')[1][0] &&
            row.split('_')[1][0] === row.split('_')[1][0].toLowerCase()
          ) {
            let key = row.split('_')[0] + '_' + row.split('_')[1];
            const value = MessagesEnEnums[row] ?? row;
            key = key.replace(/[A-Z]/g, (letter) => `${letter.toLowerCase()}`);
            const KeyWithValue = {};
            KeyWithValue[key] = value;
            errors.push(KeyWithValue);
            continue;
          }
          const key = row.split('_')[0];
          const value = MessagesEnEnums[row] ?? row;
          const KeyWithValue = {};
          KeyWithValue[key] = value;
          errors.push(KeyWithValue);
        }
      }
    } else {
      if (lang && lang === LanguagesEnums.AR) {
        if (errMessage['message'] != undefined) {
          isCredentials = true;
          const value =
            MessagesArEnums[errMessage['message']] ?? errMessage['message'];

          errors.push(value);
        } else {
          const key = Object.keys(errMessage)[0];
          const value =
            MessagesArEnums[Object.values(errMessage)[0]] ??
            Object.values(errMessage)[0];
          const KeyWithValue = {};
          KeyWithValue[key] = value;
          errors.push(KeyWithValue);
        }
      } else {
        if (errMessage['message'] != undefined) {
          isCredentials = true;
          const value =
            MessagesEnEnums[errMessage['message']] ?? errMessage['message'];

          errors.push(value);
        } else {
          const key = Object.keys(errMessage)[0];
          const value =
            MessagesEnEnums[Object.values(errMessage)[0]] ??
            Object.values(errMessage)[0];
          const KeyWithValue = {};
          KeyWithValue[key] = value;
          errors.push(KeyWithValue);
        }
      }
    }
    if (!isCredentials) {
      let finalerrorsInArrayOfOneObject = {};
      for (const row of errors) {
        finalerrorsInArrayOfOneObject = {
          ...finalerrorsInArrayOfOneObject,
          ...row,
        };
      }
      errors = [];

      errors.push(finalerrorsInArrayOfOneObject);
    }

    if (errMessage['is_verified'] == false) {
      errors = [
        {
          message: errors[0],
          is_verified: false,
          phone: errMessage['phone'],
          country_code: errMessage['country_code'],
        },
      ];
    }

    if (typeof errors[0] == 'string') {
      errors[0] = { message: errors[0] };
    }
    this.logger.debug(`Formatted errors: ${JSON.stringify(errors)}`);

    response
      .status(status)
      .send(new ErrorClass(status, errors, errorType, request.url));
  }
}
