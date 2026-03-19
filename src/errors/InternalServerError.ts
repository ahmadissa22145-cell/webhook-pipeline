export class InternalServerError extends Error {
  public readonly statusCode: number = 500;

  constructor(message: string) {
    super(message);
  }
}
