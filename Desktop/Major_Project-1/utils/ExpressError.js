class ExpressError extends Error{
    constructor(statusCode,messege){
        super();
        this.statusCode = statusCode;
        this.message = messege;
    }
}

module.exports = ExpressError;