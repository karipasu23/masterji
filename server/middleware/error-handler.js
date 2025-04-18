const ErrorHandler = (err, req, res, next) => {
    const statusCode = err.status ? err.status : 500;
    const message = err.message ? err.message : "Backend Error";
    const ExtraDetails = err.extraDetails ? err.extraDetails : "backend Side error";

    return res.status(statusCode).json({message , ExtraDetails});
}

module.exports = ErrorHandler;