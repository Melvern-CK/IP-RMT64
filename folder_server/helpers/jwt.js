const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET


// Bikin token
const signToken = (data) => {
  return jwt.sign(data, SECRET)
}

// Verifikasi keaslian token
const verifyToken = (token) => {
  return jwt.verify(token, SECRET)
}

module.exports = {
  signToken, verifyToken
}