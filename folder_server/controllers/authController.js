const { User } = require('../models');
const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');

class AuthController {
  static async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const hashed = hashPassword(password);
      const user = await User.create({ username, email, password: hashed });
      res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user || !comparePassword(password, user.password)) {
        throw { name: "Unauthorized", message: "Invalid credentials" }
      }
      const token = signToken({ id: user.id, role: user.role });
      res.json({ 
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;