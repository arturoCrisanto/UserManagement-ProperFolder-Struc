export const sendSuccessResponse = (
  res,
  data,
  message = "Succes",
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendErrorResponse = (
  res,
  message = "Error",
  statusCode = 500,
  error = null
) => {
  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};
