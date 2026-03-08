const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Multer-specific errors
  if (err.name === "MulterError") {
    const messages = {
      LIMIT_FILE_SIZE:   "Image is too large. Maximum allowed size is 5 MB.",
      LIMIT_FIELD_VALUE: "Uploaded data is too large. Please use a smaller image.",
      LIMIT_FILE_COUNT:  "Too many files uploaded.",
      LIMIT_UNEXPECTED_FILE: "Unexpected file field.",
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || `Upload error: ${err.message}`,
    });
  }

  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
};

export default errorHandler;
