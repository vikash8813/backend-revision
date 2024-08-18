export const AsyncHandler = (fn) => (req,res,next) => {
    // Middleware for handling async/await errors
    return (req, res, next) => {
        Promise.resolve(next())
           .catch(err => {
                console.error(err.stack);
                res.status(500).send('Something broke!');
            });
    };
}