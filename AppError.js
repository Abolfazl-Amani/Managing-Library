class BaseAppError extends Error{
    constructor(massage, statusCode = 500){
        super(massage);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends BaseAppError{
    constructor(id){
        super(`${id} Not Found`, 404);
        this.id = id;
    }
}

class DonNotWritingFile extends BaseAppError{
    constructor(){
        super("Don't Write File!!!")
        this.IdWriting = IdWriting
    }
}

module.exports = {
    NotFoundError,
    DonNotWritingFile
}