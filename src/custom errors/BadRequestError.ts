export class BadRequestError extends Error {
  public readonly statusCode: number = 400;

  constructor(message: string) {
    super(message);
  }
}
