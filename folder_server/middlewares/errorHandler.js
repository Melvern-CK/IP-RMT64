module.exports = function errorHandlerMiddleware(error, req, res, next) {
    
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({ message: error.errors[0].message })
  }
  if (error.name === "NotFound") {
    return res.status(404).json({ message: error.message })
  }
  if (error.name === "BadRequest") {
    return res.status(400).json({ message: error.message })
  }
  
  if (error.name === "Unauthorized") {
    return res.status(401).json({ message: error.message })
  }
  // Error yg data dari package JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: "Invalid token" })
  }
  if (error.name === 'Forbidden') {
    return res.status(403).json({ message: error.message })
  }
  res.status(500).json({ message: 'Internal server error' })
}