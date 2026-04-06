export class OwlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OwlError';
  }
}

export class ValidationError extends OwlError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class RoutingError extends OwlError {
  constructor(message: string) {
    super(message);
    this.name = 'RoutingError';
  }
}

export class BridgeError extends OwlError {
  constructor(message: string) {
    super(message);
    this.name = 'BridgeError';
  }
}

export class ClarificationError extends OwlError {
  constructor(message: string) {
    super(message);
    this.name = 'ClarificationError';
  }
}