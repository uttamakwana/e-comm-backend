//* whenever next(new ErrorHandler(message, statusCode) get executed this function will be executed!) */
export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error!";
    err.statusCode || (err.statusCode = 500);
    return res.status(err.statusCode).json({ success: false, message: err.message });
};
//* creating a try-catch block utility so that we don't have to write this much amount of code every time */
export const TryCatch = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
