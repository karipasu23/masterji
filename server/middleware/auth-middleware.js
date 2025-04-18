const validate = (schema) => async (req, res, next) => {
    try{
        const parsebody = await schema.parseAsync(req.body);
        req.body = parsebody;
        next();
    }catch (err) {
        const status = 422;
        const message = "Please fill proper details";
        const extraDetails = err.errors[0].message;
        const ErrorMsg =  {
            status, message, extraDetails
        }
        next(ErrorMsg);
    }

}

module.exports = validate;