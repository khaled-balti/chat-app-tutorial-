const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const getUserDetailsFromToken = (token) => {
  if (!token) {
    return {
      message: 'Session out',
      logout: true,
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = UserModel.findById(decoded.id).select('-password');
    return user;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Handle expired token (e.g., refresh token, redirect to login)
      console.error('Token expired!');
      return null; // Or throw a specific error for handling
    } else {
      // Handle other errors
      console.error('Error verifying token:', error);
      return null;
    }
  }
};

module.exports = getUserDetailsFromToken;