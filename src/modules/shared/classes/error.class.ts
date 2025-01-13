export class ErrorClass {
  timeStamp: string;
  status: boolean;

  constructor(
    public statusCode: number,
    public errors: string[],
    public errorType: string,
    public path: string,
  ) {
    this.statusCode = statusCode;
    this.status = false;
    this.errors = errors;
    this.path = path;
    this.errorType = errorType;
    this.timeStamp = new Date().toISOString();
  }
}
