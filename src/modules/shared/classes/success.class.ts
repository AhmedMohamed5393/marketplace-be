export class SuccessClass {
  status: boolean;
  constructor(public data?: object, public message?: string) {
    this.status = true;
    this.data = data || {};
    this.message = message || 'OPERATION_SUCCESSED';
  }
}
