 export class BaseException extends Error {
  public readonly code: string;
  public readonly timestamp: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.context = context;
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack,
    };
  }
} 