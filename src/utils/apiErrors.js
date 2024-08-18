function ApirError(statusCode, message = "Something went wrong", errors = [], stack = "") {
    const error = new Error(message); // Create a new Error object

    error.statusCode = statusCode;
    error.data = null;
    error.success = false;
    error.errors = errors;

    if (stack) {
        error.stack = stack;
    } else {
        Error.captureStackTrace(error, ApirError);
    }

    return error;
}

export { ApirError };
