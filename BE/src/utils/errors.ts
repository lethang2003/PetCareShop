export class BadRequestError extends Error {
    statusCode: number;
    constructor(message = 'Bad Request') {
      super(message);
      this.name = 'BadRequestError';
      this.statusCode = 400;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class NotFoundError extends Error {
    statusCode: number;
    constructor(message = 'Not Found') {
      super(message);
      this.name = 'NotFoundError';
      this.statusCode = 404;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export class UnauthorizedError extends Error {
    statusCode: number;
    constructor(message = 'Unauthorized') {
      super(message);
      this.name = 'UnauthorizedError';
      this.statusCode = 401;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  