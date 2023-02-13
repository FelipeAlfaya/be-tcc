import HttpStatusCodes from '@declarations/enums/HttpStatusCode';

class RouteHandleError extends Error {
  status: HttpStatusCodes;
  message: string;

  constructor(status: HttpStatusCodes, message: string) {
    super();
    this.message = message;
    this.status = status;
  }
}

export default RouteHandleError;
