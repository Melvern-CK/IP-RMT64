const { User } = require('../models');
const { hashPassword, comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const { OAuth2Client } = require('google-auth-library');

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

  static async googleLogin(req, res, next) {
    try {
      const { token } = req.body;
      
      // Initialize Google OAuth client
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      // Verify the Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      const { email, name } = payload;
      
      // Check if user already exists
      let user = await User.findOne({ where: { email } });
      
      if (!user) {
        // Create new user if they don't exist
        user = await User.create({
          username: name,
          email: email,
          password: hashPassword('google-oauth-user') // placeholder password
        });
      }
      
      // Generate JWT token
      const access_token = signToken({
        id: user.id,
        username: user.username,
        email: user.email
      });
      
      res.status(200).json({
        success: true,
        access_token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
      
    } catch (err) {
      console.error('Google OAuth error:', err);
      res.status(400).json({
        success: false,
        message: 'Google authentication failed'
      });
    }
  }
}

module.exports = AuthController;