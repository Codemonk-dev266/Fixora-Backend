const errorMiddleware = (req, res, next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({ message: error.message || "Internal Server Error" });
};

export default errorMiddleware;
