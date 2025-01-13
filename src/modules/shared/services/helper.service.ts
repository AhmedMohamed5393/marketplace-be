import * as moment from 'moment';

export class HelperService {
  public static dateFormat(date: Date): string {
    return moment(date).toLocaleString();
  }
}
