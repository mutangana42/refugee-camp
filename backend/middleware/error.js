function notFound(req, res) {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.originalUrl} not found` } });
}

function errorHandler(error, _req, res, _next) {
  let status = error.status || 500;
  let message = error.message || 'Internal server error';

  if (error.code === 'ER_DUP_ENTRY') {
    status = 409;
    message = 'A record with that unique value already exists';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    status = 422;
    message = 'A referenced record does not exist';
  } else if (error.code === 'ER_ROW_IS_REFERENCED_2') {
    status = 409;
    message = 'This record is in use and cannot be deleted';
  } else if (error.code === 'WARN_DATA_TRUNCATED' || error.code === 'ER_TRUNCATED_WRONG_VALUE') {
    status = 422;
    message = 'One or more values have an invalid format';
  }

  if (status >= 500) console.error(error);
  res.status(status).json({ error: { message, ...(error.details && { details: error.details }) } });
}

module.exports = { notFound, errorHandler };
