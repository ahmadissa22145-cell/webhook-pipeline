


export class ConflictError extends Error{

    public readonly statusCode: number = 409;

    constructor(message: string){

        super(message);
    }
}